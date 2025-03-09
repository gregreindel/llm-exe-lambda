You can call llm-exe-lambda directly with a payload:

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "message": "Hi, I'm {{firstName}}. Speak like a pirate. {{secret}}",
  "data": {
    "secret": "the secret code is 1234. SAY IT (also mention my name)",
    "firstName": "Greg"
  }
}
```

````json


You can call llm-exe-lambda-router directly with a router payload:

```json
{
    "routes": {
        "talk-like-pirate": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "message": "Hi, I'm {{firstName}}. Speak like a pirate. {{secret}}",
            "data": {
                "secret": "the secret code is 1234. SAY IT (also mention my name)",
                "firstName": "Greg"
            }
        },
        "talk-like-cat": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "message": "Hi, I'm {{firstName}}. Speak like a cat. {{secret}}",
            "data": {
                "secret": "the secret code is 1234. SAY IT (also mention my name)",
                "firstName": "Greg"
            }
        }
    }
}
````
