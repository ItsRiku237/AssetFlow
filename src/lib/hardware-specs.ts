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

// ──────────────────────────── Asset Types ───────────────────────────

export const ASSET_TYPE_LIST = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Printer",
  "Scanner",
  "Speaker",
  "Headphones",
  "Webcam",
  "Microphone",
  "Phone",
  "Tablet",
  "UPS",
  "Router",
  "Switch",
  "Server",
  "External HDD",
  "USB Hub",
  "Docking Station",
  "Projector",
  "Graphics Card",
  "RAM Module",
  "SSD",
  "Software License",
  "Other",
] as const;

// ──────────────────────────── Brands by Type ────────────────────────

const COMMON_BRANDS: Record<string, string[]> = {
  Laptop: [
    "Apple",
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Acer",
    "Microsoft",
    "Samsung",
    "LG",
    "Razer",
    "MSI",
    "Toshiba",
  ],
  Desktop: ["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "MSI"],
  Monitor: [
    "Dell",
    "Samsung",
    "LG",
    "Asus",
    "Acer",
    "HP",
    "BenQ",
    "ViewSonic",
    "AOC",
    "Philips",
  ],
  Keyboard: ["Logitech", "Apple", "Microsoft", "Corsair", "Razer", "Keychron", "HP", "Dell"],
  Mouse: ["Logitech", "Apple", "Microsoft", "Corsair", "Razer", "HP", "Dell"],
  Printer: ["HP", "Canon", "Epson", "Brother", "Xerox", "Kyocera"],
  Scanner: ["HP", "Canon", "Epson", "Brother", "Fujitsu"],
  Speaker: ["JBL", "Bose", "Sony", "Samsung", "Apple", "Logitech", "Creative", "Harman Kardon"],
  Headphones: ["Sony", "Bose", "Apple", "Sennheiser", "Audio-Technica", "Jabra", "JBL"],
  Webcam: ["Logitech", "Microsoft", "Razer", "Elgato", "Sony"],
  Microphone: ["Blue", "Audio-Technica", "Rode", "Sennheiser", "Shure", "Logitech"],
  Phone: ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Realme"],
  Tablet: ["Apple", "Samsung", "Lenovo", "Microsoft", "Google", "Amazon"],
  UPS: ["APC", "Eaton", "CyberPower", "Vertiv"],
  Router: ["TP-Link", "Cisco", "Netgear", "Asus", "D-Link"],
  Switch: ["Cisco", "TP-Link", "Netgear", "D-Link", "HP"],
  Server: ["Dell", "HP", "Lenovo", "IBM", "Fujitsu"],
  Projector: ["Epson", "Benq", "Optoma", "Sony", "Panasonic"],
};

/** Get brand suggestions for a given asset type. Returns [] for unknown types. */
export function getBrandsForType(type: string): string[] {
  return COMMON_BRANDS[type] ?? [];
}

/** Spec localStorage key prefix – avoids clashes with other app data. */
export const SPEC_STORAGE_PREFIX = "af_spec_custom_";
