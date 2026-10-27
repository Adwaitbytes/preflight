/** Install lines, as README.md gives them. One copy, so the footer and the guide never disagree */

export const REPO = "git+https://github.com/Adwaitbytes/preflight";

export const CLI_INSTALL = `uv tool install ${REPO}`;

export const MCP_INSTALL = `claude mcp add preflight -- uvx --from ${REPO} preflight mcp`;

/** The hosted API, as docs/llms.txt documents it */
export const API_BASE = "https://preflight-lemon.vercel.app";
