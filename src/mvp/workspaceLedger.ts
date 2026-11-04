/** Shared coordination record. IndexedDB reads observe commits across renderers;
 * localStorage caches can lag behind Web Lock acquisition in another tab. */
export interface WorkspaceRecord {
  raw: string;
  knownMirrors: string[];
}

let connection: Promise<IDBDatabase> | undefined;
export function workspaceLedger(): Promise<IDBDatabase> {
  if (!connection) {
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("zero-trust-mvp-coordination", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("workspace");
      request.onerror = () => reject(request.error);
      request.onblocked = () =>
        reject(new Error("Workspace storage is blocked"));
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          connection = undefined;
        };
        resolve(db);
      };
    }).catch((error) => {
      connection = undefined;
      throw error;
    });
  }
  return connection;
}

export function readWorkspaceRecord(
  db: IDBDatabase,
): Promise<WorkspaceRecord | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("workspace", "readonly");
    const request = transaction.objectStore("workspace").get("latest");
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

export function writeWorkspaceRecord(
  db: IDBDatabase,
  record: WorkspaceRecord,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("workspace", "readwrite");
    transaction.objectStore("workspace").put(record, "latest");
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function mirrorFingerprint(raw: string | null): Promise<string> {
  const bytes = new TextEncoder().encode(
    raw === null ? "missing" : `saved:${raw}`,
  );
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
