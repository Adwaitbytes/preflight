/**
 * One subnet, one tempo: validators query and score miners, write weights to the chain, consensus
 * runs every tempo and emission flows back in alpha. Two drawings of the same figure: the wide one
 * only from xl, where it renders near full size, and a tall one capped at 420 px everywhere else,
 * so labels stay at about 11 px or more at every width.
 * The 41/41/18 split is the default from https://www.bittensor.com/docs/concepts/emissions
 */

const STEPS = [
  "Validators send miners the subnet's task and score the answers",
  "They write those scores to the chain as weights, with set_weights",
  "Every tempo, 360 blocks or about 72 minutes, Yuma Consensus turns the stake weighted weights into incentive and dividends",
  "Emission is paid in the subnet's alpha: 41% to miners, 41% to validators and their stakers, 18% to the owner",
];

function Badge({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} className="fill-background stroke-accent" strokeWidth={1.5} />
      <text x={x} y={y + 4} textAnchor="middle" className="fill-accent-ink font-mono text-[11px] font-semibold">
        {n}
      </text>
    </g>
  );
}

function Markers({ prefix }: { prefix: string }) {
  return (
    <defs>
      <marker id={`${prefix}-arrow`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M1 1.5 L8.5 5 L1 8.5" fill="none" className="stroke-faint" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      </marker>
      <marker id={`${prefix}-arrow-accent`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M1 1.5 L8.5 5 L1 8.5" fill="none" className="stroke-accent" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      </marker>
    </defs>
  );
}

/** The weights a validator set, as a tiny heat grid: rows are validators, columns miners */
function WeightGrid({ x, y, cell }: { x: number; y: number; cell: number }) {
  const rows = [
    [0.9, 0.55, 0.3],
    [0.35, 0.8, 0.2],
  ];
  return (
    <g>
      {rows.map((row, r) =>
        row.map((v, c) => (
          <rect
            key={`${r}-${c}`}
            x={x + c * (cell + 5)}
            y={y + r * (cell + 5)}
            width={cell}
            height={cell}
            rx={4}
            className="fill-accent"
            fillOpacity={v}
          />
        )),
      )}
    </g>
  );
}

function WideDiagram() {
  const miners = [48, 122, 196];
  const minerBars = [52, 36, 20];
  return (
    <svg viewBox="0 0 880 404" className="hidden h-auto w-full xl:block" role="img" aria-labelledby="gdw-title gdw-desc">
      <title id="gdw-title">How a subnet pays: validators score miners, weights go on chain, consensus pays out each tempo</title>
      <desc id="gdw-desc">{STEPS.map((s, i) => `${i + 1}. ${s}.`).join(" ")}</desc>
      <Markers prefix="gdw" />

      <text x={24} y={30} className="fill-faint font-mono text-[12px] tracking-[0.08em]">
        MINERS
      </text>
      <text x={330} y={30} className="fill-faint font-mono text-[12px] tracking-[0.08em]">
        VALIDATORS
      </text>
      <text x={640} y={30} className="fill-faint font-mono text-[12px] tracking-[0.08em]">
        THE CHAIN
      </text>

      {/* 1: query and score */}
      {[
        "M330,104 C276,104 274,77 222,77",
        "M330,104 C276,104 274,151 222,151",
        "M330,198 C276,198 274,151 222,151",
        "M330,198 C276,198 274,225 222,225",
      ].map((d) => (
        <path key={d} d={d} fill="none" className="flow-line stroke-faint" strokeWidth={1.25} markerEnd="url(#gdw-arrow)" />
      ))}
      <Badge x={276} y={151} n={1} />

      {miners.map((y, i) => (
        <g key={y}>
          <rect x={24} y={y} width={196} height={58} rx={12} className="fill-surface stroke-line-strong" strokeWidth={1} />
          <text x={42} y={y + 25} className="fill-foreground text-[16px] font-semibold">
            Miner
          </text>
          <text x={42} y={y + 43} className="fill-muted-foreground text-[13.5px]">
            does the subnet&apos;s work
          </text>
          <text x={130} y={y + 24} textAnchor="end" className="fill-faint font-mono text-[12px]">
            score
          </text>
          <rect x={136} y={y + 18} width={56} height={5} rx={2.5} className="fill-surface-3" />
          <rect x={136} y={y + 18} width={minerBars[i]} height={5} rx={2.5} className="fill-accent" />
        </g>
      ))}

      {[
        { y: 70, label: "more say", bar: 150 },
        { y: 164, label: "less say", bar: 56 },
      ].map((v) => (
        <g key={v.y}>
          <rect x={330} y={v.y} width={210} height={68} rx={12} className="fill-surface stroke-line-strong" strokeWidth={1} />
          <text x={348} y={v.y + 26} className="fill-foreground text-[16px] font-semibold">
            Validator
          </text>
          <rect x={348} y={v.y + 42} width={174} height={6} rx={3} className="fill-surface-3" />
          <rect x={348} y={v.y + 42} width={v.bar} height={6} rx={3} className="fill-foreground/70" />
          <text x={348} y={v.y + 62} className="fill-faint font-mono text-[12px]">
            stake
          </text>
          <text x={522} y={v.y + 62} textAnchor="end" className="fill-muted-foreground text-[13.5px]">
            {v.label}
          </text>
        </g>
      ))}

      {/* 2: set_weights */}
      <path d="M542,104 C590,104 594,116 638,116" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdw-arrow-accent)" />
      <path d="M542,198 C590,198 594,186 638,186" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdw-arrow-accent)" />
      <Badge x={590} y={151} n={2} />

      <rect x={640} y={48} width={216} height={206} rx={14} className="fill-surface stroke-line-strong" strokeWidth={1} />
      <text x={658} y={74} className="fill-foreground text-[16px] font-semibold">
        Weights on chain
      </text>
      <text x={658} y={92} className="fill-muted-foreground text-[13.5px]">
        one row per validator
      </text>
      <WeightGrid x={658} y={106} cell={24} />
      <text x={758} y={124} className="fill-faint font-mono text-[12px]">
        set_weights
      </text>
      <text x={758} y={152} className="fill-faint font-mono text-[12px]">
        latest only
      </text>
      <line x1={658} x2={838} y1={176} y2={176} className="stroke-line" strokeWidth={1} />
      <text x={658} y={202} className="fill-foreground text-[16px] font-semibold">
        Yuma Consensus
      </text>
      <text x={658} y={222} className="fill-muted-foreground text-[13.5px]">
        once per tempo
      </text>
      <text x={658} y={240} className="fill-accent-ink font-mono text-[12.5px]">
        360 blocks, about 72 min
      </text>

      {/* 3: consensus to emission */}
      <path d="M748,256 L748,306" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdw-arrow-accent)" />
      <Badge x={748} y={281} n={3} />

      {/* 4: emission back to miners and validators */}
      <path d="M122,306 L122,258" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdw-arrow-accent)" />
      <path d="M435,306 L435,236" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdw-arrow-accent)" />
      <Badge x={122} y={281} n={4} />
      <Badge x={435} y={276} n={4} />

      <rect x={24} y={308} width={832} height={50} rx={12} className="fill-surface stroke-line-strong" strokeWidth={1} />
      <rect x={30} y={314} width={335} height={38} rx={8} className="fill-accent/20" />
      <rect x={369} y={314} width={337} height={38} rx={8} className="fill-accent/12" />
      <rect x={710} y={314} width={140} height={38} rx={8} className="fill-surface-3" />
      <text x={46} y={338} className="fill-foreground text-[14.5px] font-medium">
        Miners <tspan className="fill-accent-ink font-mono">41%</tspan>
      </text>
      <text x={385} y={338} className="fill-foreground text-[14.5px] font-medium">
        Validators and stakers <tspan className="fill-accent-ink font-mono">41%</tspan>
      </text>
      <text x={726} y={338} className="fill-foreground text-[14.5px] font-medium">
        Owner <tspan className="fill-muted-foreground font-mono">18%</tspan>
      </text>
      <text x={24} y={386} className="fill-faint font-mono text-[12px] tracking-[0.08em]">
        EMISSION, PAID IN THE SUBNET&apos;S ALPHA EVERY TEMPO
      </text>
    </svg>
  );
}

function TallDiagram() {
  const miners = [36, 142, 248];
  return (
    <svg viewBox="0 0 360 560" className="mx-auto block h-auto w-full max-w-[420px] xl:hidden" role="img" aria-labelledby="gdt-title gdt-desc">
      <title id="gdt-title">How a subnet pays: validators score miners, weights go on chain, consensus pays out each tempo</title>
      <desc id="gdt-desc">{STEPS.map((s, i) => `${i + 1}. ${s}.`).join(" ")}</desc>
      <Markers prefix="gdt" />

      {[
        "M106,152 C106,118 86,116 86,84",
        "M106,152 C106,118 192,116 192,84",
        "M266,152 C266,118 192,116 192,84",
        "M266,152 C266,118 298,116 298,84",
      ].map((d) => (
        <path key={d} d={d} fill="none" className="flow-line stroke-faint" strokeWidth={1.25} markerEnd="url(#gdt-arrow)" />
      ))}
      <Badge x={146} y={118} n={1} />

      {miners.map((x) => (
        <g key={x}>
          <rect x={x} y={28} width={100} height={54} rx={11} className="fill-surface stroke-line-strong" strokeWidth={1} />
          <text x={x + 50} y={52} textAnchor="middle" className="fill-foreground text-[14px] font-semibold">
            Miner
          </text>
          <text x={x + 50} y={70} textAnchor="middle" className="fill-muted-foreground text-[12px]">
            does the work
          </text>
        </g>
      ))}

      {[
        { x: 36, bar: 104, label: "more stake" },
        { x: 196, bar: 40, label: "less stake" },
      ].map((v) => (
        <g key={v.x}>
          <rect x={v.x} y={154} width={152} height={62} rx={11} className="fill-surface stroke-line-strong" strokeWidth={1} />
          <text x={v.x + 14} y={178} className="fill-foreground text-[14px] font-semibold">
            Validator
          </text>
          <rect x={v.x + 14} y={190} width={124} height={5} rx={2.5} className="fill-surface-3" />
          <rect x={v.x + 14} y={190} width={v.bar} height={5} rx={2.5} className="fill-foreground/70" />
          <text x={v.x + 14} y={208} className="fill-faint font-mono text-[11.5px]">
            {v.label}
          </text>
        </g>
      ))}

      <path d="M112,218 C112,246 150,250 150,276" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdt-arrow-accent)" />
      <path d="M272,218 C272,246 236,250 236,276" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdt-arrow-accent)" />
      <Badge x={193} y={248} n={2} />

      <rect x={36} y={278} width={312} height={118} rx={13} className="fill-surface stroke-line-strong" strokeWidth={1} />
      <text x={52} y={302} className="fill-foreground text-[14px] font-semibold">
        Weights on chain
      </text>
      <WeightGrid x={52} y={316} cell={20} />
      <line x1={192} x2={192} y1={294} y2={380} className="stroke-line" strokeWidth={1} />
      <text x={206} y={302} className="fill-foreground text-[14px] font-semibold">
        Yuma Consensus
      </text>
      <text x={206} y={322} className="fill-muted-foreground text-[12px]">
        once per tempo
      </text>
      <text x={206} y={340} className="fill-accent-ink font-mono text-[11.5px]">
        360 blocks
      </text>
      <text x={206} y={356} className="fill-accent-ink font-mono text-[11.5px]">
        about 72 min
      </text>

      <path d="M192,398 L192,452" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdt-arrow-accent)" />
      <Badge x={192} y={425} n={3} />

      <rect x={36} y={454} width={312} height={56} rx={12} className="fill-surface stroke-line-strong" strokeWidth={1} />
      <rect x={41} y={459} width={124} height={46} rx={8} className="fill-accent/20" />
      <rect x={168} y={459} width={124} height={46} rx={8} className="fill-accent/12" />
      <rect x={295} y={459} width={48} height={46} rx={8} className="fill-surface-3" />
      {[
        { x: 103, name: "Miners", pct: "41%" },
        { x: 230, name: "Validators", pct: "41%" },
        { x: 319, name: "Owner", pct: "18%" },
      ].map((s) => (
        <g key={s.name}>
          <text x={s.x} y={478} textAnchor="middle" className="fill-foreground text-[12px] font-medium">
            {s.name}
          </text>
          <text x={s.x} y={496} textAnchor="middle" className="fill-accent-ink font-mono text-[11px]">
            {s.pct}
          </text>
        </g>
      ))}
      <text x={36} y={536} className="fill-faint font-mono text-[11.5px] tracking-[0.08em]">
        EMISSION IN ALPHA, EVERY TEMPO
      </text>

      {/* 4: emission returns along the left edge */}
      <path d="M36,482 L20,482 Q12,482 12,474 L12,63 Q12,55 20,55 L34,55" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdt-arrow-accent)" />
      <path d="M12,185 L34,185" fill="none" className="flow-line stroke-accent" strokeWidth={1.5} markerEnd="url(#gdt-arrow-accent)" />
      <Badge x={13} y={330} n={4} />
    </svg>
  );
}

export function NetworkDiagram() {
  return (
    <figure data-reveal className="panel overflow-hidden">
      <div className="px-3 pt-5 pb-2 sm:px-4 sm:pt-6">
        <WideDiagram />
        <TallDiagram />
      </div>
      <figcaption className="border-t border-line bg-surface-2/40 px-5 py-5 sm:px-6">
        <ol className="grid grid-cols-1 gap-x-8 gap-y-3 text-[13px] leading-5 text-muted-foreground sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-accent-ink shadow-[0_0_0_1.5px_var(--accent)]">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
