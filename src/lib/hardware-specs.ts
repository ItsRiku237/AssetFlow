/**
 * Hardware specification constants for structured asset fields.
 * Used by the form (client), validation (server), and detail display.
 *
 * Storage strategy:
 *   - Known predefined value  → stored verbatim, e.g. "Intel Core i7", "16 GB"
 *   - User-entered custom val → stored verbatim after trim/validation
 *   - Not applicable          → field left null / cleared
 *
 * On form load, a value is "custom" if it isn't in the predefined list.
 */

// Asset types that warrant hardware specification fields.
const HARDWARE_KEYWORDS = [
  "laptop",
  "desktop",
  "mobile",
  "tablet",
  "phone",
  "workstation",
  "server",
  "computer",
  "chromebook",
  "macbook",
  "imac",
  "macmini",
  "mac mini",
  "mac pro",
  "mac studio",
  "surface",
  "thinkpad",
];

export function isHardwareAsset(type: string): boolean {
  if (!type) return false;
  const lower = type.toLowerCase();
  return HARDWARE_KEYWORDS.some((kw) => lower.includes(kw));
}

// ──────────────────────────── Processor ─────────────────────────────

export const PROCESSOR_LIST = [
  // Intel
  "Intel Core i3",
  "Intel Core i5",
  "Intel Core i7",
  "Intel Core i9",
  "Intel Xeon",
  // AMD
  "AMD Ryzen 3",
  "AMD Ryzen 5",
  "AMD Ryzen 7",
  "AMD Ryzen 9",
  "AMD EPYC",
  "AMD Threadripper",
  // Apple
  "Apple M1",
  "Apple M1 Pro",
  "Apple M1 Max",
  "Apple M1 Ultra",
  "Apple M2",
  "Apple M2 Pro",
  "Apple M2 Max",
  "Apple M2 Ultra",
  "Apple M3",
  "Apple M3 Pro",
  "Apple M3 Max",
  "Apple M4",
  "Apple M4 Pro",
  "Apple M4 Max",
  // Qualcomm
  "Qualcomm Snapdragon X Elite",
  "Qualcomm Snapdragon X Plus",
  "Qualcomm Snapdragon 8 Gen 3",
] as const;

export const PROCESSOR_CUSTOM_SENTINEL = "__custom__";
export const PROCESSOR_NA_SENTINEL = "__na__";

// ──────────────────────────── RAM ───────────────────────────────────

export const RAM_OPTIONS = [
  "4 GB",
  "8 GB",
  "16 GB",
  "32 GB",
  "64 GB",
  "128 GB",
] as const;

export const RAM_CUSTOM_SENTINEL = "__custom__";
export const RAM_NA_SENTINEL = "__na__";

// ──────────────────────────── Storage ───────────────────────────────

export const STORAGE_OPTIONS = [
  "128 GB",
  "256 GB",
  "512 GB",
  "1 TB",
  "2 TB",
  "4 TB",
] as const;

export const STORAGE_CUSTOM_SENTINEL = "__custom__";
export const STORAGE_NA_SENTINEL = "__na__";

// ──────────────────────────── Storage Type ──────────────────────────

export const STORAGE_TYPE_OPTIONS = [
  "SSD",
  "HDD",
  "NVMe SSD",
  "eMMC",
] as const;

export const STORAGE_TYPE_CUSTOM_SENTINEL = "__custom__";
export const STORAGE_TYPE_NA_SENTINEL = "__na__";

// ──────────────────────────── Helpers ───────────────────────────────

/** Returns true if the stored value is in the predefined list. */
export function isKnownProcessor(value: string): value is (typeof PROCESSOR_LIST)[number] {
  return (PROCESSOR_LIST as readonly string[]).includes(value);
}

export function isKnownRam(value: string): value is (typeof RAM_OPTIONS)[number] {
  return (RAM_OPTIONS as readonly string[]).includes(value);
}

export function isKnownStorage(value: string): value is (typeof STORAGE_OPTIONS)[number] {
  return (STORAGE_OPTIONS as readonly string[]).includes(value);
}

export function isKnownStorageType(value: string): value is (typeof STORAGE_TYPE_OPTIONS)[number] {
  return (STORAGE_TYPE_OPTIONS as readonly string[]).includes(value);
}

/** Format a storage summary, e.g. "512 GB" + "NVMe SSD" → "512 GB NVMe SSD". */
export function formatStorageSummary(
  storage: string | null,
  storageType: string | null
): string | null {
  if (!storage && !storageType) return null;
  if (storage && storageType) return `${storage} ${storageType}`;
  return storage ?? storageType;
}
