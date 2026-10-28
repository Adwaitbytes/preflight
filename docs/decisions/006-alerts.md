# 006 Alerts, verified live

Date: 2026-10-28

- Bot: @PreflightAlertsbot. Token stored in `web/.env.local`, the Vercel project env and the GitHub Actions secret `TELEGRAM_BOT_TOKEN`; never printed or committed
- A watch on UID 0 of SN64 (a real mainnet miner no validator scores) was created with a one-time code; the owner sent `/start <code>` to the bot
- `preflight watch run`: "Checked 1 watches, linked 1 chats, 1 new alerts, 1 delivered", a confirmation then the PF108 alert with its fix and the Doctor link, through the real Bot API
- The next run: "0 new alerts, 0 delivered". One problem sends one alert until it changes
- The scheduled workflow (`.github/workflows/watch.yml`, every 10 minutes on the public repository) ran with the repository secrets, reached Neon and the bot, and finished green
- The delivery path is also covered offline by `tests/unit/test_telegram_delivery.py` against a local stand-in for the Bot API
