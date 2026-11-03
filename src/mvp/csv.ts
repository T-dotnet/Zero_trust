import Papa from "papaparse";

export function parseDatasetCsv(text: string): { rows: number } {
  const parsed = Papa.parse<string[]>(text, {
    delimiter: ",",
    skipEmptyLines: "greedy",
  });
  if (parsed.errors.length)
    throw new Error(
      "The CSV contains invalid quoting. Check the file and try again.",
    );
  const [header, ...records] = parsed.data;
  if (!header?.length || records.length === 0)
    throw new Error("The CSV needs a header and at least one data row.");
  const names = header.map((name) => name.trim());
  if (names.some((name) => !name) || new Set(names).size !== names.length)
    throw new Error("CSV header names must be nonempty and unique.");
  if (records.some((row) => row.length !== header.length))
    throw new Error(
      "Every CSV row must have the same number of fields as the header.",
    );
  return { rows: records.length };
}

export function encodeCsv(rows: string[][]): string {
  return Papa.unparse(rows, { newline: "\r\n" });
}
