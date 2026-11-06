# Conventionalize for VS Code

Generate structured, standardized **Conventional Commit** messages directly inside Visual Studio Code with a single click.

Powered by:
- **Instant Offline Heuristics**: Deterministic local rule engine (zero latency, zero API keys required).
- **VS Code Language Model (`vscode.lm`)**: Integrates directly with GitHub Copilot models already installed in VS Code.
- **Direct LLM APIs**: Support for Google Gemini (Gemini 3.7 Flash, 3.5 Flash-Lite, 3.1 Pro) and OpenAI (GPT-4o, GPT-4o-mini).

---

## Features

- **Inline Source Control Button**: Adds a sparkle (`✨`) icon directly in the Git commit message input box.
- **Auto-Populate SCM**: Clicking the button or pressing `Ctrl+Alt+C` (`Cmd+Alt+C` on macOS) analyzes your staged Git diff and fills the commit message box automatically.
- **Customizable Scopes & Ticket Prefixes**: Automatically prefixes issues (`[PROJ-123]`) or infers scopes (`feat(auth): ...`).
- **Supports Staged & Unstaged Diff Analysis**: Warns and prompts if you haven't staged changes yet.

---

## How to Use

1. Stage your changes in VS Code (`git add` or the `+` button in the Source Control view).
2. Click the **Conventionalize** sparkle icon in the commit message box header, or press `Ctrl+Alt+C` (`Cmd+Alt+C` on Mac).
3. The conventional commit header is immediately generated and filled in:
   ```text
   feat(core): implement git diff hunk parser and test suite
   ```
4. Review, adjust if needed, and press `Ctrl+Enter` to commit!

---

## Extension Settings

You can customize Conventionalize via VS Code Settings (`Ctrl+,` -> search for `Conventionalize`):

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `conventionalize.provider` | enum | `heuristic` | `heuristic`, `vscode-lm` (Copilot), `gemini`, or `openai` |
| `conventionalize.geminiApiKey` | string | `""` | Google Gemini API key |
| `conventionalize.openaiApiKey` | string | `""` | OpenAI API key |
| `conventionalize.model` | string | `gemini-3.7-flash` | Target LLM model name |
| `conventionalize.ticketPrefix` | string | `""` | Prefix for Jira/Linear tickets (e.g. `JIRA-101`) |
| `conventionalize.defaultScope` | string | `""` | Fallback scope if inference returns none |
| `conventionalize.includeBody` | boolean | `false` | Include file stats & breakdown in the commit body |
| `conventionalize.autoCommit` | boolean | `false` | Automatically commit immediately after generating |

---

## Packaging into a `.vsix`

To build the extension package locally:

```bash
npm install -g @vscode/vsce
npm run build
cd packages/vscode
vsce package
```

Then install in VS Code via:
```bash
code --install-extension conventionalize-vscode-1.0.0.vsix
```
