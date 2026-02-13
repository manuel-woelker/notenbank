export const NOTENBANK_DB_NAME = 'notenbank'
export const NOTENBANK_EXAMPLE_DB_NAME = 'notenbank-example'
export const NOTENBANK_DB_VERSION = 8

/* 📖 # Why is ensureNotenbankStores a no-op?
 *
 * RxDB manages its own schema and collections internally. Store/collection
 * creation is handled lazily by each RxDBRepository instance when it calls
 * db.addCollections(). This function is kept for API compatibility since
 * repository configs still reference it as onUpgrade.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ensureNotenbankStores(_db: IDBDatabase) {
  // No-op: RxDB manages collections internally
}
