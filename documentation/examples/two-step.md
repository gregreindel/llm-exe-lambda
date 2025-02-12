

```json
{
  "data": {
    "topic.$": "$.topic"
  },
  "output": "json",
  "message": [
    "You are performing research about a topic to write an article. Search Google so you can learn more about the topic. The topic is: {{ topic }} "
  ],
  "schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "default": "none",
        "description": "The query you would like to use as the google search."
      },
      "explanation": {
        "type": "string",
        "default": "none",
        "description": "Act like you are working with a colleague. Explain to them what you need to do."
      },
      "thought": {
        "type": "string",
        "default": "none",
        "description": "Explain your thoughts in first-person"
      }
    },
    "required": [
      "query",
      "explanation",
      "thought"
    ],
    "additionalProperties": false
  }
}
```

```json
{
  "data": {
    "debug": true,
    "topic.$": "$.topic",
    "previousIdeaExplaination.$": "$.step1.result.explanation",
    "previousIdeaQuery.$": "$.step1.result.query"
  },
  "output": "json",
  "message": [
    "You are performing research about a topic to write an article. Search Google so you can learn more about the topic. The topic is: {{ topic }}.\n\nHere is your previous idea, it was bad: query: \"{{previousIdeaQuery}}\"\nexplaination: \"{{previousIdeaExplaination}}\". Make sure the new idea is better."
  ],
  "schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "default": "none",
        "description": "The query you would like to use as the google search."
      },
      "explanation": {
        "type": "string",
        "default": "none",
        "description": "Act like you are working with a colleague. Explain to them what you need to do."
      },
      "thought": {
        "type": "string",
        "default": "none",
        "description": "Explain your thoughts in first-person"
      }
    },
    "required": [
      "query",
      "explanation",
      "thought"
    ],
    "additionalProperties": false
  }
}
```