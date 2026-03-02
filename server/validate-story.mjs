export function validateStoryShape(story) {
  const issues = [];
  if (!story || typeof story !== "object") {
    issues.push("Story payload must be an object");
    return issues;
  }

  if (!story.meta?.title) issues.push("Missing meta.title");
  if (!story.config?.videoBasePath) issues.push("Missing config.videoBasePath");
  if (!story.startNodeId) issues.push("Missing startNodeId");
  if (!Array.isArray(story.nodes) || story.nodes.length === 0) {
    issues.push("Story must include at least one node");
    return issues;
  }

  const nodes = new Map();
  for (const node of story.nodes) {
    if (!node.id) {
      issues.push("Node without id");
      continue;
    }
    if (nodes.has(node.id)) {
      issues.push(`Duplicate node id: ${node.id}`);
    }
    nodes.set(node.id, node);
  }

  if (!nodes.has(story.startNodeId)) {
    issues.push(`startNodeId not found: ${story.startNodeId}`);
  }

  for (const node of story.nodes) {
    if (!node.videoFile) {
      issues.push(`Node ${node.id} missing videoFile`);
    }
    if (!Array.isArray(node.choices)) {
      issues.push(`Node ${node.id} choices must be an array`);
      continue;
    }
    for (const choice of node.choices) {
      if (!choice.targetNodeId || !nodes.has(choice.targetNodeId)) {
        issues.push(
          `Node ${node.id} has choice targeting unknown node: ${choice.targetNodeId}`
        );
      }
    }
  }

  return issues;
}
