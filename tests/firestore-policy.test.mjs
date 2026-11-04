import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseForESLint } from "@firebase/eslint-plugin-security-rules/parser";

// Structural policy checks, not an emulator substitute. Parse the actual Firebase
// grammar and inspect every overlapping grant: Firestore permissions are additive.
function permissions(source) {
  const {
    services: { tree },
  } = parseForESLint(source);
  const grants = [];
  function visit(node, path = "") {
    if (node.constructor.name === "MatchRuleDeclarationContext")
      path += node.pathDecl().getText();
    if (node.constructor.name === "PermissionDeclarationContext")
      grants.push({
        path,
        operations: node.operationId().getText().split(","),
        body: node.permissionBody().getText(),
      });
    for (const child of node.children || []) visit(child, path);
  }
  visit(tree);
  return grants;
}
const source = readFileSync(
  new URL("../firestore.rules", import.meta.url),
  "utf8",
);
const grants = permissions(source);

test("Firebase rules parse with the official grammar", () => {
  assert.ok(grants.length > 0);
  assert.throws(() =>
    permissions("rules_version = broken; service cloud.firestore {"),
  );
});
for (const collection of ["datasets", "pipelines", "jobs", "artifacts"]) {
  test(`${collection} deny every client mutation, including overlapping wildcard grants`, () => {
    const databasePrefix = "/databases/{database}/documents";
    const matching = grants.filter(
      (grant) =>
        grant.path === databasePrefix ||
        grant.path.startsWith(`${databasePrefix}/${collection}/`) ||
        (grant.path.startsWith(databasePrefix) && grant.path.includes("=**")),
    );
    assert.ok(
      matching.some((grant) =>
        grant.path.startsWith(`${databasePrefix}/${collection}/`),
      ),
    );
    for (const operation of ["create", "update", "delete"]) {
      const writes = matching.filter(
        (grant) =>
          grant.operations.includes(operation) ||
          grant.operations.includes("write"),
      );
      assert.ok(writes.length > 0);
      for (const grant of writes)
        assert.equal(
          grant.body,
          ":iffalse",
          `${operation} must be denied at ${grant.path}`,
        );
    }
  });
}
