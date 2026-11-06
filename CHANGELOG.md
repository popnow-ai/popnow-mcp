# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package uses [Semantic Versioning](https://semver.org/).

## [0.2.2] - 2026-11-06

### Fixed

- `server.json` now follows the repository tags, so the release publishes to the MCP Registry. The v0.2.1 tag failed that check.

## [0.2.1] - 2026-11-05

### Changed

- Credit pack prices in the README and `llms.txt` now match popnow.ai/pricing ($10 Starter to $100 Pro).
- The Gemini CLI extension manifest version now follows the repository tags.

## [0.2.0] - 2026-11-01

### Added

- Agent Plugins v1 and Gemini CLI extension manifests for the existing hosted
  MCP service, plus native Hermes OAuth and Gemini installation instructions.
- A Cline installation guide and a 400 by 400 brand icon for marketplace review.
- Documentation for the free style-preset tools `find_skills` (find ready-made Agent Skills for what the user wants to make, with preview links) and `use_skill` (the chosen preset's playbook, a short-lived download link with install commands, and which PopNow tools run its generation steps), including the find, pick and use flow with an example conversation.

### Changed

- This repository is now the consumer guide only: sign in with your PopNow account (OAuth) and spend website
  credits, in the ChatGPT and Claude apps or any MCP client. API key setups, examples and the `@popnow/mcp`
  stdio bridge moved to [popnow-api-mcp](https://github.com/popnow-ai/popnow-api-mcp), the developer server at
  `https://api.popnow.ai/api/v1/mcp` billed in USD.
- `server.json` 0.2.0 lists the remote endpoint with OAuth sign-in only: no `Authorization` header and no npm package.
- `https://api.popnow.ai/mcp` still accepts API keys until 31 January 2027 so existing setups keep working while they move.
- Prices follow PopNow's new credit unit: 1 credit = $0.001 (it was $0.01), so every credit amount changed. Typical costs and examples are updated (an image about 48 credits, a 5-second video about 185, a song about 72), and the auto-start limit is now 300 credits (it was 30).
- The tool summary no longer gives a fixed tool count.

### Removed

- `packages/popnow-mcp` and the API key examples (`claude-desktop.json`, `cursor-api-key.mcp.json`,
  `generic-api-key.json`, `vscode-api-key.mcp.json`); they now live in popnow-api-mcp.

## [0.1.0] - 2026-10-19

### Added

- Setup guide for Claude, Claude Desktop, Claude Code, ChatGPT, Cursor, VS Code, Windsurf, Cline and Codex CLI.
- Ready-to-copy client configs in `examples/`.
- `server.json` manifest for the MCP registry (remote Streamable HTTP endpoint).
- `@popnow/mcp` 0.1.0: a stdio bridge to `https://api.popnow.ai/mcp` using `POPNOW_API_KEY`, with an end-to-end test (published on npm).
