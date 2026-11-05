<p align="center">
  <a href="https://popnow.ai">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/popnow-wordmark-light.png">
      <source media="(prefers-color-scheme: light)" srcset="assets/popnow-wordmark.png">
      <img src="assets/popnow-wordmark.png" alt="PopNow" width="280">
    </picture>
  </a>
</p>

<h1 align="center">PopNow MCP Server — AI image, video & music generation in ChatGPT, Claude and any MCP client, with your PopNow account</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-Streamable%20HTTP-6f42c1.svg" alt="MCP Streamable HTTP"></a>
  <a href="https://popnow.ai"><img src="https://img.shields.io/badge/site-popnow.ai-ff5a5f.svg" alt="popnow.ai"></a>
</p>

**The PopNow MCP Server is a hosted Model Context Protocol server at `https://api.popnow.ai/mcp` that lets ChatGPT, Claude, Cursor, VS Code and any other MCP client create AI images, videos, songs and voiceovers on [PopNow](https://popnow.ai), using your PopNow credits.**

Ask in plain words ("turn this photo into a 5-second video", "make an upbeat synth-pop track") and the assistant picks the right PopNow tool, tells you the price, and returns the result in the chat. There is nothing to host: the server is remote, signs you in with OAuth 2.1, and uses the same models, prices and library as [popnow.ai](https://popnow.ai). It is also the home of PopNow's free [Agent Skills](#style-presets-find_skills-and-use_skill): ask for a style for your launch video, deck or landing page and the assistant shows you presets to pick from. Make it pop.

This repository contains the public setup guide, copy-paste client configs in [`examples/`](examples) and an [MCP registry manifest](server.json).

> Building with an API key (Claude Code, Cursor, Codex or your own code, billed in USD from an API balance)? Use the developer server in [popnow-api-mcp](https://github.com/popnow-ai/popnow-api-mcp). The `@popnow/mcp` npm bridge moved there too.

## Contents

- [Quickstart](#quickstart)
- [Tools](#tools)
- [Style presets: find_skills and use_skill](#style-presets-find_skills-and-use_skill)
- [Connect your client](#connect-your-client): [Claude](#claude-web-desktop-and-mobile) · [Claude Desktop (local)](#claude-desktop-local-config) · [Claude Code](#claude-code) · [ChatGPT](#chatgpt) · [Cursor](#cursor) · [VS Code](#vs-code) · [Windsurf](#windsurf) · [Cline](#cline) · [Codex CLI](#codex-cli) · [Other clients](#other-clients-and-your-own-code)
- [Hermes Agent and Gemini CLI extensions](#hermes-agent-and-gemini-cli-extensions)
- [Authentication](#authentication)
- [Credits, prices and confirmation](#credits-prices-and-confirmation)
- [Example prompts](#example-prompts)
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
| Sign-in | OAuth 2.1 with PKCE and dynamic client registration: you sign in with your PopNow account |
| Scopes | `generate` (create with your credits) and `read` (balance, creations, model list) |
| Tools | Generation, account and style-preset tools (listed below) |
| Price | Same credits as popnow.ai (1 credit = $0.001). Up to 300 credits starts at once; anything above waits for your yes. Style presets are free |

## Tools

| Tool | What it does | Key parameters | Typical cost |
| --- | --- | --- | --- |
| `create_image` | Make a new picture from a description | `prompt`, `aspect_ratio` (default `1:1`), `model`, `max_credits` | about 48 credits (default Nano Banana 2.1) |
| `edit_image` | Change a photo with words: new style, outfit, background, add or remove things | `prompt`, `image_url` / `image`, `more_image_urls`, `aspect_ratio`, `model`, `max_credits` | about 48 credits |
| `create_video` | Make a short video from a description, or bring a photo to life (text-to-video and image-to-video) | `prompt`, `image_url` / `image`, `duration_seconds` (default 5), `aspect_ratio` (default `16:9`), `model`, `max_credits` | about 185 credits for 5 s (default MiniMax H3); 1 to 3 minutes |
| `create_music` | Make an original song or instrumental track | `prompt`, `lyrics`, `instrumental`, `voice` (`female` / `male`), `title`, `max_credits` | about 72 credits per song (Suno v6) |
| `create_speech` | Turn text into natural speech in many voices and languages | `text`, `voice` (Kore, Puck, Charon, Aoede, Fenrir, Leda ...), `style` (`whisper`, `empathetic`, `vocal_smile`, `newscaster`, `promo_hype`, `deadpan`), `max_credits` | priced by length, about 20 credits per minute of audio |
| `apply_effect` | Turn a photo into a trending effect video (Zombie Turn, Flying Car, Tiny Planet, Molten Gold, Hyperdrive ...) or a photo makeover (Clay Figure, Pixel Art ...) | `effect` (name or id), `image_url` / `image`, `max_credits` | about 125 to 340 credits per video, 30 to 50 per photo makeover; quoted first |
| `remove_background` | Cut out the subject and make the background transparent | `image_url` / `image`, `max_credits` | about 5 credits |
| `upscale` | Make a photo or video sharper and bigger | `image_url` / `image` or `video_url`, `size` (photos `2k`, `4k`, `8k`; videos `720p`, `1080p`, `2k`, `4k`), `max_credits` | about 12 credits for a photo; videos by length |
| `get_job` | Check on a creation that is still running and return it when ready | `job_id`, `wait_seconds` (0 to 50, default 30) | free |
| `list_my_creations` | Show your recent PopNow creations with links | `kind` (`image`, `video`, `audio`), `limit` (1 to 20, default 10) | free |
| `check_balance` | Show how many credits you have left (and how many are held for running jobs) | none | free |
| `list_models` | List the image, video and audio models, or every effect, with prices | `category` (`image`, `video`, `audio`, `effects`) | free |
| `find_skills` | Find ready-made style presets (Agent Skills) for what you want to make: product launch videos, slide decks, landing pages and websites, editorial images. Each option has a name, a one-line look, a preview video or picture, the PopNow generation it uses and what it needs locally | `intent` (your words), `type` (`video`, `image`, `slides`, `web`), `limit` (1 to 6, default 4) | free |
| `use_skill` | Get the preset you picked: its full playbook (`SKILL.md`), a short-lived signed download link for the whole package with install commands for your coding agent, and which PopNow tools run its generation steps | `slug` (from `find_skills`), `agent` (`claude-code`, `codex`, `cursor`, `gemini-cli`, `github-copilot`, `opencode`, or `chat` without a file system) | free; each generation it runs is quoted first |

- **Models.** Every generation tool that takes `model` accepts a PopNow model id from `list_models`, so "use Seedance" or "make it with Wan" just works. Models include Kling, Seedance, Wan, Vidu, MiniMax, Nano Banana, GPT Image, Flux, Suno and more; the live list is always `list_models`.
- **Photos in.** `image_url` takes a public `https` link or a `popnow://` link from an earlier result. In ChatGPT, an attached photo arrives as the `image` file object.
- **Results out.** Images come back inline as a preview plus a download link; videos and audio come back as links. Each result also has a permanent `popnow://` link you can pass to another tool ("now animate that picture"). Everything is saved in your [PopNow library](https://popnow.ai/assets).
- **Annotations.** All tools carry the standard MCP hints. `get_job`, `list_my_creations`, `check_balance`, `list_models`, `find_skills` and `use_skill` are read-only, and no tool deletes anything.
- **Effects** cover the same set as the [Effects page](https://popnow.ai/effects). Two-person effects need two placed photos and are website-only.

## Style presets: find_skills and use_skill

PopNow keeps a catalog of free [Agent Skills](https://popnow.ai/skills): named styles for product launch videos, slide decks, landing pages and websites, editorial images and more, each with a preview and a full playbook that an AI agent follows to build the result. Two free tools bring the catalog into any MCP client:

1. **Find.** The assistant calls `find_skills` with what you want to make, in your words (optionally `type`: `video`, `image`, `slides` or `web`). It gets up to 6 options (4 by default), best first, each with a name, a one-line description of the look, a preview link, the PopNow generation it uses and its local requirements.
2. **Pick.** The assistant shows you the options with their previews and asks which one you want.
3. **Use.** The assistant calls `use_skill` with the chosen `slug` and `agent` (`claude-code`, `codex`, `cursor`, `gemini-cli`, `github-copilot`, `opencode`, or `chat` in apps without a file system). The reply holds the full `SKILL.md` playbook, a short-lived signed download link to the complete package with the install commands for that agent, and which PopNow tools (`create_image`, `create_video`, `create_music`, `create_speech` ...) replace the playbook's own generation scripts.

Finding, downloading and using a preset is free. Only the images, video, music or voice it generates cost credits, quoted and confirmed like every other PopNow tool. Presets are licensed for your own and client work; please don't republish the packages. In a chat app without a file system the assistant can still follow the playbook's look and make the pictures with `create_image`; steps that run local scripts need a coding agent.

```text
You:        I need a launch video for our note-taking app.
Assistant:  (calls find_skills with intent "launch video for a note-taking app", type "video")
            Here are three styles:
            1. <Preset A> - <its one-line look>. Preview: <link>. Uses PopNow video; needs Node.js.
            2. <Preset B> - ...
            3. <Preset C> - ...
            Which one do you like? The preset is free; only the clips it makes cost credits.
You:        The first one.
Assistant:  (calls use_skill with that slug and agent "claude-code", installs the package from the
            signed link, then follows the playbook)
            Installed. The first clip will cost 185 credits. Go ahead?
You:        Yes.
Assistant:  (calls create_video with max_credits: 185, then get_job, and keeps building the video)
```

You can also browse the catalog and its previews on the [website](https://popnow.ai/skills); [Use a skill in ChatGPT or Claude](https://popnow.ai/learn/skills-in-chat) walks through it.

## Connect your client

Every client below talks to the same remote server and signs in with your PopNow account (OAuth). Ready-made files are in [`examples/`](examples).

### Claude (web, desktop and mobile)

Custom connectors are available on Claude plans and workspaces that allow them.

1. Open **Settings → Connectors** ([claude.ai/settings/connectors](https://claude.ai/settings/connectors)) in Claude on the web or in the desktop app.
2. Click **Add custom connector**, name it `PopNow` and paste `https://api.popnow.ai/mcp`. Leave the advanced OAuth fields empty: Claude registers itself automatically.
3. Click **Connect**, sign in to PopNow (Google, GitHub or an email code) and press **Allow**.

A connector added on the web also works in the Claude mobile apps. If you do not see **Connectors**, ask your workspace admin.

### Claude Desktop (local config)

Prefer the connector above. If you want PopNow in `claude_desktop_config.json` instead (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`, Windows: `%APPDATA%\Claude\claude_desktop_config.json`), use the generic [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) stdio bridge, which opens the PopNow sign-in page the first time ([`examples/claude-desktop-mcp-remote.json`](examples/claude-desktop-mcp-remote.json)):

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

Restart Claude Desktop after editing the file. `mcp-remote` needs Node.js 18 or newer.

### Claude Code

```bash
claude mcp add --transport http popnow https://api.popnow.ai/mcp
```

Then run `/mcp` inside Claude Code and choose PopNow to sign in.

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

Cursor starts the OAuth sign-in when it connects.

### VS Code

Add to `.vscode/mcp.json` (note the top-level key is `servers`) ([`examples/vscode.mcp.json`](examples/vscode.mcp.json)):

```json
{
  "servers": {
    "popnow": { "type": "http", "url": "https://api.popnow.ai/mcp" }
  }
}
```

VS Code opens the sign-in page the first time the server starts.

### Windsurf

Open the MCP settings in Windsurf and edit the raw `mcp_config.json` (its location is in the [official Windsurf MCP docs](https://docs.windsurf.com/windsurf/cascade/mcp)). Remote servers use `serverUrl` ([`examples/windsurf.mcp_config.json`](examples/windsurf.mcp_config.json)):

```json
{
  "mcpServers": {
    "popnow": {
      "serverUrl": "https://api.popnow.ai/mcp"
    }
  }
}
```

Press **Refresh** in the MCP panel after saving, then sign in when Windsurf asks.

### Cline

Open **MCP Servers → Configure** and add PopNow to `cline_mcp_settings.json`. Set `type` to `streamableHttp` explicitly; without it Cline falls back to the legacy SSE transport ([`examples/cline_mcp_settings.json`](examples/cline_mcp_settings.json)):

```json
{
  "mcpServers": {
    "popnow": {
      "type": "streamableHttp",
      "url": "https://api.popnow.ai/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Use **Authorize OAuth** in Cline (or in the `cline mcp` wizard of the Cline CLI) to sign in.

To add the hosted server directly from Cline CLI:

```sh
cline mcp add popnow https://api.popnow.ai/mcp --transport http --yes
```

The same steps are summarized in [`llms-install.md`](llms-install.md). Once
signed in, call `check_balance` with `{}` to check the connection without
spending credits.

### Hermes Agent and Gemini CLI extensions

This repository is also a portable [Agent Plugins v1](https://agent-plugins.org)
package. It declares the hosted server in [`mcp.json`](mcp.json); it does not
start a local executable or require the optional npm bridge.

For [Hermes Agent](https://hermes-agent.nousresearch.com/docs/guides/use-mcp-with-hermes),
use its native MCP configuration so OAuth is explicit. Add to the active
profile's `config.yaml`:

```yaml
mcp_servers:
  popnow:
    url: https://api.popnow.ai/mcp
    auth: oauth
    trust: untrusted
```

Run `hermes mcp login popnow`, then start a new session or use `/reload-mcp`.
The native configuration asks Hermes to require approval before write-capable
calls, including generation. PopNow also enforces its returned price and
confirmation requirements on the server. Reading a balance or listing models
does not spend credits.

For [Gemini CLI](https://geminicli.com/docs/extensions/):

```sh
gemini extensions install https://github.com/popnow-ai/popnow-mcp
```

The root [`gemini-extension.json`](gemini-extension.json) uses Streamable HTTP
and OAuth. Run `/mcp auth popnow` in Gemini CLI to sign in if needed. Tool
approval follows the client's normal policy.

**Data and execution disclosure.** These manifests connect to
`https://api.popnow.ai/mcp`. Only the tool arguments and media references sent
by your client are passed to PopNow. Generation creates media in the connected
account and spends its prepaid balance. The portable package has no hooks,
local commands, background processes, or custom credential storage. Review the [Privacy Policy](https://popnow.ai/privacy)
and [Terms](https://popnow.ai/terms), or contact support@popnow.ai.

Marketplace review is separate from direct installation. These installation
commands do not imply approval or endorsement by a client vendor.

### Codex CLI

```bash
codex mcp add popnow --url https://api.popnow.ai/mcp
codex mcp login popnow
```

Or add it to `~/.codex/config.toml` ([`examples/codex.config.toml`](examples/codex.config.toml)) and run `codex mcp login popnow`:

```toml
[mcp_servers.popnow]
url = "https://api.popnow.ai/mcp"
```

### Other clients

Any client that speaks Streamable HTTP and supports OAuth sign-in can use the same URL ([`examples/generic.json`](examples/generic.json)). Clients that only run local stdio servers can use `mcp-remote`, as in the [Claude Desktop](#claude-desktop-local-config) config.

To call PopNow from your own code, scripts or CI with an API key, use the developer server in [popnow-api-mcp](https://github.com/popnow-ai/popnow-api-mcp) or the [PopNow REST API](https://popnow.ai/docs/quickstart).

## Authentication

**OAuth 2.1 (default).** PopNow is a standard OAuth 2.1 authorization server: authorization code with PKCE (S256), refresh tokens, dynamic client registration (RFC 7591) and client ID metadata documents. Discovery starts from the `401` on `/mcp`, whose `WWW-Authenticate` header points to `/.well-known/oauth-protected-resource/mcp`; server metadata is at `/.well-known/oauth-authorization-server`. The consent page shows the app's name and the two scopes, `generate` and `read`. Access tokens last one hour and refresh automatically; a connection stays signed in until it goes unused for 90 days. The AI app never sees your password or payment details.

**API keys** are for developers. They are billed in USD from a separate API balance and connect to the developer server at `https://api.popnow.ai/api/v1/mcp`; see [popnow-api-mcp](https://github.com/popnow-ai/popnow-api-mcp). This address still accepts API keys until 31 January 2027 so existing setups keep working while they move.

**Disconnect** at any time in **Account settings → Devices → Connected AI apps** on [popnow.ai](https://popnow.ai/me/settings/sessions).

## Credits, prices and confirmation

Connecting is free, and so are `find_skills` and `use_skill`. Every creation spends the same credits as on popnow.ai, at the same prices, from the same balance: 1 credit = $0.001. PopNow sells credit packs with no subscription, from Starter ($10, 10,000 credits) to Pro ($100, 112,000 credits including bonus), or any amount from $10 to $2,000 at 1,000 credits per $1; see [pricing](https://popnow.ai/pricing).

Every generation tool quotes first:

- **Up to 300 credits** (an image, a song, a 5-second video on the default model): the job starts right away and the reply states what it cost.
- **Over 300 credits** (longer or higher-resolution video, some effects): nothing starts. The tool answers *Needs confirmation* with the price and your balance, the assistant asks you, and when you agree it calls the tool again with `max_credits` set to the price you accepted.
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
- "Make a 9:16 video of a vintage car cruising along the coast at golden hour, 10 seconds." *(over 300 credits, so the assistant asks first)*
- "Apply the Zombie Turn effect to my selfie."
- "Write and produce an upbeat synth-pop song about a summer road trip, female vocals."
- "Read this paragraph aloud in the Puck voice, newscaster style."
- "Remove the background from this logo, then upscale it to 4K."
- "What video models can you use, and how much does each cost?"
- "How many PopNow credits do I have left? Show my last five videos."
- "Find me a style for a pitch deck for our seed round." *(find_skills, then use_skill; free)*

A typical exchange:

```text
You:        Make a 9:16 video of a vintage car cruising along the coast at golden hour, 10 seconds.
Assistant:  (calls create_video → "Needs confirmation … costs 370 credits (the user has 8450)")
            That's 370 credits from your PopNow balance. Want me to go ahead?
You:        Yes.
Assistant:  (calls create_video again with max_credits: 370 → job_id, then get_job)
            Here it is. It's saved in your PopNow library too.
You:        Now give me an upbeat synth-pop track for it.
Assistant:  (calls create_music → about 72 credits, under 300, starts at once)
```

## MCP registry manifest

[`server.json`](server.json) describes the server in the [MCP registry](https://github.com/modelcontextprotocol/registry) format (schema `2025-12-11`): the remote Streamable HTTP endpoint with OAuth sign-in.

## Troubleshooting

| You see | Why | Fix |
| --- | --- | --- |
| No **Connectors** / **Add custom MCP server** option | Your plan or workspace does not allow custom connectors | Ask the workspace admin |
| "Please connect your PopNow account first." | The client called a tool before sign-in finished | Reconnect from the client's MCP or connector settings |
| "This connection wasn't given permission to do that." | The connection was approved without the `generate` scope | Disconnect, connect again and press **Allow** |
| *Needs confirmation, nothing started yet* | The job costs more than 300 credits | Say yes; the assistant repeats the call with `max_credits` |
| "Not enough credits ... Nothing was charged." | Balance too low | Buy a [credit pack](https://popnow.ai/pricing), or pick a cheaper model or a shorter video |
| "Too many creations at once. Nothing was charged." | More than 20 new creations in a minute | Wait the number of seconds in the message |
| `401` with a `WWW-Authenticate` header | Not signed in yet, or the sign-in expired | Reconnect from the client's MCP or connector settings and sign in again |
| `405 Method Not Allowed` | `GET` or `DELETE` to `/mcp`; the server is stateless | Use `POST` (any MCP client does this for you) |
| Cline connects but nothing works | `type` missing, so Cline used legacy SSE | Set `"type": "streamableHttp"` |

## Claude Code plugin

```text
/plugin marketplace add popnow-ai/popnow-mcp
/plugin install popnow-mcp@popnow-mcp
```

## FAQ

### How do I generate AI images and videos from Claude or ChatGPT?
Add `https://api.popnow.ai/mcp` as a custom connector (Claude) or custom MCP server (ChatGPT), sign in to PopNow, and ask in plain words. The assistant calls `create_image`, `create_video` or another PopNow tool and returns the result in the chat.

### How do I generate a video from an image with an MCP server?
Give the assistant a photo (attach it in ChatGPT, or paste a public `https` link elsewhere) and describe the motion. It calls `create_video` with `image_url`, which switches to image-to-video. About 185 credits for 5 seconds on the default model.

### Is there an MCP server for AI music and text-to-speech?
Yes. PopNow's `create_music` makes original songs or instrumentals (Suno v6) and `create_speech` reads text aloud in many voices, languages and delivery styles.

### Does it cost extra to use PopNow in ChatGPT, Claude or Cursor?
No. Connecting is free, and each creation costs the same credits as on popnow.ai. Failed creations are refunded automatically, and anything over 300 credits waits for your confirmation.

### Do I need to install anything?
No. PopNow is a hosted remote MCP server; you only add its URL. Clients that cannot connect to remote servers can use `mcp-remote`.

### Can I use an API key instead of OAuth?
API keys belong to the developer server at `https://api.popnow.ai/api/v1/mcp`, billed in USD from your API balance rather than your website credits. See [popnow-api-mcp](https://github.com/popnow-ai/popnow-api-mcp).

### Which AI models does the PopNow MCP server support?
Image, video and audio models including Kling, Seedance, Wan, Vidu, MiniMax, Nano Banana, GPT Image, Flux and Suno, plus one-tap video effects. Ask the assistant to call `list_models` for the current list with prices, then name a model in your request.

### How do I find a ready-made style for a launch video, slide deck or landing page?
Ask the assistant, for example "find a style for our product launch video". It calls `find_skills`, shows you a few presets with preview links, and after you pick one calls `use_skill` to get its playbook and install link. Presets are free; only the generations they run cost credits. You can also browse the catalog at [popnow.ai/skills](https://popnow.ai/skills).

### Where do my creations go?
You get a link in the chat, and everything is saved in your [PopNow library](https://popnow.ai/assets), just like creations made on the website.

## Links

- Website: [popnow.ai](https://popnow.ai) · [Pricing](https://popnow.ai/pricing) · [Use PopNow in ChatGPT and Claude](https://popnow.ai/mcp) · [Skills](https://popnow.ai/skills)
- Help: [Use PopNow in ChatGPT and Claude](https://popnow.ai/learn/use-in-chatgpt-claude) · [Use a skill in ChatGPT or Claude](https://popnow.ai/learn/skills-in-chat) · [Tutorials](https://popnow.ai/learn)
- For developers: [popnow-api-mcp](https://github.com/popnow-ai/popnow-api-mcp), the API key MCP server billed in USD

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). For security issues, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © PopNow
