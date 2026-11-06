# conventionalize

> **Diff to Conventional Commit Generator** powered by deterministic heuristics, VS Code Language Models (GitHub Copilot), Google Gemini, and OpenAI.

Conventionalize inspects `git diff --staged` before you commit. It analyzes changed file paths, status, and patch hunks to propose a fully formatted Conventional Commit message (`type(scope): subject`) in a single step.

Available as:
- 🚀 **[VS Code Extension](#vs-code-extension)**: 1-click button directly inside the VS Code Source Control commit box.
- 💻 **[Terminal CLI](#terminal-cli)**: Interactive CLI with autocompletion, history tracking, and Git hooks.
- 📦 **[@conventionalize/core](#core-package)**: Lightweight, zero-heavy-dependency classification engine for custom integrations.

---

## Architecture (Dual-Package Monorepo)

```
conventionalize/
├── packages/
│   ├── core/       # @conventionalize/core — Heuristics, diff parser, and AI engine
│   ├── cli/        # conventionalize — Terminal CLI (Commander + Inquirer + Chalk)
│   └── vscode/     # conventionalize-vscode — VS Code extension (SCM input box integration)
├── tests/          # Shared test suite (Vitest)
└── package.json    # Monorepo workspaces definition
```

---

## VS Code Extension

The fastest way to use Conventionalize. No terminal switching required.

```
┌────────────────────────────────────────────────────────┐
│ SOURCE CONTROL                                    ...  │
├────────────────────────────────────────────────────────┤
│ [ feat(core): implement diff parser              ] [✨] │ ◄── Click to generate
│                                                        │
│ [ Commit & Push ]                                      │
├────────────────────────────────────────────────────────┤
│ STAGED CHANGES (2)                                     │
│   src/parser.ts                                        │
│   tests/parser.test.ts                                 │
└────────────────────────────────────────────────────────┘
```

### Features
- **1-Click Generation**: Adds a sparkle (`✨`) button directly in the Git commit message input box header.
- **Built-in Language Models (`vscode.lm`)**: Works with GitHub Copilot models already in VS Code — no personal API keys required!
- **Offline Heuristics**: Falls back to instant, zero-latency deterministic heuristics with zero network calls.
- **Keyboard Shortcut**: Press `Ctrl+Alt+C` (`Cmd+Alt+C` on macOS) anywhere to populate the commit message.

### Building & Installing the VS Code Extension Locally

```bash
# Build the workspace
npm install
npm run build

# Package the extension
cd packages/vscode
npx @vscode/vsce package

# Install in VS Code
code --install-extension conventionalize-vscode-1.0.0.vsix
```

---

## Terminal CLI

### Installation

Install globally via npm:

```bash
npm install -g conventionalize
```

Or run directly without installing using `npx`:

```bash
npx conventionalize
```

### Usage

Stage your changes and run `conventionalize`:

```bash
git add .
conventionalize
```

Sample interactive session:

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

#### Direct stdout mode (for shell scripts):

```bash
conventionalize --raw
```

#### Git hook installation:

Automate `git commit` so it pre-populates commit headers using Conventionalize:

```bash
conventionalize hook install
```

---

## Core Package (`@conventionalize/core`)

If you want to build custom integrations (e.g. CI bots, Git hooks, JetBrains plugins, or Agent MCP servers):

```typescript
import { parseGitDiff, classifyDiff, generateCommitMessage } from '@conventionalize/core';

// Pure offline heuristic classification (zero network latency)
const diff = parseGitDiff(rawDiffString);
const message = classifyDiff(diff);
console.log(message.formatted); // "feat(auth): add OAuth2 provider"
```

---

## Development & Testing

```bash
# Install dependencies across all packages
npm install

# Build all packages (core, cli, vscode)
npm run build

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## License

MIT © akil4
