// End-to-end test of the built bridge: a fake Streamable HTTP MCP server runs on
// localhost, the CLI is spawned as a stdio server pointed at it, and the official
// SDK client talks to the CLI over stdio. No network access to popnow.ai is needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { resolveEnv, VERSION, DEFAULT_URL } from "../dist/index.js";

const cli = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

/** A tiny stateless MCP server that answers with plain JSON, like the real one does. */
function fakeRemote() {
  const seen = [];
  const server = createServer((req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405).end();
      return;
    }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const msg = JSON.parse(body);
      seen.push({ method: msg.method, auth: req.headers.authorization, ua: req.headers["user-agent"] });
      if (req.headers.authorization !== "Bearer sk-popnow-test") {
        res.writeHead(401, { "WWW-Authenticate": 'Bearer realm="test"' }).end();
        return;
      }
      if (msg.id === undefined) {
        res.writeHead(202).end();
        return;
      }
      let result;
      if (msg.method === "initialize") {
        result = {
          protocolVersion: msg.params.protocolVersion,
          capabilities: { tools: {} },
          serverInfo: { name: "fake-popnow", version: "0.0.0" },
        };
      } else if (msg.method === "tools/list") {
        result = {
          tools: [{ name: "check_balance", description: "Show credits", inputSchema: { type: "object" } }],
        };
      } else if (msg.method === "tools/call") {
        result = { content: [{ type: "text", text: "You have 42 PopNow credits." }] };
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: "not found" } }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", id: msg.id, result }));
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ url: `http://127.0.0.1:${port}/mcp`, seen, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

async function connect(url, apiKey) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [cli],
    env: { ...process.env, POPNOW_API_KEY: apiKey, POPNOW_MCP_URL: url },
    stderr: "pipe",
  });
  const client = new Client({ name: "bridge-test", version: "1.0.0" });
  await client.connect(transport);
  return client;
}

test("VERSION matches package.json", () => {
  assert.equal(VERSION, pkg.version);
});

test("resolveEnv requires a key and defaults the URL", () => {
  assert.throws(() => resolveEnv({}), /POPNOW_API_KEY is not set/);
  assert.equal(resolveEnv({ POPNOW_API_KEY: "sk-popnow-x" }).url, DEFAULT_URL);
  assert.throws(() => resolveEnv({ POPNOW_API_KEY: "k", POPNOW_MCP_URL: "ftp://x" }), /https/);
});

test("CLI exits with a clear message when POPNOW_API_KEY is missing", () => {
  const env = { ...process.env };
  delete env.POPNOW_API_KEY;
  const r = spawnSync(process.execPath, [cli], { env, input: "", encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /POPNOW_API_KEY is not set/);
});

test("forwards initialize, tools/list and tools/call with the API key", async () => {
  const remote = await fakeRemote();
  const client = await connect(remote.url, "sk-popnow-test");
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name), ["check_balance"]);
    const res = await client.callTool({ name: "check_balance", arguments: {} });
    assert.equal(res.content[0].text, "You have 42 PopNow credits.");
    assert.ok(remote.seen.every((s) => s.auth === "Bearer sk-popnow-test"));
    assert.ok(remote.seen.every((s) => s.ua === `popnow-mcp/${VERSION}`));
    assert.deepEqual(
      remote.seen.map((s) => s.method),
      ["initialize", "notifications/initialized", "tools/list", "tools/call"],
    );
  } finally {
    await client.close();
    await remote.close();
  }
});

test("a rejected key surfaces as an error instead of hanging", async () => {
  const remote = await fakeRemote();
  try {
    await assert.rejects(connect(remote.url, "sk-popnow-wrong"), /PopNow MCP server unreachable or rejected/);
  } finally {
    await remote.close();
  }
});
