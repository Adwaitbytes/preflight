/** The Telegram bot as the site presents it. The commands mirror `COMMANDS` in `src/preflight/bot.py` */

export const BOT_USERNAME = "PreflightAlertsbot";
export const BOT_URL = `https://t.me/${BOT_USERNAME}`;

export interface BotCommand {
  command: string;
  args: string;
  does: string;
  example: string;
}

export const BOT_COMMANDS: readonly BotCommand[] = [
  { command: "/doctor", args: "<hotkey> [netuid]", does: "Why a hotkey earns what it earns, with the fix", example: "/doctor 5EKtvz… 64" },
  { command: "/why", args: "<hotkey> <netuid> [epochs]", does: "Which validators moved its incentive", example: "/why 5FcJiV… 19 3" },
  { command: "/epoch", args: "<netuid> [hotkey]", does: "What the next epoch pays, before it runs", example: "/epoch 19 5FcJiV…" },
  { command: "/fleet", args: "<coldkey>", does: "Every seat a coldkey owns, worst first", example: "/fleet 5DFVgQ…" },
  { command: "/tx", args: "<block-index or hash>", does: "Decode a transaction and explain a failure", example: "/tx 9376733-28" },
  { command: "/explain", args: "<error>", does: "What an error means, and the fix", example: "/explain SameNetuid" },
  { command: "/mine", args: "<netuid>", does: "What mining a subnet pays today", example: "/mine 19" },
  { command: "/subnet", args: "<netuid>", does: "Health, seats and registration cost", example: "/subnet 64" },
  { command: "/weather", args: "", does: "What is failing on chain right now", example: "/weather" },
  { command: "/live", args: "", does: "The latest two blocks as sentences", example: "/live" },
  { command: "/plan", args: "", does: "What launching a subnet costs now", example: "/plan" },
  { command: "/find", args: "<words>", does: "Subnets that do something", example: "/find inference" },
  { command: "/watch", args: "<hotkey> <netuid>", does: "Message this chat when it breaks", example: "/watch 5EKtvz… 64" },
];
