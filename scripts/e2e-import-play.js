#!/usr/bin/env node

import { zipSync, strToU8 } from "fflate";

const API = process.env.CYOA_API_BASE || "http://localhost:8787";

function createInMemoryPackageZip() {
  const story = {
    meta: {
      title: "E2E Draft",
      description: "Smoke test story",
      author: "CI",
      version: "1.0.0",
      date: "2026-03-02",
    },
    config: {
      videoBasePath: "videos",
      preloadNext: true,
      defaultVolume: 1,
      allowRevisit: true,
      choiceLeadTime: 0,
    },
    startNodeId: "intro",
    nodes: [
      {
        id: "intro",
        title: "Intro",
        type: "start",
        videoFile: "intro.mp4",
        choices: [
          {
            id: "to_end",
            label: "Finish",
            targetNodeId: "end",
          },
        ],
      },
      {
        id: "end",
        title: "End",
        type: "ending",
        videoFile: "end.mp4",
        choices: [],
      },
    ],
  };

  const manifest = {
    packageVersion: "1.0",
    storyFile: "story.json",
    videoDirectory: "videos",
    completeness: "incomplete",
    generatedAt: new Date().toISOString(),
    missingAssets: ["intro.mp4", "end.mp4"],
  };

  return zipSync({
    "story.json": strToU8(JSON.stringify(story, null, 2)),
    "package.manifest.json": strToU8(JSON.stringify(manifest, null, 2)),
  });
}

async function main() {
  const zipBytes = createInMemoryPackageZip();
  const form = new FormData();
  form.append("package", new Blob([zipBytes], { type: "application/zip" }), "e2e-draft.zip");

  const importResponse = await fetch(`${API}/api/import`, {
    method: "POST",
    body: form,
  });

  const importJson = await importResponse.json();
  if (!importResponse.ok || !importJson.ok) {
    throw new Error(`Import failed: ${JSON.stringify(importJson)}`);
  }

  const catalogResponse = await fetch(`${API}/api/stories`);
  const catalogJson = await catalogResponse.json();
  if (!catalogResponse.ok || !Array.isArray(catalogJson.stories)) {
    throw new Error(`Catalog fetch failed: ${JSON.stringify(catalogJson)}`);
  }

  const found = catalogJson.stories.find((s) => s.id === importJson.story.id);
  if (!found) {
    throw new Error("Imported story not found in catalog");
  }

  if (found.completeness !== "incomplete") {
    throw new Error(`Expected incomplete story, got ${found.completeness}`);
  }

  console.log("E2E import/play smoke test passed", {
    storyId: found.id,
    storyUrl: found.storyUrl,
    completeness: found.completeness,
  });
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
