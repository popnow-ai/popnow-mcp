<p align="center">
  <a href="https://popnow.ai">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/popnow-wordmark-light.png">
      <source media="(prefers-color-scheme: light)" srcset="assets/popnow-wordmark.png">
      <img src="assets/popnow-wordmark.png" alt="PopNow" width="280">
    </picture>
  </a>
</p>

<h1 align="center">PopNow MCP Server — AI image, video & music generation for ChatGPT, Claude, Cursor and any MCP client</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-Streamable%20HTTP-6f42c1.svg" alt="MCP Streamable HTTP"></a>
  <a href="packages/popnow-mcp"><img src="https://img.shields.io/badge/TypeScript-stdio%20bridge-3178c6.svg" alt="TypeScript"></a>
  <a href="https://popnow.ai"><img src="https://img.shields.io/badge/site-popnow.ai-ff5a5f.svg" alt="popnow.ai"></a>
</p>

**The PopNow MCP Server is a hosted Model Context Protocol server at `https://api.popnow.ai/mcp` that lets ChatGPT, Claude, Cursor, VS Code and any other MCP client create AI images, videos, songs and voiceovers on [PopNow](https://popnow.ai), using your PopNow credits.**

Ask in plain words ("turn this photo into a 5-second video", "make an upbeat synth-pop track") and the assistant picks the right PopNow tool, tells you the price, and returns the result in the chat. There is nothing to host: the server is remote, signs you in with OAuth 2.1, and uses the same models, prices and library as [popnow.ai](https://popnow.ai). Make it pop.

This repository contains the public setup guide, copy-paste client configs in [`examples/`](examples), an [MCP registry manifest](server.json), and [`@popnow/mcp`](packages/popnow-mcp), a tiny optional stdio bridge for clients that only run local servers.

## Contents

- [Quickstart](#quickstart)
- [Tools](#tools)
- [Connect your client](#connect-your-client): [Claude](#claude-web-desktop-and-mobile) · [Claude Desktop (local)](#claude-desktop-local-config) · [Claude Code](#claude-code) · [ChatGPT](#chatgpt) · [Cursor](#cursor) · [VS Code](#vs-code) · [Windsurf](#windsurf) · [Cline](#cline) · [Codex CLI](#codex-cli) · [Other clients](#other-clients-and-your-own-code)
- [Authentication](#authentication)
- [Credits, prices and confirmation](#credits-prices-and-confirmation)
- [Example prompts](#example-prompts)
- [The stdio bridge (`@popnow/mcp`)](#the-stdio-bridge-popnowmcp)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Quickstart

1. **Copy the server URL:** `https://api.popnow.ai/mcp`
2. **Add it to your client** as a remote (Streamable HTTP) MCP server. For example, in Claude Code:
   ```bash
   claude mcp add --transport http popnow https://api.popnow.ai/mcp
   ```
3. **Sign in and ask.** Your client opens a PopNow sign-in page the first time; press **Allow**, then ask for a picture, a video or a song.

No PopNow account yet? Sign up at [popnow.ai](https://popnow.ai) and pick a [credit pack](https://popnow.ai/pricing) when you need more credits.

| | |
| --- | --- |
| Server URL | `https://api.popnow.ai/mcp` |
| Transport | Streamable HTTP, stateless (`POST` only; `GET` and `DELETE` return `405`) |
| Sign-in | OAuth 2.1 with PKCE and dynamic client registration, or `Authorization: Bearer sk-popnow-...` |
| Scopes | `generate` (create with your credits) and `read` (balance, creations, model list) |
| Tools | 12 (listed below) |
| Price | Same credits as popnow.ai. Up to 30 credits starts at once; anything above waits for your yes |

## Tools

| Tool | What it does | Key parameters | Typical cost |
| --- | --- | --- | --- |
| `create_image` | Make a new picture from a description | `prompt`, `aspect_ratio` (default `1:1`), `model`, `max_credits` | about 8 credits (default Nano Banana 2.1) |
| `edit_image` | Change a photo with words: new style, outfit, background, add or remove things | `prompt`, `image_url` / `image`, `more_image_urls`, `aspect_ratio`, `model`, `max_credits` | about 8 credits |
| `create_video` | Make a short video from a description, or bring a photo to life (text-to-video and image-to-video) | `prompt`, `image_url` / `image`, `duration_seconds` (default 5), `aspect_ratio` (default `16:9`), `model`, `max_credits` | about 28 credits for 5 s (default MiniMax H3); 1 to 3 minutes |
| `create_music` | Make an original song or instrumental track | `prompt`, `lyrics`, `instrumental`, `voice` (`female` / `male`), `title`, `max_credits` | about 11 credits per song (Suno v6) |
| `create_speech` | Turn text into natural speech in many voices and languages | `text`, `voice` (Kore, Puck, Charon, Aoede, Fenrir, Leda ...), `style` (`whisper`, `empathetic`, `vocal_smile`, `newscaster`, `promo_hype`, `deadpan`), `max_credits` | a few credits, priced by length |
| `apply_effect` | Turn a photo into a trending effect video (Zombie Turn, Flying Car, Tiny Planet, Molten Gold, Hyperdrive ...) or a photo makeover (Clay Figure, Pixel Art ...) | `effect` (name or id), `image_url` / `image`, `max_credits` | priced per effect; get the exact quote first |
| `remove_background` | Cut out the subject and make the background transparent | `image_url` / `image`, `max_credits` | 1 credit |
| `upscale` | Make a photo or video sharper and bigger | `image_url` / `image` or `video_url`, `size` (photos `2k`, `4k`, `8k`; videos `720p`, `1080p`, `2k`, `4k`), `max_credits` | about 2 credits for a photo; videos by length |
| `get_job` | Check on a creation that is still running and return it when ready | `job_id`, `wait_seconds` (0 to 50, default 30) | free |
| `list_my_creations` | Show your recent PopNow creations with links | `kind` (`image`, `video`, `audio`), `limit` (1 to 20, default 10) | free |
| `check_balance` | Show how many credits you have left (and how many are held for running jobs) | none | free |
| `list_models` | List the image, video and audio models, or every effect, with prices | `category` (`image`, `video`, `audio`, `effects`) | free |

- **Models.** Every generation tool that takes `model` accepts a PopNow model id from `list_models`, so "use Seedance" or "make it with Wan" just works. Models include Kling, Seedance, Wan, Vidu, MiniMax, Nano Banana, GPT Image, Flux, Suno and more; the live list is always `list_models` (or `GET /api/v1/models` on the [REST API](https://popnow.ai/docs/openapi)).
- **Photos in.** `image_url` takes a public `https` link or a `popnow://` link from an earlier result. In ChatGPT, an attached photo arrives as the `image` file object.
- **Results out.** Images come back inline as a preview plus a download link; videos and audio come back as links. Each result also has a permanent `popnow://` link you can pass to another tool ("now animate that picture"). Everything is saved in your [PopNow library](https://popnow.ai/assets).
- **Annotations.** All tools carry the standard MCP hints. `get_job`, `list_my_creations`, `check_balance` and `list_models` are read-only, and no tool deletes anything.
- **Effects** cover the same set as the [Effects page](https://popnow.ai/effects). Two-person effects need two placed photos and are website-only.

## Connect your client

Every client below talks to the same remote server. OAuth sign-in is the default; each section also shows the API key alternative (see [Authentication](#authentication)). Ready-made files are in [`examples/`](examples).

### Claude (web, desktop and mobile)

Custom connectors are available on Claude plans and workspaces that allow them.

1. Open **Settings → Connectors** ([claude.ai/settings/connectors](https://claude.ai/settings/connectors)) in Claude on the web or in the desktop app.
2. Click **Add custom connector**, name it `PopNow` and paste `https://api.popnow.ai/mcp`. Leave the advanced OAuth fields empty: Claude registers itself automatically.
3. Click **Connect**, sign in to PopNow (Google, GitHub or an email code) and press **Allow**.

A connector added on the web also works in the Claude mobile apps. If you do not see **Connectors**, ask your workspace admin.

### Claude Desktop (local config)

Prefer the connector above. If you want PopNow in `claude_desktop_config.json` instead (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`, Windows: `%APPDATA%\Claude\claude_desktop_config.json`), use the generic [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) stdio bridge.

**With OAuth** ([`examples/claude-desktop-mcp-remote.json`](examples/claude-desktop-mcp-remote.json)):

```json
{
  "mcpServers": {
    "popnow": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.popnow.ai/mcp"]
    }
  }
}
```

**With an API key** ([`examples/claude-desktop.json`](examples/claude-desktop.json)):

```json
{
  "mcpServers": {
    "popnow": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.popnow.ai/mcp", "--header", "Authorization:${POPNOW_AUTH}"],
      "env": { "POPNOW_AUTH": "Bearer sk-popnow-..." }
    }
  }
}
```

Keep `Authorization:${POPNOW_AUTH}` without spaces and put `Bearer ...` in the env block: some clients (Claude Desktop on Windows among them) do not escape spaces inside `args`. Restart Claude Desktop after editing the file. Both options need Node.js 18 or newer.

### Claude Code

```bash
# OAuth: run /mcp inside Claude Code afterwards and choose PopNow to sign in
claude mcp add --transport http popnow https://api.popnow.ai/mcp

# Or with an API key
claude mcp add --transport http popnow https://api.popnow.ai/mcp \
  --header "Authorization: Bearer $POPNOW_API_KEY"
```

Add `--scope user` to make PopNow available in every project, or `--scope project` to share it through `.mcp.json`.

### ChatGPT

Custom MCP servers depend on your ChatGPT plan and workspace settings, and menu names change as ChatGPT updates. The current path:

1. Go to [chatgpt.com/plugins](https://chatgpt.com/plugins), press **+** and choose **Add custom MCP server**.
2. Name it `PopNow`, paste `https://api.popnow.ai/mcp` under **Connection** and pick **OAuth** as the sign-in method. Accept the warning, then choose **Create as a plugin**.
3. Sign in to PopNow and press **Allow**.
4. In a new chat, type `@`, pick **PopNow** and ask. Photos you attach are passed to PopNow directly.

### Cursor

Add to `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` for all projects ([`examples/cursor.mcp.json`](examples/cursor.mcp.json)):

```json
{
  "mcpServers": {
    "popnow": { "url": "https://api.popnow.ai/mcp" }
  }
}
```

Cursor starts the OAuth sign-in when it connects. With an API key instead ([`examples/cursor-api-key.mcp.json`](examples/cursor-api-key.mcp.json)):

```json
{
  "mcpServers": {
    "popnow": {
      "url": "https://api.popnow.ai/mcp",
      "headers": { "Authorization": "Bearer ${env:POPNOW_API_KEY}" }
    }
  }
}
```

The [PopNow MCP page](https://popnow.ai/mcp) also has a one-click **Add to Cursor** button.

### VS Code

Add to `.vscode/mcp.json` (note the top-level key is `servers`) ([`examples/vscode.mcp.json`](examples/vscode.mcp.json)):

```json
{
  "servers": {
    "popnow": { "type": "http", "url": "https://api.popnow.ai/mcp" }
  }
}
```

VS Code opens the sign-in page the first time the server starts. With an API key, let VS Code prompt for it and store it securely ([`examples/vscode-api-key.mcp.json`](examples/vscode-api-key.mcp.json)):

```json
{
  "inputs": [
    { "type": "promptString", "id": "popnow-api-key", "description": "PopNow API key (sk-popnow-...)", "password": true }
  ],
  "servers": {
    "popnow": {
      "type": "http",
      "url": "https://api.popnow.ai/mcp",
      "headers": { "Authorization": "Bearer ${input:popnow-api-key}" }
    }
  }
}
```

### Windsurf

Open the MCP settings in Windsurf and edit the raw `mcp_config.json` (its location is in the [official Windsurf MCP docs](https://docs.windsurf.com/windsurf/cascade/mcp)). Remote servers use `serverUrl` ([`examples/windsurf.mcp_config.json`](examples/windsurf.mcp_config.json)):

```json
{
  "mcpServers": {
    "popnow": {
      "serverUrl": "https://api.popnow.ai/mcp",
      "headers": { "Authorization": "Bearer ${env:POPNOW_API_KEY}" }
    }
  }
}
```

Drop the `headers` block to sign in with OAuth instead. Press **Refresh** in the MCP panel after saving.

### Cline

Open **MCP Servers → Configure** and add PopNow to `cline_mcp_settings.json`. Set `type` to `streamableHttp` explicitly; without it Cline falls back to the legacy SSE transport ([`examples/cline_mcp_settings.json`](examples/cline_mcp_settings.json)):

```json
{
  "mcpServers": {
    "popnow": {
      "type": "streamableHttp",
      "url": "https://api.popnow.ai/mcp",
      "headers": { "Authorization": "Bearer sk-popnow-..." },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

The Cline CLI can also sign in with OAuth: remove `headers` and use **Authorize OAuth** in the `cline mcp` wizard.

### Codex CLI

```bash
# OAuth
codex mcp add popnow --url https://api.popnow.ai/mcp
codex mcp login popnow
```

Or edit `~/.codex/config.toml` ([`examples/codex.config.toml`](examples/codex.config.toml)); `bearer_token_env_var` reads an API key from your environment:

```toml
[mcp_servers.popnow]
url = "https://api.popnow.ai/mcp"
bearer_token_env_var = "POPNOW_API_KEY"
```

### Other clients and your own code

Any client that speaks Streamable HTTP can use the same URL ([`examples/generic.json`](examples/generic.json), [`examples/generic-api-key.json`](examples/generic-api-key.json)). Clients that only run local stdio servers can use `mcp-remote` (as in the [Claude Desktop](#claude-desktop-local-config) configs) or build [`@popnow/mcp`](#the-stdio-bridge-popnowmcp) from source.

From code, with the official TypeScript SDK (`npm install @modelcontextprotocol/sdk`):

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const transport = new StreamableHTTPClientTransport(new URL('https://api.popnow.ai/mcp'), {
  requestInit: { headers: { Authorization: `Bearer ${process.env.POPNOW_API_KEY}` } },
});
const client = new Client({ name: 'my-app', version: '1.0.0' });
await client.connect(transport);

const result = await client.callTool({ name: 'check_balance', arguments: {} });
console.log(result.content[0].text);
await client.close();
```

With the Python SDK (`pip install mcp`):

```python
import asyncio, os

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async def main():
    headers = {"Authorization": f"Bearer {os.environ['POPNOW_API_KEY']}"}
    async with streamablehttp_client("https://api.popnow.ai/mcp", headers=headers) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool(
                "create_image",
                {"prompt": "A paper boat on a rainy window sill, soft morning light", "aspect_ratio": "4:5"},
            )
            for part in result.content:
                print(part.type, getattr(part, "text", ""))

asyncio.run(main())
```

Or with `curl`. The server is stateless, so every request stands alone; send both media types in `Accept`:

```bash
curl -X POST "https://api.popnow.ai/mcp" \
  -H "Authorization: Bearer $POPNOW_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "check_balance", "arguments": {}}}'
```

For production code that calls models directly, the [PopNow REST API](https://popnow.ai/docs/quickstart) gives you every model parameter, webhooks, idempotency keys and per-task retention.

## Authentication

**OAuth 2.1 (default).** PopNow is a standard OAuth 2.1 authorization server: authorization code with PKCE (S256), refresh tokens, dynamic client registration (RFC 7591) and client ID metadata documents. Discovery starts from the `401` on `/mcp`, whose `WWW-Authenticate` header points to `/.well-known/oauth-protected-resource/mcp`; server metadata is at `/.well-known/oauth-authorization-server`. The consent page shows the app's name and the two scopes, `generate` and `read`. Access tokens last one hour and refresh automatically; a connection stays signed in until it goes unused for 90 days. The AI app never sees your password or payment details.

**API key (alternative).** Scripts, CI jobs and agents without a browser can send a key from the [API console](https://popnow.ai/api/console/keys) as `Authorization: Bearer sk-popnow-...`. The key's model allow-list, IP allow-list and daily, monthly and lifetime spend caps apply, exactly as on the REST API. Give each agent its own key with a low daily cap, and keep keys out of files you commit: use your client's environment variable or secure input support.

**Disconnect** at any time in **Account settings → Devices → Connected AI apps** on [popnow.ai](https://popnow.ai/me/settings/sessions). For key-based clients, revoke the key in the API console.

## Credits, prices and confirmation

Connecting is free. Every creation spends the same credits as on popnow.ai, at the same prices, from the same balance. PopNow sells credit packs with no subscription; see [pricing](https://popnow.ai/pricing).

Every generation tool quotes first:

- **Up to 30 credits** (an image, a song, a 5-second video on the default model): the job starts right away and the reply states what it cost.
- **Over 30 credits** (longer or higher-resolution video, some effects): nothing starts. The tool answers *Needs confirmation* with the price and your balance, the assistant asks you, and when you agree it calls the tool again with `max_credits` set to the price you accepted.
- **Price moved** between quote and start: nothing is charged and the reply gives the new price to confirm.
- **A creation fails:** its credits are refunded automatically.

Identical calls from the same account within ten seconds create one job, so an assistant that retries does not pay twice. A tool waits up to about 40 seconds for the result; longer jobs (most videos) return a `job_id` and the assistant collects the result with `get_job`.

| Rate limit | Value |
| --- | --- |
| Tool calls per account (including `get_job` polling) | 240 per minute |
| New creations per account | 20 per minute |

A creation over the limit is not charged; the tool says how many seconds to wait.

## Example prompts

- "Make a 4:5 picture of a paper boat on a rainy window sill, soft morning light."
- "Edit this photo: put her in a red jacket and make the background a snowy street."
- "Turn this product photo into a 5-second video with a slow camera push-in."
- "Make a 9:16 video of a vintage car cruising along the coast at golden hour, 10 seconds." *(over 30 credits, so the assistant asks first)*
- "Apply the Zombie Turn effect to my selfie."
- "Write and produce an upbeat synth-pop song about a summer road trip, female vocals."
- "Read this paragraph aloud in the Puck voice, newscaster style."
- "Remove the background from this logo, then upscale it to 4K."
- "What video models can you use, and how much does each cost?"
- "How many PopNow credits do I have left? Show my last five videos."

A typical exchange:

```text
You:        Make a 9:16 video of a vintage car cruising along the coast at golden hour, 10 seconds.
Assistant:  (calls create_video → "Needs confirmation … costs 56 credits (the user has 412)")
            That's 56 credits from your PopNow balance. Want me to go ahead?
You:        Yes.
Assistant:  (calls create_video again with max_credits: 56 → job_id, then get_job)
            Here it is. It's saved in your PopNow library too.
You:        Now give me an upbeat synth-pop track for it.
Assistant:  (calls create_music → about 11 credits, under 30, starts at once)
```

## The stdio bridge (`@popnow/mcp`)

[`packages/popnow-mcp`](packages/popnow-mcp) is a minimal TypeScript package (bin `popnow-mcp`) for MCP clients that can only launch local stdio servers. It connects a `StdioServerTransport` to a `StreamableHTTPClientTransport` from the official MCP SDK and forwards every message unchanged, so tools and prices always match the live server.

It is published on npm as [`@popnow/mcp`](https://www.npmjs.com/package/@popnow/mcp), so `npx` runs it with no install step:

```json
{
  "mcpServers": {
    "popnow": {
      "command": "npx",
      "args": ["-y", "@popnow/mcp"],
      "env": { "POPNOW_API_KEY": "sk-popnow-..." }
    }
  }
}
```

| Environment variable | Required | Description |
| --- | --- | --- |
| `POPNOW_API_KEY` | yes | PopNow API key (`sk-popnow-...`), sent as a Bearer token |
| `POPNOW_MCP_URL` | no | Remote endpoint, default `https://api.popnow.ai/mcp` |

To build and run it from source instead (Node.js 18 or newer):

```bash
git clone https://github.com/popnow-ai/popnow-mcp.git
cd popnow-mcp
npm --prefix packages/popnow-mcp install
npm --prefix packages/popnow-mcp test    # builds with tsc, then runs an end-to-end test against a local fake server
node packages/popnow-mcp/dist/cli.js --help
```

Then point your client at the built file:

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

## MCP registry manifest

[`server.json`](server.json) describes the server in the [MCP registry](https://github.com/modelcontextprotocol/registry) format (schema `2025-12-11`): the remote Streamable HTTP endpoint with an optional `Authorization` header.

## Troubleshooting

| You see | Why | Fix |
| --- | --- | --- |
| No **Connectors** / **Add custom MCP server** option | Your plan or workspace does not allow custom connectors | Ask the workspace admin |
| "Please connect your PopNow account first." | The client called a tool before sign-in finished | Reconnect from the client's MCP or connector settings |
| "This connection wasn't given permission to do that." | The connection was approved without the `generate` scope | Disconnect, connect again and press **Allow** |
| *Needs confirmation, nothing started yet* | The job costs more than 30 credits | Say yes; the assistant repeats the call with `max_credits` |
| "Not enough credits ... Nothing was charged." | Balance too low | Buy a [credit pack](https://popnow.ai/pricing), or pick a cheaper model or a shorter video |
| "Too many creations at once. Nothing was charged." | More than 20 new creations in a minute | Wait the number of seconds in the message |
| `401` with a `WWW-Authenticate` header | No token, or the API key is wrong or revoked | Send `Authorization: Bearer` with an active `sk-popnow-` key, or sign in again |
| `405 Method Not Allowed` | `GET` or `DELETE` to `/mcp`; the server is stateless | Use `POST` (any MCP client does this for you) |
| Cline connects but nothing works | `type` missing, so Cline used legacy SSE | Set `"type": "streamableHttp"` |

## FAQ

### How do I generate AI images and videos from Claude or ChatGPT?
Add `https://api.popnow.ai/mcp` as a custom connector (Claude) or custom MCP server (ChatGPT), sign in to PopNow, and ask in plain words. The assistant calls `create_image`, `create_video` or another PopNow tool and returns the result in the chat.

### How do I generate a video from an image with an MCP server?
Give the assistant a photo (attach it in ChatGPT, or paste a public `https` link elsewhere) and describe the motion. It calls `create_video` with `image_url`, which switches to image-to-video. About 28 credits for 5 seconds on the default model.

### Is there an MCP server for AI music and text-to-speech?
Yes. PopNow's `create_music` makes original songs or instrumentals (Suno v6) and `create_speech` reads text aloud in many voices, languages and delivery styles.

### Does it cost extra to use PopNow in ChatGPT, Claude or Cursor?
No. Connecting is free, and each creation costs the same credits as on popnow.ai. Failed creations are refunded automatically, and anything over 30 credits waits for your confirmation.

### Do I need to install anything?
No. PopNow is a hosted remote MCP server; you only add its URL. Clients that cannot connect to remote servers can use `mcp-remote`, or run the optional `@popnow/mcp` bridge with `npx -y @popnow/mcp`.

### Can I use an API key instead of OAuth?
Yes. Send `Authorization: Bearer sk-popnow-...` with a key from the [API console](https://popnow.ai/api/console/keys). Spend caps and allow-lists on the key apply.

### Which AI models does the PopNow MCP server support?
Image, video and audio models including Kling, Seedance, Wan, Vidu, MiniMax, Nano Banana, GPT Image, Flux and Suno, plus one-tap video effects. Ask the assistant to call `list_models` for the current list with prices, then name a model in your request.

### Where do my creations go?
You get a link in the chat, and everything is saved in your [PopNow library](https://popnow.ai/assets), just like creations made on the website.

## Links

- Website: [popnow.ai](https://popnow.ai) · [Pricing](https://popnow.ai/pricing) · [Use PopNow in ChatGPT and Claude](https://popnow.ai/mcp)
- Docs: [popnow.ai/docs](https://popnow.ai/docs) · [MCP guide](https://popnow.ai/docs/mcp) · [API reference (OpenAPI)](https://popnow.ai/docs/openapi) · [llms.txt](https://popnow.ai/llms.txt)
- Other PopNow repos:
  - [popnow-skills](https://github.com/popnow-ai/popnow-skills): agent skills for PopNow (`/plugin marketplace add popnow-ai/popnow-skills`)
  - [popnow-python](https://github.com/popnow-ai/popnow-python): Python SDK
  - [popnow-js](https://github.com/popnow-ai/popnow-js): JavaScript / TypeScript SDK
  - [popnow-api](https://github.com/popnow-ai/popnow-api): REST API examples and OpenAPI spec
  - [popnow-blender](https://github.com/popnow-ai/popnow-blender): Blender add-on

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). For security issues, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © PopNow
