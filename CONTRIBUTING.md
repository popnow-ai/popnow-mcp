# Contributing

Thanks for helping improve the PopNow MCP Server docs and the `@popnow/mcp` bridge.

- **Client setup broke?** Clients change their config formats often. Open an issue (or a PR against
  `README.md` and `examples/`) with the client name, its version and what you saw.
- **Bridge changes** live in `packages/popnow-mcp`. Keep it small: it forwards MCP messages and nothing else.
  ```bash
  cd packages/popnow-mcp
  npm install
  npm test
  ```
- **Tool behavior, prices or models** are decided by the hosted server at `https://api.popnow.ai/mcp`, not by
  this repository. Report those as issues and we will route them.
- Never paste a real API key into an issue, PR, test or example. Use `sk-popnow-...`.

By contributing you agree that your contributions are licensed under the MIT License.
