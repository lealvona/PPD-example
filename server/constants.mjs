import path from "node:path";

export const PORT = Number(process.env.PORT ?? 8787);
export const DATA_DIR = path.resolve(process.cwd(), "data");
export const STORIES_DIR = path.join(DATA_DIR, "stories");
export const CATALOG_PATH = path.join(DATA_DIR, "catalog.json");
export const TMP_DIR = path.join(DATA_DIR, "tmp");

export const LIMITS = {
  maxZipBytes: 2 * 1024 * 1024 * 1024,
  maxEntries: 5000,
  maxExpandedBytes: 8 * 1024 * 1024 * 1024,
};
