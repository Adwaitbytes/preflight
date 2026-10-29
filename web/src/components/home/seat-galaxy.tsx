"use client";

import { useEffect, useRef, useState } from "react";
import seats from "@/data/seats.json";
import { cn } from "@/lib/utils";
import { SeatField } from "./seat-field";

type Column = [netuid: number, miners: number, earning: number];
const COLUMNS = seats.seats as Column[];
const MAX_ROWS = 256;
const INNER = 1.15;
const OUTER = 4.7;
const TWIST = 0.42;
const TAU = Math.PI * 2;
const RING_OPACITY = 0.1;

export interface HoveredSubnet {
  netuid: number;
  miners: number;
  earning: number;
  x: number;
  y: number;
}

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** Each subnet is a spoke; each seat a point along it. Earning seats are scattered along their spoke */
function buildSeats(): { positions: Float32Array; earn: Float32Array; spoke: Float32Array; seed: Float32Array } {
  const total = COLUMNS.reduce((sum, [, miners]) => sum + Math.min(miners, MAX_ROWS), 0);
  const positions = new Float32Array(total * 3);
  const earn = new Float32Array(total);
  const spoke = new Float32Array(total);
  const seed = new Float32Array(total);
  let i = 0;
  COLUMNS.forEach(([netuid, miners, earning], index) => {
    const rows = Math.min(miners, MAX_ROWS);
    const random = rng(netuid * 7919 + 17);
    const lit = new Set<number>();
    while (lit.size < Math.min(earning, rows)) lit.add(Math.floor(random() * rows));
    const base = (index / COLUMNS.length) * TAU;
    for (let r = 0; r < rows; r++) {
      const radius = INNER + (OUTER - INNER) * ((r + random() * 0.6) / MAX_ROWS);
      const angle = base + radius * TWIST + (random() - 0.5) * 0.018;
      const lift = (random() - 0.5) * 0.09 * (1.2 - radius / OUTER);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = lift;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      earn[i] = lit.has(r) ? 1 : 0;
      spoke[i] = index;
      seed[i] = random();
      i++;
    }
  });
  return { positions, earn, spoke, seed };
}

const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uSweep;
uniform float uHover;
uniform float uPixelRatio;
uniform float uSize;
uniform float uFade;
attribute float aEarn;
attribute float aSpoke;
attribute float aSeed;
varying float vEarn;
varying float vGlow;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float ang = atan(position.z, position.x);
  float behind = mod(uSweep - ang + 12.566370, 6.283185);
  float trail = exp(-behind * 2.6);
  float pulse = 0.65 + 0.35 * sin(uTime * 1.3 + aSeed * 6.283185);
  float hover = 1.0 - step(0.5, abs(aSpoke - uHover));
  vEarn = aEarn;
  vGlow = aEarn * pulse + trail * (0.55 + aEarn * 0.9) + hover * 0.9;
  float size = uSize * mix(1.0, 2.5, aEarn) * (1.0 + trail * 0.9 + hover * 0.7);
  gl_PointSize = size * uPixelRatio * (9.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const FRAGMENT = /* glsl */ `
uniform float uFade;
varying float vEarn;
varying float vGlow;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float soft = pow(smoothstep(0.5, 0.0, d), 2.0);
  vec3 dust = vec3(0.56, 0.61, 0.78);
  vec3 earn = vec3(0.45, 0.56, 1.0);
  vec3 hot = vec3(0.86, 0.91, 1.0);
  vec3 col = mix(dust, earn, vEarn);
  col = mix(col, hot, clamp(vGlow - 0.9, 0.0, 1.0) * 0.7);
  float alpha = uFade * soft * mix(0.07 + 0.55 * clamp(vGlow, 0.0, 1.0), 0.5 + 0.5 * clamp(vGlow, 0.0, 1.4), vEarn);
  if (alpha < 0.008) discard;
  gl_FragColor = vec4(col * alpha, alpha);
}`;

const BEAM_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const BEAM_FRAGMENT = /* glsl */ `
uniform float uSweep;
uniform float uFade;
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0 || r < 0.22) discard;
  float ang = atan(p.y, p.x);
  float behind = mod(uSweep - ang + 12.566370, 6.283185);
  float wedge = exp(-behind * 5.0) * smoothstep(1.0, 0.55, r);
  float edge = exp(-behind * 60.0) * 0.35;
  float a = uFade * (wedge * 0.16 + edge * 0.35) * smoothstep(0.22, 0.4, r);
  gl_FragColor = vec4(vec3(0.45, 0.58, 1.0) * a, a);
}`;

/**
 * Every miner seat on Bittensor as a point of light: 128 subnets as spokes of a slowly turning
 * disc, seats that earned at the last epoch glowing, the rest dim. A radar sweep lights each seat
 * as it passes. Hovering a spoke names the subnet. WebGL via three.js, loaded after the page;
 * without WebGL it falls back to the flat field, and reduced motion gets one still frame.
 */
export function SeatGalaxy({ className, onHover }: { className?: string; onHover?: (subnet: HoveredSubnet | null) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [flat, setFlat] = useState(false);
  const hoverRef = useRef(onHover);
  useEffect(() => {
    hoverRef.current = onHover;
  }, [onHover]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
      } catch {
        setFlat(true);
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);
      canvas.className = "block size-full";
      host.appendChild(canvas);

      // The shaders write premultiplied colour, so light simply adds up: ONE + ONE on colour and alpha
      const ADDITIVE = {
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
      } as const;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      const disc = new THREE.Group();
      disc.rotation.x = 0.0;
      scene.add(disc);

      const data = buildSeats();
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
      geometry.setAttribute("aEarn", new THREE.BufferAttribute(data.earn, 1));
      geometry.setAttribute("aSpoke", new THREE.BufferAttribute(data.spoke, 1));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(data.seed, 1));
      const uniforms = {
        uTime: { value: 0 },
        uSweep: { value: 0 },
        uHover: { value: -10 },
        uPixelRatio: { value: pixelRatio },
        uSize: { value: 3.2 },
        uFade: { value: reduce ? 1 : 0 },
      };
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms,
        transparent: true,
        depthWrite: false,
        ...ADDITIVE,
      });
      disc.add(new THREE.Points(geometry, material));

      // The radar beam and range rings sit in the disc's plane
      const beamGeometry = new THREE.PlaneGeometry(OUTER * 2.2, OUTER * 2.2);
      beamGeometry.rotateX(-Math.PI / 2);
      const beamMaterial = new THREE.ShaderMaterial({
        vertexShader: BEAM_VERTEX,
        fragmentShader: BEAM_FRAGMENT,
        uniforms: { uSweep: uniforms.uSweep, uFade: uniforms.uFade },
        transparent: true,
        depthWrite: false,
        ...ADDITIVE,
      });
      // The plane's UV runs opposite to the disc's z, so mirror it to keep the beam on the seats it lights
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.scale.z = -1;
      disc.add(beam);
      const ringMaterial = new THREE.LineBasicMaterial({ color: 0x7c93ff, transparent: true, opacity: 0 });
      const rings: InstanceType<typeof THREE.LineLoop>[] = [];
      for (const radius of [INNER - 0.1, 2.3, 3.5, OUTER + 0.15]) {
        const points = Array.from({ length: 160 }, (_, k) => new THREE.Vector3(Math.cos((k / 160) * TAU) * radius, 0, Math.sin((k / 160) * TAU) * radius));
        const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), ringMaterial);
        rings.push(ring);
        disc.add(ring);
      }

      const pointer = { x: 0, y: 0, tx: 0, ty: 0, inside: false, sx: 0, sy: 0 };
      const raycaster = new THREE.Raycaster();
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();
      let lastHover = -10;

      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(height, 1);
        // Wide screens put the disc to the right of the headline; narrow ones sink it below the text
        const wide = camera.aspect > 1.15;
        disc.position.set(wide ? 2.9 : 0, wide ? -0.2 : -1.6, wide ? 0 : -1.5);
        camera.position.set(0, wide ? 5.4 : 7.4, wide ? 7.6 : 8.6);
        camera.lookAt(0, wide ? -0.4 : 0.2, 0);
        camera.updateProjectionMatrix();
      };

      const onMove = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        pointer.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.ty = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        pointer.sx = event.clientX - rect.left;
        pointer.sy = event.clientY - rect.top;
        pointer.inside = true;
        // Reduced motion draws no loop, so hover picks and redraws on the event itself
        if (reduce) {
          pick();
          renderer.render(scene, camera);
        }
      };
      const onLeave = () => {
        pointer.inside = false;
        pointer.tx = 0;
        pointer.ty = 0;
        if (reduce) {
          pick();
          renderer.render(scene, camera);
        }
      };

      const pick = () => {
        if (!pointer.inside) {
          if (lastHover !== -10) {
            lastHover = -10;
            uniforms.uHover.value = -10;
            hoverRef.current?.(null);
          }
          return;
        }
        raycaster.setFromCamera(new THREE.Vector2(pointer.tx, pointer.ty), camera);
        if (!raycaster.ray.intersectPlane(plane, hit)) return;
        const local = disc.worldToLocal(hit.clone());
        const radius = Math.hypot(local.x, local.z);
        let index = -10;
        if (radius > INNER - 0.25 && radius < OUTER + 0.3) {
          const angle = Math.atan2(local.z, local.x) - radius * TWIST;
          index = ((Math.round((angle / TAU) * COLUMNS.length) % COLUMNS.length) + COLUMNS.length) % COLUMNS.length;
        }
        if (index !== lastHover) {
          lastHover = index;
          uniforms.uHover.value = index;
          const column = index >= 0 ? COLUMNS[index] : undefined;
          hoverRef.current?.(column ? { netuid: column[0], miners: column[1], earning: column[2], x: pointer.sx, y: pointer.sy } : null);
        }
      };

      let frame = 0;
      let visible = true;
      let last = performance.now();
      const render = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (visible) {
          uniforms.uTime.value = now / 1000;
          uniforms.uFade.value = Math.min(1, uniforms.uFade.value + dt * 0.8);
          ringMaterial.opacity = uniforms.uFade.value * RING_OPACITY;
          uniforms.uSweep.value = (uniforms.uSweep.value + dt * 0.9) % TAU;
          disc.rotation.y -= dt * 0.035;
          pointer.x += (pointer.tx - pointer.x) * 0.04;
          pointer.y += (pointer.ty - pointer.y) * 0.04;
          scene.rotation.x = pointer.y * 0.06;
          scene.rotation.z = -pointer.x * 0.03;
          pick();
          renderer.render(scene, camera);
        }
        frame = requestAnimationFrame(render);
      };

      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(host);
      const io = new IntersectionObserver(([entry]) => {
        visible = Boolean(entry?.isIntersecting);
      });
      io.observe(host);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      if (reduce) {
        uniforms.uSweep.value = 1.2;
        ringMaterial.opacity = RING_OPACITY;
        renderer.render(scene, camera);
      } else {
        frame = requestAnimationFrame(render);
      }
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        io.disconnect();
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        geometry.dispose();
        material.dispose();
        beamGeometry.dispose();
        beamMaterial.dispose();
        ringMaterial.dispose();
        rings.forEach((ring) => ring.geometry.dispose());
        renderer.dispose();
        canvas.remove();
      };
    }, () => setFlat(true));

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div ref={hostRef} aria-hidden className="absolute inset-0" />
      {flat && <SeatField className="absolute inset-0 size-full" />}
    </div>
  );
}
