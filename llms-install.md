# Install PopNow MCP

The hosted server is `https://api.popnow.ai/mcp`. Use Streamable HTTP, not SSE.
No repository clone, build step, background process or npm package is required.

## Cline

In MCP Servers, open Remote Servers. Enter the name `popnow`, the URL above,
and choose Streamable HTTP. Add the server and complete its OAuth sign-in.

For Cline CLI:

```sh
cline mcp add popnow https://api.popnow.ai/mcp --transport http --yes
```

If the client asks for authentication, use its OAuth authorization action.
Sign in to PopNow and review the `generate` and `read` scopes. Do not put
passwords, OAuth tokens or API keys in repository files.

Once connected, list the tools and call `check_balance` with `{}`. Reading
the balance does not spend credits. If sign-in is unavailable or the balance
is insufficient, explain the returned error instead of starting generation.

## Portable plugins and Gemini CLI

This repository includes an Agent Plugins v1 manifest (`plugin.json` and
`mcp.json`) and a Gemini CLI manifest (`gemini-extension.json`). Use the
client's normal extension installer. See the README for commands.

The integration is free to install. Media generation consumes the user's
prepaid PopNow balance. Follow each returned quote and confirmation requirement.
Long-running jobs return a real job ID; use `get_job` to retrieve completion.

Documentation: https://popnow.ai/docs/mcp
Privacy: https://popnow.ai/privacy
Support: support@popnow.ai
