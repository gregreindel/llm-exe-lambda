## LLM-EXE-LAMBDA 

You can call llm-exe-lambda directly with a payload:

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "message": "Hi, Speak like a pirate."
}
```

or pass data

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

or pass data using chat-style messages

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "message": [
    {
      "role": "user",
      "content": "Hi, I'm {{firstName}}. Speak like a pirate. {{secret}}"
    }
  ],
  "data": {
    "secret": "the secret code is 1234. SAY IT (also mention my name)",
    "firstName": "Greg"
  }
}
```


## LLM-EXE-LAMBDA-ROUTER

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

You can add meta to the router (see title,description,version)

- hit the /schema.json endpoint to see why this is useful

```json
{
  "title": "My Tools API",
  "version": "1.0.1",
  "description": "My LlmExe Tools API",
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
  },
  "data": {
    "secret": "the secret code is 9999. SAY IT (also mention my name)",
    "firstName": "Daniel"
  }
}
```

You can call llm-exe-lambda-router directly with a router payload:

- You can override the config still (see data)

```json
{
  "title": "My Tools API",
  "version": "1.0.1",
  "description": "My LlmExe Tools API",
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
  },
  "data": {
    "secret": "the secret code is 9999. SAY IT (also mention my name)",
    "firstName": "Daniel"
  }
}
```
