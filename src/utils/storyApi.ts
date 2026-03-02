import type { ImportStoryResponse, StoryCatalogItem } from "../types/library";

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

export async function fetchStoryCatalog(): Promise<StoryCatalogItem[]> {
  const response = await fetch(`${API_BASE}/api/stories`);
  if (!response.ok) {
    throw new Error(`Failed to load stories: ${response.status}`);
  }
  const payload = (await response.json()) as { stories: StoryCatalogItem[] };
  return payload.stories;
}

export async function importStoryZip(file: File): Promise<ImportStoryResponse> {
  return importStoryZipWithProgress(file);
}

export function importStoryZipWithProgress(
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<ImportStoryResponse> {
  return new Promise((resolve) => {
    const formData = new FormData();
    formData.append("package", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/import`);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const pct = Math.round((event.loaded / event.total) * 100);
      onProgress(Math.min(100, Math.max(0, pct)));
    };

    xhr.onerror = () => {
      resolve({ ok: false, error: "Network error during import" });
    };

    xhr.onload = () => {
      let payload: ImportStoryResponse = { ok: false, error: "Invalid response" };
      try {
        payload = JSON.parse(xhr.responseText) as ImportStoryResponse;
      } catch {
        // ignored
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        resolve({
          ok: false,
          error: payload.error ?? `Import failed: ${xhr.status}`,
          warnings: payload.warnings,
        });
        return;
      }

      resolve(payload);
    };

    xhr.send(formData);
  });
}
