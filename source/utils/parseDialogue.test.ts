import { DialogueEntry, parseDialogue } from "./parseDialogue";

describe("parseDialogue", () => {
  it("returns empty array for empty input", () => {
    const result = parseDialogue("");
    expect(result).toEqual([]);
  });

  it("returns empty array for input without roles or tags", () => {
    const result = parseDialogue("Random text without roles");
    expect(result).toEqual([]);
  });

  it("parses simple dialogue with exact markers", () => {
    const input = `
System: This is system
Assistant: Hello from assistant
User: Hello from user
`;
    const result = parseDialogue(input);
    expect(result).toEqual<DialogueEntry[]>([
      { role: "system", content: "This is system" },
      { role: "assistant", content: "Hello from assistant" },
      { role: "user", content: "Hello from user" },
    ]);
  });

  it("handles multiple lines for each role", () => {
    const input = `
System: This is system
still system
Assistant: Hello from assistant
next line for assistant
User: Hello from user
another line
`;
    const result = parseDialogue(input);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      role: "system",
      content: "This is system\nstill system",
    });
    expect(result[1]).toEqual({
      role: "assistant",
      content: "Hello from assistant\nnext line for assistant",
    });
    expect(result[2]).toEqual({
      role: "user",
      content: "Hello from user\nanother line",
    });
  });

  it("handles prompt start and end tags, ignoring outside content", () => {
    const input = `
This line is outside the prompt
<!-- prompt start -->
System: Within prompt
Assistant: Also within prompt
<!-- prompt end -->
User: Outside prompt
`;
    const result = parseDialogue(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      role: "system",
      content: "Within prompt",
    });
    expect(result[1]).toEqual({
      role: "assistant",
      content: "Also within prompt",
    });
  });

  it("works if prompt start tag is missing but end tag is present", () => {
    const input = `
System: Before prompt end
<!-- prompt end -->
User: After prompt end
`;
    // Because there's no start tag, it will read from the beginning of text until the end tag
    // So "System: Before prompt end" should be included
    const result = parseDialogue(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      role: "system",
      content: "Before prompt end",
    });
  });

  it("works if prompt end tag is missing but start tag is present", () => {
    const input = `
<!-- prompt start -->
System: In the prompt
User: Also in prompt
`;
    // Because there's no prompt end tag, it will read from the prompt start until the end of the text
    const result = parseDialogue(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      role: "system",
      content: "In the prompt",
    });
    expect(result[1]).toEqual({
      role: "user",
      content: "Also in prompt",
    });
  });

  it("trims whitespace in final content", () => {
    const input = `
System:   First line    
Second line      
Assistant:    Assistant line    
`;
    const result = parseDialogue(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      role: "system",
      content: "First line\nSecond line",
    });
    expect(result[1]).toEqual({
      role: "assistant",
      content: "Assistant line",
    });
  });


  it("handles lines that only contain whitespace", () => {
    const input = `
System: Hello

  (white space lines in between)

User: Bye
`;
    const result = parseDialogue(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      role: "system",
      content: "Hello\n\n  (white space lines in between)",
    });
    expect(result[1]).toEqual({
      role: "user",
      content: "Bye",
    });
  });

  it("is case-insensitive for role markers and allows leading spaces", () => {
    const input = `
  system: Lowercase line
  Assistant: Another line
     USER: user line 
`;
    const result = parseDialogue(input);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      role: "system",
      content: "Lowercase line",
    });
    expect(result[1]).toEqual({
      role: "assistant",
      content: "Another line",
    });
    expect(result[2]).toEqual({
      role: "user",
      content: "user line",
    });
  });

  it("handles consecutive markers without extra lines in between", () => {
    const input = `
System: Sys content
Assistant: Asst content
User: Usr content
System: Next sys content
`;
    const result = parseDialogue(input);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({
      role: "system",
      content: "Sys content",
    });
    expect(result[1]).toEqual({
      role: "assistant",
      content: "Asst content",
    });
    expect(result[2]).toEqual({
      role: "user",
      content: "Usr content",
    });
    expect(result[3]).toEqual({
      role: "system",
      content: "Next sys content",
    });
  });

  it("correctly ignores lines before prompt start if the start tag is found later", () => {
    const input = `
System: Not included
<!-- prompt start -->
System: Included
<!-- prompt end -->
System: Also not included
`;
    const result = parseDialogue(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      role: "system",
      content: "Included",
    });
  });

  it("correctly ignores lines after prompt end if the end tag is found earlier", () => {
    const input = `
<!-- prompt start -->
Assistant: Before end
<!-- prompt end -->
Assistant: After end
`;
    const result = parseDialogue(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      role: "assistant",
      content: "Before end",
    });
  });
});
