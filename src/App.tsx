import { useState } from "react";
import { StoryViewer } from "./components/StoryViewer";
import { StoryLibrary } from "./components/StoryLibrary";

/**
 * App — Root component.
 *
 * Renders the StoryViewer with the path to a story JSON file.
 * To switch stories, change the `storyUrl` prop.
 *
 * The story JSON and video assets live in `public/stories/<story-name>/`.
 */
function App() {
  const [activeStoryUrl, setActiveStoryUrl] = useState<string | null>(null);

  if (!activeStoryUrl) {
    return <StoryLibrary onOpenStory={setActiveStoryUrl} />;
  }

  return (
    <StoryViewer
      storyUrl={activeStoryUrl}
      onExit={() => setActiveStoryUrl(null)}
    />
  );
}

export default App;
