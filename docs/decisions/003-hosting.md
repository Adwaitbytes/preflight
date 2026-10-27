# 003 Hosting the API

Date: 2026-10-28, Day 1 night. Measured with a throwaway project `preflight-api-spike` on Vercel, Fluid Compute

## Question

Can the hosted site run the real Python engine on Vercel, or does it need a TypeScript read layer (BUILD.md section 7)

## Measured

A FastAPI app in `api/index.py`, `requirements.txt` with `bittensor>=11.3,<12`, `.python-version` 3.13, `"fluid": true`

| Request | Total time | Inside the function |
|---|---|---|
| First, cold | 2.83 s | `import bittensor` 0.87 s, connect and read finney head 2.15 s |
| Second, warm | 0.72 s | read 0.11 s |
| Third, warm | 0.77 s | read 0.11 s |

Install worked with no extra build steps: bittensor 11.3.0 and its native wheels resolve for Python 3.13 on Vercel's Linux image

## Routing gotcha

With a rewrite `/v1/(.*) -> /api/index`, the ASGI app sees `scope["path"] == "/api/index"`: the original path is gone and only the query string survives. Fix, verified on the spike: rewrite to `/api/index?__path=:path*` and wrap the app in a tiny ASGI shim that restores `/v1/<path>` and strips `__path` and Vercel's own `path` parameter before FastAPI routes the request

## Decision

- The hosted API is the Python engine itself on a Vercel Python function in the `preflight` project, next to the Next.js app. No TypeScript duplicate of the rules, so no drift to guard against
- Cold start (2.8 s) fits the 5 s mainnet diagnosis budget only with a warm client, so the function keeps one pooled `Subtensor` per endpoint across invocations (Fluid Compute reuses instances) and the site pings `/v1/health` on page load to warm it
- `preflight serve` runs the same app locally with `PREFLIGHT_LOCAL=1` for localnet and custom endpoints
