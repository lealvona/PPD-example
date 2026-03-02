import fs from "node:fs/promises";
import { CATALOG_PATH } from "./constants.mjs";

async function ensureCatalog() {
  try {
    await fs.access(CATALOG_PATH);
  } catch {
    await fs.writeFile(CATALOG_PATH, JSON.stringify({ stories: [] }, null, 2));
  }
}

export async function getCatalog() {
  await ensureCatalog();
  const raw = await fs.readFile(CATALOG_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.stories) ? parsed.stories : [];
}

export async function addStoryToCatalog(story) {
  const stories = await getCatalog();
  const deduped = stories.filter((item) => item.id !== story.id);
  deduped.unshift(story);
  await fs.writeFile(
    CATALOG_PATH,
    JSON.stringify({ stories: deduped }, null, 2),
    "utf8"
  );
}
