export type DialogueRole = "system" | "assistant" | "user";

export interface DialogueEntry {
  role: DialogueRole;
  content: string;
}

export const rolesMap: Record<string, DialogueRole> = {
  "System:": "system",
  "Assistant:": "assistant",
  "User:": "user",
};

/**
 * Parse body of text into dialogue entries.
 * - Looks for prompt start / end tags (optional).
 * - Identifies lines starting with "System:", "Assistant:", or "User:"
 *   (case-insensitive, allowing leading whitespace).
 * - Accumulates subsequent lines under the last identified role.
 * - Trims whitespace on final content for each entry.
 */
export function parseDialogue(input: string): DialogueEntry[] {
  const promptStartTag = "<!-- prompt start -->";
  const promptEndTag = "<!-- prompt end -->";

  let promptStartIndex = input.indexOf(promptStartTag);
  if (promptStartIndex === -1) {
    promptStartIndex = 0;
  }
  let promptEndIndex = input.indexOf(promptEndTag, promptStartIndex);
  if (promptEndIndex === -1) {
    promptEndIndex = input.length;
  }

  // Extract the relevant portion of the input (between start and end tags, if any)
  const dialogueBlock = input.substring(
    promptStartIndex + (promptStartIndex > 0 ? promptStartTag.length : 0),
    promptEndIndex
  );

  const lines = dialogueBlock.split(/\r?\n/);
  const dialogueEntries: DialogueEntry[] = [];
  let currentEntry: DialogueEntry | null = null;

  // Helper function to detect and extract role from a line
  function detectRoleFromLine(line: string): DialogueRole | null {
    const trimmedStart = line.trimStart();
    // Try each known marker in a case-insensitive manner
    for (const [marker, role] of Object.entries(rolesMap)) {
      // Compare ignoring case/leading spaces
      const markerLower = marker.toLowerCase();
      if (
        trimmedStart.toLowerCase().startsWith(markerLower) &&
        // Also ensure we match the exact marker (including colon)
        trimmedStart.slice(0, marker.length).toLowerCase() === markerLower
      ) {
        return role;
      }
    }
    return null;
  }

  // Iterate over each line and build up dialogue entries
  for (let line of lines) {
    // If line is empty, just continue accumulating
    if (!line.trim()) {
      if (currentEntry) {
        currentEntry.content += "\n";
      }
      continue;
    }

    const role = detectRoleFromLine(line);
    if (role) {
      // If there's an existing entry, finalize it
      if (currentEntry) {
        // Trim the accumulated content before pushing
        currentEntry.content = currentEntry.content.trim();
        if (currentEntry.content) {
          dialogueEntries.push(currentEntry);
        }
      }
      // Start a new entry
      // Remove the recognized marker portion from the line, preserving original spacing after the role marker
      const markerUsed = Object.keys(rolesMap).find(
        (m) =>
          line.trimStart().toLowerCase().startsWith(m.toLowerCase()) &&
          line.trimStart().slice(0, m.length).toLowerCase() === m.toLowerCase()
      )!;
      const startIdx =
        line.toLowerCase().indexOf(markerUsed.toLowerCase()) +
        markerUsed.length;

      // The content after the role marker, preserving trailing text on that same line
      const content = line.slice(startIdx);

      currentEntry = {
        role,
        content: content.trim(),
      };
    } else if (currentEntry) {
      // Continue adding lines to the current entry
      currentEntry.content += "\n" + line;
    } else {
      // If no current entry is being tracked and no role is detected,
      // we'll ignore these lines. Or you could optionally decide to group them
      // under a default role, or store them somewhere else.
    }
  }

  // Push the last entry if it has content
  if (currentEntry && currentEntry.content.trim() !== "") {
    currentEntry.content = currentEntry.content.trim();
    dialogueEntries.push(currentEntry);
  }

  return dialogueEntries;
}
