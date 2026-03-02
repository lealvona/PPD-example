package com.example.cyoacreator

import java.time.LocalDate

object StructuredMarkdownParser {
  /*
   * Minimal supported format:
   *
   * # Title: Story Name
   * # Author: Name
   * # Description: Short description
   *
   * ## node:intro:start
   * Subtitle line
   * -> choice_id | Choice label | target_node
   *
   * ## node:ending_good:ending
   * The end subtitle
   */
  fun parse(input: String): StoryDefinition {
    val lines = input.lines()
    val title = lines.firstOrNull { it.startsWith("# Title:") }
      ?.substringAfter(":")?.trim().orEmpty().ifBlank { "Untitled Story" }
    val author = lines.firstOrNull { it.startsWith("# Author:") }
      ?.substringAfter(":")?.trim().orEmpty().ifBlank { "Unknown" }
    val description = lines.firstOrNull { it.startsWith("# Description:") }
      ?.substringAfter(":")?.trim().orEmpty().ifBlank { "" }

    val nodes = mutableListOf<StoryNode>()
    var currentId = ""
    var currentType = "video"
    var currentSubtitle: String? = null
    var currentChoices = mutableListOf<Choice>()

    fun flushNode() {
      if (currentId.isBlank()) return
      nodes += StoryNode(
        id = currentId,
        title = currentId.replace("_", " ").replaceFirstChar { it.uppercaseChar() },
        type = currentType,
        videoFile = "$currentId.mp4",
        subtitle = currentSubtitle,
        choices = currentChoices.toList()
      )
      currentChoices = mutableListOf()
      currentSubtitle = null
    }

    for (line in lines) {
      if (line.startsWith("## node:")) {
        flushNode()
        val nodeMeta = line.removePrefix("## node:").trim().split(":")
        currentId = nodeMeta.getOrNull(0).orEmpty()
        currentType = nodeMeta.getOrNull(1).orEmpty().ifBlank { "video" }
      } else if (line.startsWith("-> ")) {
        val segments = line.removePrefix("-> ").split("|").map { it.trim() }
        val id = segments.getOrNull(0).orEmpty()
        val label = segments.getOrNull(1).orEmpty()
        val target = segments.getOrNull(2).orEmpty()
        if (id.isNotBlank() && label.isNotBlank() && target.isNotBlank()) {
          currentChoices += Choice(id = id, label = label, targetNodeId = target)
        }
      } else if (line.isNotBlank() && !line.startsWith("#")) {
        currentSubtitle = if (currentSubtitle == null) line.trim() else "$currentSubtitle ${line.trim()}"
      }
    }
    flushNode()

    val startNodeId = nodes.firstOrNull { it.type == "start" }?.id
      ?: nodes.firstOrNull()?.id
      ?: "intro"

    return StoryDefinition(
      meta = StoryMeta(
        title = title,
        description = description,
        author = author,
        version = "1.0.0",
        date = LocalDate.now().toString()
      ),
      config = StoryConfig(),
      startNodeId = startNodeId,
      nodes = nodes
    )
  }
}
