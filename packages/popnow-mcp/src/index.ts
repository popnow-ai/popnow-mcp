/**
 * A minimal stdio <-> Streamable HTTP bridge for the PopNow remote MCP server.
 *
 * The bridge does not implement any tools itself. Every JSON-RPC message that a
 * local MCP client writes to stdin is forwarded to https://api.popnow.ai/mcp,
 * and every message the remote server sends back is written to stdout. Tools,
 * prices and confirmations therefore always match the live server.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  isJSONRPCRequest,
  isJSONRPCResultResponse,
  type JSONRPCMessage,
} from "@modelcontextprotocol/sdk/types.js";

/** Package version, sent in the User-Agent header. Kept in sync with package.json by a test. */
export const VERSION = "0.1.0";

/** The public PopNow MCP endpoint. */
export const DEFAULT_URL = "https://api.popnow.ai/mcp";

/** Prefix of every PopNow API key. */
export const KEY_PREFIX = "sk-popnow-";

export interface BridgeOptions {
  /** PopNow API key (sk-popnow-...), sent as `Authorization: Bearer <key>`. */
  apiKey: string;
  /** Remote MCP endpoint. Defaults to {@link DEFAULT_URL}. */
  url?: string;
  /** Local side of the bridge. Defaults to a stdio server transport on this process. */
  local?: Transport;
  /** Called with non-fatal problems (network errors and similar). Defaults to stderr. */
  log?: (message: string) => void;
}

export interface Bridge {
  /** Starts both transports and begins forwarding messages. */
  start(): Promise<void>;
  /** Stops forwarding and closes both transports. */
  close(): Promise<void>;
}

export interface ResolvedEnv {
  apiKey: string;
  url: string;
}

/**
 * Reads POPNOW_API_KEY and POPNOW_MCP_URL from an environment object.
 * Throws an Error with a user-facing message when the key is missing or the URL is invalid.
 */
export function resolveEnv(env: Record<string, string | undefined>): ResolvedEnv {
  const apiKey = (env.POPNOW_API_KEY ?? "").trim();
  if (!apiKey) {
    throw new Error(
      "POPNOW_API_KEY is not set. Create a key at https://popnow.ai/api/console/keys and pass it in the env " +
        "block of your MCP client config. Clients that support remote servers can skip this package and " +
        `connect to ${DEFAULT_URL} directly with OAuth sign-in.`,
    );
  }
  const url = (env.POPNOW_MCP_URL ?? "").trim() || DEFAULT_URL;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`POPNOW_MCP_URL is not a valid URL: ${url}`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`POPNOW_MCP_URL must use https:// (got ${parsed.protocol})`);
  }
  return { apiKey, url: parsed.toString() };
}

/** Creates a bridge between a local transport (stdio by default) and the remote PopNow MCP server. */
export function createBridge(options: BridgeOptions): Bridge {
  const log = options.log ?? ((m: string) => process.stderr.write(`[popnow-mcp] ${m}\n`));
  const local = options.local ?? new StdioServerTransport();
  const remote = new StreamableHTTPClientTransport(new URL(options.url ?? DEFAULT_URL), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "User-Agent": `popnow-mcp/${VERSION}`,
      },
    },
  });

  // Ids of in-flight `initialize` requests, so the negotiated protocol version can be
  // handed to the HTTP transport (it sends it as the MCP-Protocol-Version header).
  const initializeIds = new Set<string | number>();
  let closed = false;

  remote.onmessage = (message: JSONRPCMessage) => {
    if (isJSONRPCResultResponse(message) && initializeIds.delete(message.id)) {
      const version = (message.result as { protocolVersion?: unknown }).protocolVersion;
      if (typeof version === "string") remote.setProtocolVersion(version);
    }
    local.send(message).catch((err: unknown) => log(`could not write to the local client: ${describe(err)}`));
  };

  local.onmessage = (message: JSONRPCMessage) => {
    if (isJSONRPCRequest(message) && message.method === "initialize") initializeIds.add(message.id);
    remote.send(message).catch((err: unknown) => {
      log(`request to ${options.url ?? DEFAULT_URL} failed: ${describe(err)}`);
      // Answer failed requests so the local client does not wait forever.
      if (isJSONRPCRequest(message)) {
        initializeIds.delete(message.id);
        const reply: JSONRPCMessage = {
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32603,
            message:
              `PopNow MCP server unreachable or rejected the request: ${describe(err)}` +
              ((err as { code?: unknown }).code === 401
                ? ". Check that POPNOW_API_KEY is an active key from https://popnow.ai/api/console/keys"
                : ""),
          },
        };
        local.send(reply).catch(() => undefined);
      }
    });
  };

  remote.onerror = (err: Error) => log(`remote error: ${describe(err)}`);
  local.onerror = (err: Error) => log(`local error: ${describe(err)}`);

  const close = async () => {
    if (closed) return;
    closed = true;
    await Promise.allSettled([remote.close(), local.close()]);
  };
  remote.onclose = () => void close();
  local.onclose = () => void close();

  return {
    async start() {
      await remote.start();
      await local.start();
    },
    close,
  };
}

function describe(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: unknown }).code;
    return typeof code === "number" ? `${err.message} (HTTP ${code})` : err.message;
  }
  return String(err);
}
