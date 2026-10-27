# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Agent Plugins v1 and Gemini CLI extension manifests for the existing hosted
  MCP service, plus native Hermes OAuth and Gemini installation instructions.
- A Cline installation guide and a 400 by 400 brand icon for marketplace review.
- Documentation for the free style-preset tools `find_skills` (find ready-made Agent Skills for what the user wants to make, with preview links) and `use_skill` (the chosen preset's playbook, a short-lived download link with install commands, and which PopNow tools run its generation steps), including the find, pick and use flow with an example conversation.

### Changed

- Prices follow PopNow's new credit unit: 1 credit = $0.001 (it was $0.01), so every credit amount changed. Typical costs and examples are updated (an image about 48 credits, a 5-second video about 185, a song about 72), and the auto-start limit is now 300 credits (it was 30).
- The tool summary no longer gives a fixed tool count.

## [0.1.0] - 2026-10-19

### Added

- Setup guide for Claude, Claude Desktop, Claude Code, ChatGPT, Cursor, VS Code, Windsurf, Cline and Codex CLI.
- Ready-to-copy client configs in `examples/`.
- `server.json` manifest for the MCP registry (remote Streamable HTTP endpoint).
- `@popnow/mcp` 0.1.0: a stdio bridge to `https://api.popnow.ai/mcp` using `POPNOW_API_KEY`, with an end-to-end test (published on npm).
