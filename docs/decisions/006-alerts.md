# 006 Alerts, verified live

Date: 2026-10-28

- Bot: @PreflightAlertsbot. Token stored in `web/.env.local`, the Vercel project env and the GitHub Actions secret `TELEGRAM_BOT_TOKEN`; never printed or committed
- A watch on UID 0 of SN64 (a real mainnet miner no validator scores) was created with a one-time code; the owner sent `/start <code>` to the bot
- `preflight watch run`: "Checked 1 watches, linked 1 chats, 1 new alerts, 1 delivered", a confirmation then the PF108 alert with its fix and the Doctor link, through the real Bot API
- The next run: "0 new alerts, 0 delivered". One problem sends one alert until it changes
- The scheduled workflow (`.github/workflows/watch.yml`, every 10 minutes on the public repository) ran with the repository secrets, reached Neon and the bot, and finished green
- The delivery path is also covered offline by `tests/unit/test_telegram_delivery.py` against a local stand-in for the Bot API

## The bot answers commands too

Date: 2026-10-28

- Telegram posts each message to `POST /v1/telegram/webhook`. The route answers only requests carrying `X-Telegram-Bot-Api-Secret-Token` equal to `TELEGRAM_WEBHOOK_SECRET` (compared in constant time); anything else gets the same 404 as a route that does not exist. The secret lives in `web/.env.local` and the Vercel env and is never printed
- Telegram's servers carry every chat, so the IP rate limit would throttle all users at once. The webhook is exempt from it and limits each chat to 12 messages a minute instead
- Commands map onto the same engines as the CLI, API and MCP; anything that is not a command goes through the Ask router, so a pasted hotkey runs the Doctor and a pasted block-index runs the debugger. Replies are Telegram HTML with every chain value escaped; if Telegram refuses the markup the plain text is sent
- Telegram refuses `getUpdates` while a webhook is set, so the scheduled worker checks `getWebhookInfo` and leaves `/start <code>` linking to the webhook, which links at once instead of within ten minutes
- `preflight bot webhook` sets the webhook and publishes the 13 command menu; `preflight bot ask "<message>"` answers exactly as the bot would, without Telegram
- Verified on production: a signed update for `/weather` ran the engine and reached the Bot API (refused only because the test chat did not exist); an unsigned one got 404; `getWebhookInfo` showed no delivery errors
