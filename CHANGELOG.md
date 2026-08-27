# Changelog

All notable changes to `conventionalize` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-30

### Added
- Staged git diff parser supporting added, modified, deleted, and renamed file status tracking.
- Fast offline heuristic rule classifier that categorizes commits into standard conventional commit types (`feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`).
- Automatic scope inference derived from modified directory structures.
- Support for OpenAI (`gpt-4o-mini`, `gpt-4o`, `o3-mini`) and Google Gemini (`gemini-3.7-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-pro`) API integrations.
- `--debug` flag for detailed diff statistics and latency telemetry logging.
- Ticket prefix configuration (`ticketPrefix`) to format commit subjects with project issue keys.
- Git `prepare-commit-msg` hook installer via `conventionalize hook install`.
- Shell autocompletion script generator via `conventionalize completion <zsh|bash>`.
- Multi-repo commit history tracking and Markdown changelog exporter.
