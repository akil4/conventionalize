# conventionalize

A terminal CLI tool that reads staged git diffs and suggests Conventional Commit header messages using local heuristic rules or an LLM.

---

## Motivation and prior art

Existing git commit tools fall into two main categories:

1. **Interactive prompts (`commitizen`, `git-cz`)**: These require answering multiple interactive questions for every single commit (selecting type, scope, subject, body, breaking changes). This adds friction for small, frequent atomic commits.
2. **Git hooks (`husky`, `commitlint`)**: These validate commit messages after you write them, but do not help write or format the message.

`conventionalize` bridges this gap by inspecting `git diff --staged` before you commit. It analyzes changed file paths, status, and patch hunks to propose a fully formatted Conventional Commit message (`type(scope): subject`) in one step.

---

## Installation

### From local source directory (recommended)

Clone the repository and install locally:

```bash
git clone https://github.com/akil4/conventionalize.git
cd conventionalize
npm install
npm run build
sudo npm install -g .
```

### From GitHub release archive or Git URL

Install directly from the GitHub repository archive:

```bash
npm install -g https://github.com/akil4/conventionalize/archive/refs/tags/v1.0.0.tar.gz
```

Or enable git dependencies in npm and install via git URL:

```bash
npm config set allow-remote true
npm config set allow-git true
npm install -g git+https://github.com/akil4/conventionalize.git
```

---

## Usage

### Interactive mode (default)

Stage your changes and run `conventionalize`:

```bash
git add .
conventionalize
```

Sample terminal interface:

```text
conventionalize

Staged files (2):
  modified src/core/parser.ts (+15/-2)
  added    tests/parser.test.ts (+35/-0)

Suggested Commit Message:
  feat(core): implement git diff hunk parser and test suite

? Action:
  ❯ Commit change (git commit -m ...)
    Edit header (type, scope, description)
    Print commit text
    Cancel
```

### Direct stdout mode

To output the formatted commit header directly to standard output for use in shell scripts:

```bash
conventionalize --raw
```

### Verbose telemetry mode

To view patch size, file counts, provider selection, and analysis latency:

```bash
conventionalize --debug
```

### Git hook installation

To automate `git commit` so it pre-populates commit headers using `conventionalize`:

```bash
conventionalize hook install
```

This writes a `.git/hooks/prepare-commit-msg` hook in the current repository.

---

## Configuration

Settings are stored in `~/.gcairc`. You can configure settings interactively or view active values:

```bash
conventionalize config
conventionalize config --list
```

Configuration schema:

```json
{
  "provider": "heuristic",
  "model": "gemini-3.7-flash",
  "maxSummaryLength": 72,
  "maxDiffChars": 6000,
  "defaultScope": "core",
  "ticketPrefix": "PROJ-123",
  "autoCopy": false,
  "includeBody": true,
  "debug": false
}
```

### Configuration fields

- `provider`: Classification engine to use (`heuristic`, `gemini`, `openai`).
- `apiKey`: API key for Gemini or OpenAI providers.
- `model`: Target LLM model name (e.g. `gemini-3.7-flash`, `gemini-3.5-flash-lite`, `gpt-4o-mini`, `o3-mini`).
- `defaultScope`: Fallback scope when path inference yields no common top-level directory.
- `ticketPrefix`: Prefix prepended to commit subjects (e.g., `[PROJ-123]`).
- `maxDiffChars`: Truncation limit for diff patches sent to LLM providers (default: 6000).

---

## Shell autocompletion

Generate shell tab completion scripts for bash or zsh:

```bash
# zsh completion
conventionalize completion zsh > ~/.zsh/completion/_conventionalize

# bash completion
conventionalize completion bash > /etc/bash_completion.d/conventionalize
```

---

## Trade-offs and limitations

- **Diff size truncation**: Diffs exceeding `maxDiffChars` (default: 6,000 characters) are truncated. For large structural refactors spanning multiple packages, break changes into smaller atomic commits.
- **Non-git directories**: `conventionalize` requires an active git working tree. Running the tool outside a git repository exits with code 1.
- **Offline classification bounds**: The default local heuristic classifier relies on path structures and patch keywords. For ambiguous refactors without clear file additions or bug fix keywords, an LLM provider yields higher semantic precision.

---

## Testing

Run the test suite using Vitest:

```bash
npm test
```

Build the TypeScript executable:

```bash
npm run build
```

---

## License

MIT © akil4
