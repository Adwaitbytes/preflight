"use client";

import { useEffect, useRef } from "react";
import seats from "@/data/seats.json";

/** One column per subnet, one dot per miner seat, as measured at seats.block */
const COLUMNS = seats.seats as [netuid: number, miners: number, earning: number][];
const MAX_ROWS = 256;
const EARN = [124, 147, 255] as const;
const ZERO = [150, 160, 190] as const;

/** Deterministic, so the field looks the same on every visit and in every screenshot */
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

interface Dot {
  x: number;
  y: number;
  earning: boolean;
  phase: number;
}

function layout(width: number, height: number): { dots: Dot[]; size: number } {
  const colW = width / COLUMNS.length;
  const rowH = height / MAX_ROWS;
  const size = Math.max(1.2, Math.min(colW * 0.42, rowH * 0.62));
  const dots: Dot[] = [];
  COLUMNS.forEach(([netuid, miners, earning], col) => {
    const rows = Math.min(miners, MAX_ROWS);
    const random = rng(netuid * 7919 + 17);
    // Earning seats land on random rows of their column, so the light reads as a scatter, not a bar
    const lit = new Set<number>();
    while (lit.size < Math.min(earning, rows)) lit.add(Math.floor(random() * rows));
    for (let r = 0; r < rows; r++) {
      dots.push({ x: (col + 0.5) * colW, y: height - (r + 0.5) * rowH, earning: lit.has(r), phase: random() * Math.PI * 2 });
    }
  });
  return { dots, size };
}

/**
 * Every miner seat on Bittensor as a dot: lit if it earned at the last epoch, dim if it earned
 * nothing. Drawn once, then a slow shimmer on the lit ones while it is on screen; still under
 * prefers-reduced-motion.
 */
export function SeatField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let visible = true;
    let field = { dots: [] as Dot[], size: 1 };
    let base: HTMLCanvasElement | null = null;

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (base) ctx.drawImage(base, 0, 0);
      const dpr = window.devicePixelRatio || 1;
      for (const d of field.dots) {
        if (!d.earning) continue;
        const pulse = reduce ? 0.85 : 0.6 + 0.4 * Math.sin(t / 900 + d.phase);
        ctx.fillStyle = `rgba(${EARN[0]}, ${EARN[1]}, ${EARN[2]}, ${0.18 * pulse})`;
        ctx.beginPath();
        ctx.arc(d.x * dpr, d.y * dpr, field.size * 2.6 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${EARN[0]}, ${EARN[1]}, ${EARN[2]}, ${0.55 + 0.45 * pulse})`;
        ctx.beginPath();
        ctx.arc(d.x * dpr, d.y * dpr, field.size * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      field = layout(rect.width, rect.height);
      // The dim seats never change: paint them once to an offscreen layer
      base = document.createElement("canvas");
      base.width = canvas.width;
      base.height = canvas.height;
      const b = base.getContext("2d");
      if (b) {
        b.fillStyle = `rgba(${ZERO[0]}, ${ZERO[1]}, ${ZERO[2]}, 0.16)`;
        for (const d of field.dots) {
          if (d.earning) continue;
          b.beginPath();
          b.arc(d.x * dpr, d.y * dpr, field.size * 0.8 * dpr, 0, Math.PI * 2);
          b.fill();
        }
      }
      draw(performance.now());
    };

    const loop = (t: number) => {
      if (visible) draw(t);
      frame = requestAnimationFrame(loop);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting) && document.visibilityState === "visible";
    });
    io.observe(canvas);
    if (!reduce) frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
