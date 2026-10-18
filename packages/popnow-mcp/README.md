# @popnow/mcp

`@popnow/mcp` is a tiny local stdio bridge to the [PopNow](https://popnow.ai) remote MCP server
(`https://api.popnow.ai/mcp`). It lets MCP clients that only start local stdio servers use PopNow's
AI image, video, music and speech tools.

The bridge has no tools of its own: it forwards every MCP message to the remote server with your API key,
so the tool list, prices and confirmations always match the live service.

> Not published to npm yet. Build it from source (below), or use the generic `mcp-remote` bridge.

If your client supports remote (Streamable HTTP) servers, you do not need this package. Add
`https://api.popnow.ai/mcp` directly and sign in with OAuth. See the [main README](https://github.com/popnow-ai/popnow-mcp#readme).

## Usage

```bash
npm install
npm run build   # writes dist/cli.js
```

```json
{
  "mcpServers": {
    "popnow": {
      "command": "node",
      "args": ["/absolute/path/to/popnow-mcp/packages/popnow-mcp/dist/cli.js"],
      "env": { "POPNOW_API_KEY": "sk-popnow-..." }
    }
  }
}
```

| Variable | Required | Description |
| --- | --- | --- |
| `POPNOW_API_KEY` | yes | A PopNow API key from [popnow.ai/api/console/keys](https://popnow.ai/api/console/keys) |
| `POPNOW_MCP_URL` | no | Override the endpoint (default `https://api.popnow.ai/mcp`) |

`node dist/cli.js --help` prints the same information. Diagnostics go to stderr; stdout carries only MCP messages.

## Programmatic use

```ts
import { createBridge } from "./dist/index.js";

const bridge = createBridge({ apiKey: process.env.POPNOW_API_KEY! });
await bridge.start();
```

## Development

```bash
npm install
npm test   # builds with tsc, then runs an end-to-end test against a local fake MCP server
```

## License

MIT
