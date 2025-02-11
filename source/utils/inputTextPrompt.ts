import { createChatPrompt } from "llm-exe";

const addSchemaString = `The schema specification below defines the format you are expected to respond with.
{{>JsonSchema key='schema'}}

Review the request and then respond as valid JSON per the schema. For example:
{{>JsonSchemaExampleJson key='schema'}}`


export function inputTextPrompt(messages: string | any[], history: any[] = [], addSchemaToSystem = false) {
  const prompt = createChatPrompt("", { allowUnsafeUserTemplate: true, });

  if (typeof messages === "string") {
    if(addSchemaToSystem){
      messages = `${messages}\n\n${addSchemaString}`
    }
    prompt.addSystemMessage(messages);
  } else if (Array.isArray(messages)) {
    if (messages.every((a) => typeof a === "string")) {
      let [system, user, assistant] = messages;
      if (system) {
        if(addSchemaToSystem){
          system = `${system}\n\n${addSchemaString}`
        }
        prompt.addSystemMessage(system);
      }
      if (user) {
        prompt.addUserMessage(user);
      }
      if (assistant) {
        prompt.addAssistantMessage(assistant);
      }
    } else if (messages.every((a) => typeof a === "object" && "role" in a && "content" in a)) {
      if(addSchemaToSystem){
        messages[0].content = `${messages[0].content}\n\n${addSchemaString}`
      }
      prompt.addFromHistory(messages);
    }
  }

  if(history && history.length){
    prompt.addFromHistory(history);
  }
  return prompt;
}
