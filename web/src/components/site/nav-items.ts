import {
  BookOpen,
  Braces,
  Building2,
  CloudSun,
  FlaskConical,
  GitBranch,
  LayoutGrid,
  type LucideIcon,
  MessageSquareText,
  Radio,
  Receipt,
  Rocket,
  Send,
  Sparkles,
  Stethoscope,
  Timer,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** The site map the header menus, the phone menu and the footer all read */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Tools",
    items: [
      { href: "/", label: "Doctor", description: "Why a miner or validator earns nothing", icon: Stethoscope },
      { href: "/epoch", label: "Epoch Lab", description: "The next epoch’s pay, before it runs", icon: Timer },
      { href: "/tx/finney/9382178-8", label: "Transaction debugger", description: "Why a transaction failed, and the fix", icon: Receipt },
      { href: "/sim", label: "Simulator", description: "Test a transaction before you pay for it", icon: FlaskConical },
      { href: "/explain", label: "Explain an error", description: "Any of 406 chain errors in plain words", icon: MessageSquareText },
    ],
  },
  {
    title: "Network",
    items: [
      { href: "/live", label: "Live explorer", description: "Every block and transaction as it lands", icon: Radio },
      { href: "/weather", label: "Network weather", description: "What is failing on chain right now", icon: CloudSun },
      { href: "/subnets", label: "Subnet directory", description: "All 128 subnets and how they pay", icon: LayoutGrid },
    ],
  },
  {
    title: "Build",
    items: [
      { href: "/plan", label: "Launch planner", description: "Plan a subnet before you lock TAO", icon: Rocket },
      { href: "/guide#surfaces", label: "Your own Claude", description: "Thirteen tools Claude can call", icon: Sparkles },
      { href: "/bot", label: "Telegram bot", description: "Ask in chat, get warned before a cut", icon: Send },
      { href: "/v1/docs", label: "Open API", description: "Typed, versioned and free", icon: Braces },
      { href: "https://github.com/Adwaitbytes/preflight", label: "GitHub", description: "Open source, with a CI Action", icon: GitBranch },
      { href: "/house", label: "Builders House", description: "Live counters from the week", icon: Building2 },
    ],
  },
];

export const GUIDE: NavItem = { href: "/guide", label: "Guide", description: "How Bittensor pays, and every rule we check", icon: BookOpen };

/** The API docs and GitHub live outside the Next app, so they take a plain link and a full load */
export function isExternal(href: string): boolean {
  return href.startsWith("http") || href.startsWith("/v1/");
}

export function isCurrent(pathname: string, href: string): boolean {
  const path = href.split("#")[0] ?? href;
  if (path === "/") return pathname === "/" || pathname.startsWith("/doctor/");
  if (path.startsWith("/tx/")) return pathname.startsWith("/tx/");
  return pathname === path || pathname.startsWith(`${path}/`);
}
