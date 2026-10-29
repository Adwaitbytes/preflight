"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { allowAttempt, forgetAttempts, issueSession, passwordMatches, SESSION_SECONDS, STATS_COOKIE, statsEnabled } from "@/lib/stats-auth";

export interface LoginState {
  error: string | null;
}

const FAILED_LOGIN_DELAY_MS = 600;

export async function login(_previous: LoginState, form: FormData): Promise<LoginState> {
  if (!statsEnabled()) return { error: "Stats are switched off. Set STATS_PASSWORD on the server to turn them on" };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (!allowAttempt(ip)) return { error: "Too many attempts from here. Wait ten minutes, then try again" };
  const password = form.get("password");
  if (typeof password !== "string" || !passwordMatches(password)) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return { error: "That password is not right" };
  }
  forgetAttempts(ip);
  (await cookies()).set(STATS_COOKIE, issueSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/stats",
    maxAge: SESSION_SECONDS,
  });
  redirect("/stats");
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: STATS_COOKIE, path: "/stats" });
  redirect("/stats");
}
