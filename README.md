# conventionalize

Reads your staged git diff and writes your conventional commit message for you.

Works as a **VS Code extension** (one-click button in the commit box) and a **terminal CLI**.

---

## Why I made this

Most git commit tools either:
1. Make you answer 5 questions every single commit (`commitizen`, `git-cz`). Great in theory, annoying when you're committing 20 times a day.
2. Complain *after* you already wrote the message (`commitlint`, `husky`).

I wanted something in between: stage my changes, have it look at the actual diff, and suggest `type(scope): subject` in one step so I don't have to think about it.

---

## Usage

### In VS Code

1. Stage your changes.
2. Click the sparkle button right in the commit input box (or hit `Ctrl+Alt+C` / `Cmd+Alt+C`).
3. It fills the box. Tweak if needed and commit.

If you have GitHub Copilot enabled in VS Code, it uses that. If not, it uses fast local heuristics (offline, zero API keys needed), or your own Gemini / OpenAI key from settings.

### In the terminal

```bash
# run without installing
npx conventionalize

# or install globally
npm install -g conventionalize
```

Stage files, then run:

```bash
git add .
conventionalize
```

It looks like this:

```text
conventionalize

Staged files (2):
  modified src/parser.ts (+15/-2)
  added    tests/parser.test.ts (+35/-0)

Suggested Commit Message:
  feat(core): implement git diff hunk parser and test suite

? Action:
  ❯ Commit change (git commit -m ...)
    Edit header (type, scope, description)
    Print commit text
    Cancel
```

#### Other handy CLI flags:

- `conventionalize --raw`: prints just the message to stdout (great for shell scripts or custom aliases).
- `conventionalize hook install`: writes a `.git/hooks/prepare-commit-msg` so standard `git commit` auto-suggests messages.

---

## How it works

When you run it, Conventionalize looks at the staged diff:

1. **Default (Heuristic)**: Runs locally. Parses file paths, touched extensions, test frameworks, and patch keywords (`fix`, `bug`, etc.) to infer type and scope. Instant, works offline, needs no keys.
2. **AI (Copilot / Gemini / OpenAI)**: If you prefer an LLM to read the diff and summarize the intent, set `provider` to `vscode-lm`, `gemini`, or `openai`.

---

## Configuration

Settings live in `~/.gcairc` for the CLI, or VS Code settings (`Ctrl+,` -> search `conventionalize`):

```json
{
  "provider": "heuristic",
  "model": "gemini-3.7-flash",
  "ticketPrefix": "PROJ-123",
  "defaultScope": "core"
}
```

- `provider`: `heuristic`, `vscode-lm`, `gemini`, or `openai`.
- `apiKey`: your Gemini or OpenAI API key (not needed for heuristic or VS Code Copilot).
- `ticketPrefix`: automatically prepends Jira/Linear issue IDs (e.g. `[PROJ-123] feat: ...`).
- `defaultScope`: fallback scope when changes span multiple folders.

---

## Project structure

The repo is a minimal monorepo:

- `packages/core`: pure diff parser + heuristic classifier (no heavy dependencies).
- `packages/vscode`: the VS Code extension.
- `packages/cli`: the terminal tool.

### Building locally

```bash
git clone https://github.com/akil4/conventionalize.git
cd conventionalize
npm install
npm run build
npm test
```

To build the `.vsix` extension:

```bash
cd packages/vscode
npx vsce package
```

---

## License

MIT © akil4
