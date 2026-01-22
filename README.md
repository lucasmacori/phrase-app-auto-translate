# phrase-app-auto-translate

A simple tool that fetches your untranslated keys on phrase app, automatically translates them in the required languages with DeepL and sends them to PhraseApp.

## Requirements

- NodeJS 18+

## Setup

All configuration is done through the **.env** config file.

- Simply copy the **.env.example** file and update the PhraseApp and DeepL API keys.
- Also change the main language (if needed).
- Add your PhraseApp project id.

## Run the tool

Translate all untranslated keys:

```shell
npm run start
```

Translate a specific key:

```shell
npm run start -- --key "your.key.name"
# or
npm run start -- -k "your.key.name"
```

## Warranty

This tool comes with absolutely no warranty.
It is free to use and to update for your own use.
You are responsible for the way you use it, correctly or not.
