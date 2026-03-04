import { useState, useCallback } from "react";
import { StoryViewer } from "./components/StoryViewer";
import { StoryLibrary } from "./components/StoryLibrary";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { ErrorBoundary } from "./components/ErrorBoundary";
import type { StoryCatalogItem } from "./types/library";

/**
 * App — Root component.
 *
 * Renders the StoryViewer with the path to a story JSON file.
 * To switch stories, change the `storyUrl` prop.
 *
 * The story JSON and video assets live in `public/stories/<story-name>/`.
 */
function App() {
  const [activeStory, setActiveStory] = useState<StoryCatalogItem | null>(null);
  const [analyticsStory, setAnalyticsStory] = useState<StoryCatalogItem | null>(null);

  const handleShortcut = useCallback((key: string) => {
    // Handle global keyboard shortcuts
    switch (key) {
      case 'escape':
        if (activeStory) {
          setActiveStory(null);
        } else if (analyticsStory) {
          setAnalyticsStory(null);
        }
        break;
      case '?':
        console.log('Keyboard shortcuts help');
        break;
      default:
        break;
    }
  }, [activeStory, analyticsStory]);

  const handleViewAnalytics = useCallback((story: StoryCatalogItem) => {
    setAnalyticsStory(story);
  }, []);

  const handleCloseAnalytics = useCallback(() => {
    setAnalyticsStory(null);
  }, []);

  return (
    <ErrorBoundary>
      <KeyboardShortcuts onShortcut={handleShortcut} />
      
      {analyticsStory ? (
        <AnalyticsDashboard
          storyKey={`${analyticsStory.id ?? analyticsStory.meta.title}::${analyticsStory.meta.version}`}
          storyTitle={analyticsStory.meta.title}
          onClose={handleCloseAnalytics}
        />
      ) : !activeStory ? (
        <StoryLibrary 
          onOpenStory={setActiveStory}
          onViewAnalytics={handleViewAnalytics}
        />
      ) : (
        <StoryViewer
          storyUrl={activeStory.storyUrl}
          storyCompleteness={activeStory.completeness}
          onExit={() => setActiveStory(null)}
        />
      )}
    </ErrorBoundary>
  );
}

export default App;
