#!/usr/bin/env node
/**
 * popnow-mcp: run the PopNow remote MCP server as a local stdio server.
 *
 * Usage (normally started by an MCP client, not by hand):
 *   POPNOW_API_KEY=sk-popnow-... node dist/cli.js
 */
import { createBridge, DEFAULT_URL, KEY_PREFIX, resolveEnv, VERSION } from "./index.js";

const HELP = `popnow-mcp ${VERSION}
Local stdio bridge to the PopNow remote MCP server (${DEFAULT_URL}).

Environment:
  POPNOW_API_KEY   required, a PopNow API key (${KEY_PREFIX}...) from https://popnow.ai/api/console/keys
  POPNOW_MCP_URL   optional, override the remote endpoint (default ${DEFAULT_URL})

Options:
  -h, --help       show this help
  -v, --version    print the version

Docs: https://popnow.ai/docs/mcp`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    process.stdout.write(`${HELP}\n`);
    return;
  }
  if (args.includes("-v") || args.includes("--version")) {
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  let env;
  try {
    env = resolveEnv(process.env);
  } catch (err) {
    process.stderr.write(`[popnow-mcp] ${(err as Error).message}\n`);
    process.exitCode = 1;
    return;
  }
  if (!env.apiKey.startsWith(KEY_PREFIX)) {
    process.stderr.write(`[popnow-mcp] warning: POPNOW_API_KEY does not start with ${KEY_PREFIX}\n`);
  }

  const bridge = createBridge({ apiKey: env.apiKey, url: env.url });
  const shutdown = () => {
    void bridge.close().finally(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  // The MCP client closing our stdin means the session is over.
  process.stdin.on("end", shutdown);

  await bridge.start();
}

main().catch((err: unknown) => {
  process.stderr.write(`[popnow-mcp] ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
