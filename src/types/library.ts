export interface StoryCatalogItem {
  id: string;
  storyUrl: string;
  importedAt: string;
  completeness: "complete" | "incomplete";
  meta: {
    title: string;
    description: string;
    author: string;
    version: string;
    estimatedMinutes?: number;
    tags?: string[];
  };
}

export interface ImportStoryResponse {
  ok: boolean;
  story?: StoryCatalogItem;
  warnings?: string[];
  error?: string;
}
