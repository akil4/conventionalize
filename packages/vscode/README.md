# Conventionalize for VS Code

Generates Conventional Commit headers (`feat(core): subject`) directly from your staged git diff with one click.

---

## How it works

1. Stage your changes in the Source Control view (`git add`).
2. Click the sparkle (`✨`) icon in the commit message box, or press `Ctrl+Alt+C` (`Cmd+Alt+C` on macOS).
3. The commit message appears in the input box. Review it, adjust if you want, and press `Ctrl+Enter` to commit.

---

## AI & Offline modes

- **Offline Heuristics (default)**: Zero network calls, zero API keys. Classifies based on file paths, changed symbols, and diff hunks.
- **VS Code Language Models (`vscode.lm`)**: If you already use GitHub Copilot in VS Code, it will use your active Copilot model without needing extra API keys.
- **Gemini / OpenAI**: You can also plug in your own Gemini or OpenAI API key in the extension settings.

---

## Settings

Search for `conventionalize` in VS Code settings (`Ctrl+,`):

- `conventionalize.provider`: `heuristic`, `vscode-lm`, `gemini`, `openai`.
- `conventionalize.ticketPrefix`: optional ticket tag like `PROJ-123` (produces `feat(core): [PROJ-123] ...`).
- `conventionalize.defaultScope`: fallback scope if multiple directories are modified.
- `conventionalize.includeBody`: appends list of changed files and stats to the commit body.
- `conventionalize.autoCommit`: commits immediately after generation (off by default).

---

## License

MIT © akil4
