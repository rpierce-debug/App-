# EnglishTutorBot

A lightweight Swift command-line chatbot that helps learners practice English. It can provide grammar notes, vocabulary explanations, quick sentence checks, and short practice prompts.

## Requirements
- Swift 6 (tested with Swift 6.2 on Linux)

## Setup
Install dependencies and compile using Swift Package Manager:

```bash
swift build
```

## Usage
Run the chatbot from the repository root:

```bash
swift run EnglishTutorBot
```

Then type prompts such as:
- `quiz` to get a practice question
- `give me a tip` for a study suggestion
- `meaning of concise` for a vocabulary definition
- `check: i go to gym yesterday` to receive quick feedback
- `exit` to end the session

The bot stores one practice question at a time, so you can answer, ask for a hint with `hint`, or skip with `skip`.

## CI on GitHub
A GitHub Actions workflow builds and tests the Swift package on pushes and pull requests to the `main` branch using Swift 6.2.
