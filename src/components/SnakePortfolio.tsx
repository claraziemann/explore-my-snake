import { useEffect, useMemo, useRef, useState, useCallback } from "react";

type Category = "approach" | "project" | "resume" | "fact";
type LevelId = 1 | 2 | 3;

type Dot = {
  id: string;
  x: number;
  y: number;
  category: Category;
  label: string;
  title: string;
  body: string;
  meta?: string;
};

const CELL = 28;

const LEVEL_OF: Record<Category, LevelId> = {
  approach: 1,
  project: 2,
  resume: 3,
  fact: 3,
};

const LEVEL_META: Record<LevelId, { name: string; tagline: string; speed: number }> = {
  1: { name: "Level 1 · My Approach", tagline: "Eat the four pillars of how I work.", speed: 160 },
  2: { name: "Level 2 · Projects", tagline: "Faster snake. Four projects to collect.", speed: 120 },
  3: { name: "Level 3 · Résumé & Fun Facts", tagline: "Top speed. Eight bites left.", speed: 90 },
};

const DOTS: Dot[] = [
  // LEVEL 1 — APPROACH (4)
  { id: "a1", x: 8, y: 5, category: "approach", label: "01 / Listen",
    title: "Listen before you frame",
    body: "Strategy starts in other people's words. I run unstructured interviews, shadow real workflows, and read the silences between answers. The brief is never the brief.",
    meta: "PILLAR 01" },
  { id: "a2", x: 14, y: 9, category: "approach", label: "02 / Frame",
    title: "Frame the right problem",
    body: "A sharp question is worth more than a clever answer. I translate fuzzy ambition into a single insight a team can rally around — short enough to repeat, sharp enough to argue with.",
    meta: "PILLAR 02" },
  { id: "a3", x: 20, y: 6, category: "approach", label: "03 / Prototype",
    title: "Prototype the strategy",
    body: "Decks decide nothing. I build crude artifacts — a fake landing page, a Figma flow, a one-page narrative — so stakeholders can react to something instead of imagining it.",
    meta: "PILLAR 03" },
  { id: "a4", x: 26, y: 11, category: "approach", label: "04 / Ship",
    title: "Ship the smallest real thing",
    body: "Strategy that doesn't ship is fiction. I stay in the room through delivery, trading scope for evidence and protecting the original insight from a thousand small compromises.",
    meta: "PILLAR 04" },

  // LEVEL 2 — PROJECTS (4)
  { id: "p1", x: 6, y: 14, category: "project", label: "Northwind Bank",
    title: "Northwind Bank — onboarding rewrite",
    body: "Reframed a 14-step KYC flow around three user fears. Drop-off fell 38% in the first quarter; the team kept the new mental model for every product since.",
    meta: "FINTECH · 2024" },
  { id: "p2", x: 12, y: 16, category: "project", label: "Atlas Health",
    title: "Atlas Health — clinician copilot",
    body: "Led research and product strategy for a documentation assistant used by 1,200 clinicians. Cut after-hours charting by 47 minutes per shift.",
    meta: "HEALTHCARE · 2023" },
  { id: "p3", x: 22, y: 16, category: "project", label: "Field & Form",
    title: "Field & Form — brand to product",
    body: "Translated a new brand narrative into the actual product surface — pricing page, empty states, error copy. Conversion to paid grew 2.1× in six weeks.",
    meta: "SAAS · 2023" },
  { id: "p4", x: 28, y: 18, category: "project", label: "Civic Signals",
    title: "Civic Signals — policy prototyping",
    body: "Embedded with a city government to prototype housing policy with residents instead of for them. Two of three pilots became permanent programs.",
    meta: "PUBLIC · 2022" },

  // LEVEL 3 — RÉSUMÉ (4)
  { id: "r1", x: 5, y: 6, category: "resume", label: "Lead Strategist",
    title: "Lead Design Strategist · Foundry&Co",
    body: "2022 — present. Lead strategist for fintech and healthcare clients. Built the research practice from 2 to 7 people.",
    meta: "RÉSUMÉ" },
  { id: "r2", x: 11, y: 4, category: "resume", label: "Senior Designer",
    title: "Senior Product Designer · Northwind",
    body: "2019 — 2022. Owned onboarding and growth surfaces. Shipped the redesign that became the company's reference flow.",
    meta: "RÉSUMÉ" },
  { id: "r3", x: 17, y: 7, category: "resume", label: "Researcher",
    title: "Design Researcher · IDEO Lisbon",
    body: "2017 — 2019. Field research across EU public services. Co-authored the housing policy playbook now used by three city governments.",
    meta: "RÉSUMÉ" },
  { id: "r4", x: 23, y: 5, category: "resume", label: "MA HCI",
    title: "MA Human-Computer Interaction · UCL",
    body: "Distinction. Thesis on participatory prototyping in regulated industries. Awarded the Stephen Cook prize.",
    meta: "EDUCATION" },

  // LEVEL 3 — FUN FACTS (4)
  { id: "f1", x: 4, y: 12, category: "fact", label: "Bread",
    title: "I bake sourdough on deadline weeks",
    body: "Something about a 24-hour bulk ferment makes the strategy work feel less precious. Current starter is four years old and named Doris.",
    meta: "FUN FACT" },
  { id: "f2", x: 18, y: 13, category: "fact", label: "Maps",
    title: "I collect transit maps",
    body: "Twenty-three cities and counting. The Moscow 1979 metro diagram lives above my desk as a reminder that constraints are a design tool.",
    meta: "FUN FACT" },
  { id: "f3", x: 30, y: 6, category: "fact", label: "Chess",
    title: "I'm a mediocre but happy chess player",
    body: "1450 ELO, plays the London System without shame. Lost a game to a seven-year-old in Lisbon last spring. He had earned it.",
    meta: "FUN FACT" },
  { id: "f4", x: 24, y: 4, category: "fact", label: "Languages",
    title: "I think in three languages",
    body: "English for work, French for arguments, Portuguese for cooking. Strategy work is mostly about translating between mental languages anyway.",
    meta: "FUN FACT" },
];

const categoryColor: Record<Category, string> = {
  approach: "var(--accent)",
  project: "var(--signal-mint)",
  resume: "var(--primary)",
  fact: "var(--signal-violet)",
};

const categoryFood: Record<Category, string> = {
  approach: "🍓",
  project: "🍰",
  resume: "🍒",
  fact: "🍭",
};

const categoryLabel: Record<Category, string> = {
  approach: "MY APPROACH",
  project: "PROJECTS",
  resume: "RÉSUMÉ",
  fact: "FUN FACTS",
};

type Dir = { x: number; y: number };
const DIRS: Record<string, Dir> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

type Phase = "intro" | "level-intro" | "playing" | "level-complete" | "finished";

export default function SnakePortfolio() {
  const [size, setSize] = useState({ cols: 36, rows: 22 });
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 16, y: 11 },
    { x: 15, y: 11 },
    { x: 14, y: 11 },
  ]);
  const [dir, setDir] = useState<Dir>({ x: 1, y: 0 });
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<Dot | null>(null);
  const [level, setLevel] = useState<LevelId>(1);
  const [phase, setPhase] = useState<Phase>("intro");
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const burstId = useRef(0);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const levelDots = useMemo(() => DOTS.filter((d) => LEVEL_OF[d.category] === level), [level]);
  const levelDone = levelDots.every((d) => collected.has(d.id));

  // Resize
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setSize({
        cols: Math.max(20, Math.floor(w / CELL)),
        rows: Math.max(14, Math.floor(h / CELL)),
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Advance level when done
  useEffect(() => {
    if (phase === "playing" && levelDone && !active) {
      if (level === 3) {
        const t = window.setTimeout(() => setPhase("finished"), 400);
        return () => clearTimeout(t);
      }
      setPhase("level-complete");
    }
  }, [phase, levelDone, active, level]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(null);
        return;
      }
      if (phase === "intro" || phase === "level-intro") {
        if (e.key === " " || e.key === "Enter" || DIRS[e.key]) {
          e.preventDefault();
          setPhase("playing");
        }
        return;
      }
      if (phase === "level-complete") {
        if (e.key === " " || e.key === "Enter" || DIRS[e.key]) {
          e.preventDefault();
          setLevel((l) => (l === 3 ? 3 : ((l + 1) as LevelId)));
          setPhase("level-intro");
        }
        return;
      }
      const next = DIRS[e.key];
      if (!next) return;
      e.preventDefault();
      const cur = dirRef.current;
      if (cur.x + next.x === 0 && cur.y + next.y === 0) return;
      setDir(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // Game tick
  useEffect(() => {
    if (phase !== "playing" || active) return;
    const speed = LEVEL_META[level].speed;
    const id = window.setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        let nx = head.x + dirRef.current.x;
        let ny = head.y + dirRef.current.y;
        if (nx < 0) nx = size.cols - 1;
        if (nx >= size.cols) nx = 0;
        if (ny < 0) ny = size.rows - 1;
        if (ny >= size.rows) ny = 0;
        const newHead = { x: nx, y: ny };
        const hit = levelDots.find(
          (d) => d.x === nx && d.y === ny && !collected.has(d.id),
        );
        if (hit) {
          setCollected((c) => new Set(c).add(hit.id));
          const bid = ++burstId.current;
          setBursts((b) => [...b, { id: bid, x: hit.x, y: hit.y, color: categoryColor[hit.category] }]);
          window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== bid)), 800);
          window.setTimeout(() => setActive(hit), 220);
          return [newHead, ...prev];
        }
        return [newHead, ...prev.slice(0, -1)];
      });
    }, speed);
    return () => clearInterval(id);
  }, [phase, active, collected, size.cols, size.rows, level, levelDots]);

  const closeActive = useCallback(() => setActive(null), []);

  if (phase === "finished") {
    return <Onepager onReplay={() => {
      setCollected(new Set());
      setLevel(1);
      setSnake([{ x: 16, y: 11 }, { x: 15, y: 11 }, { x: 14, y: 11 }]);
      setDir({ x: 1, y: 0 });
      setPhase("intro");
    }} />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 grid-bg" />

      {/* HUD top */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between px-6 py-5 md:px-10 md:py-7">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {LEVEL_META[level].name}
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold leading-none md:text-3xl">
            Mira Cendrars
          </h1>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            Design strategist · Lisbon / remote
          </div>
        </div>
        <div className="flex items-end gap-3">
          {[1, 2, 3].map((l) => (
            <div
              key={l}
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{
                color: l === level ? "var(--primary)" : l < level ? "var(--muted-foreground)" : "var(--muted-foreground)",
                opacity: l === level ? 1 : 0.55,
              }}
            >
              {l < level ? "✓ " : l === level ? "▸ " : ""}Lv {l}
            </div>
          ))}
          <LevelProgress dots={levelDots} collected={collected} color={categoryColor[levelDots[0]?.category ?? "approach"]} />
        </div>
      </header>

      {/* HUD bottom */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-6 py-5 md:px-10 md:py-7">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Use <Key>←</Key> <Key>↑</Key> <Key>↓</Key> <Key>→</Key> to move · eat to read
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          mira@cendrars.studio
        </div>
      </footer>

      {/* Board */}
      <div
        className="absolute left-1/2 top-1/2 z-10"
        style={{
          width: size.cols * CELL,
          height: size.rows * CELL,
          transform: "translate(-50%, -50%)",
        }}
      >
        {levelDots.map((d) => {
          const taken = collected.has(d.id);
          const cx = Math.min(d.x, size.cols - 1) * CELL + CELL / 2;
          const cy = Math.min(d.y, size.rows - 1) * CELL + CELL / 2;
          return (
            <div key={d.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: cx, top: cy }}>
              <div
                className={taken ? "" : "animate-pulse-dot"}
                style={{
                  fontSize: 22,
                  lineHeight: 1,
                  textAlign: "center",
                  filter: taken ? "grayscale(1) opacity(0.35)" : `drop-shadow(0 0 10px ${categoryColor[d.category]})`,
                }}
              >
                {categoryFood[d.category]}
              </div>
              <div
                className="mt-1 whitespace-nowrap text-center font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: taken ? "var(--muted-foreground)" : categoryColor[d.category], opacity: taken ? 0.5 : 0.95 }}
              >
                {d.label}
              </div>
            </div>
          );
        })}

        {bursts.map((b) => {
          const cx = Math.min(b.x, size.cols - 1) * CELL + CELL / 2;
          const cy = Math.min(b.y, size.rows - 1) * CELL + CELL / 2;
          return <Burst key={b.id} x={cx} y={cy} color={b.color} />;
        })}

        {snake.map((s, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center"
            style={{
              left: s.x * CELL + 3,
              top: s.y * CELL + 3,
              width: CELL - 6,
              height: CELL - 6,
              borderRadius: i === 0 ? "60% 60% 50% 50%" : 999,
              background:
                i === 0
                  ? "var(--primary)"
                  : `color-mix(in oklab, var(--primary) ${Math.max(25, 95 - i * 5)}%, white)`,
              boxShadow: i === 0 ? "var(--shadow-glow)" : "0 1px 3px oklch(0.6 0.15 350 / 0.25)",
              transition: "left 90ms linear, top 90ms linear",
              fontSize: 12,
            }}
          >
            {i === 0 ? <span style={{ filter: "drop-shadow(0 0 2px white)" }}>🎀</span> : null}
          </div>
        ))}
      </div>

      {/* Intro */}
      {phase === "intro" && (
        <Overlay>
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
            Press any arrow key to begin
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
            A portfolio you have to <em className="text-primary not-italic">play</em>.
          </h2>
          <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
            Three levels. Each one faster. Eat the treats to unlock how I work,
            what I've shipped, my résumé, and a few useless facts.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span>🍓 Approach</span><span>🍰 Projects</span><span>🍒 Résumé</span><span>🍭 Fun facts</span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Key>←</Key><Key>↑</Key><Key>↓</Key><Key>→</Key>
          </div>
        </Overlay>
      )}

      {/* Level intro */}
      {phase === "level-intro" && (
        <Overlay>
          <div className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: categoryColor[levelDots[0].category] }}>
            {LEVEL_META[level].name}
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
            {LEVEL_META[level].tagline}
          </h2>
          <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
            Press any arrow key to start moving.
          </p>
        </Overlay>
      )}

      {/* Level complete */}
      {phase === "level-complete" && (
        <Overlay>
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
            ✶ Level {level} cleared
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Nice. The snake gets <em className="text-primary not-italic">faster</em>.
          </h2>
          <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
            Up next: {LEVEL_META[(level + 1) as LevelId].name}.<br />
            Press any arrow key to continue.
          </p>
        </Overlay>
      )}

      {/* Active panel */}
      {active && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-sm" onClick={closeActive}>
          <article
            className="panel-shadow relative mx-6 max-w-xl rounded-lg border bg-surface p-8 animate-slide-up md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: categoryColor[active.category] }}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: categoryColor[active.category] }} />
              {categoryLabel[active.category]} {active.meta ? `· ${active.meta}` : ""}
            </div>
            <h3 className="font-display text-3xl font-semibold leading-tight md:text-4xl">{active.title}</h3>
            <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">{active.body}</p>
            <div className="mt-8 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {levelDots.filter((d) => collected.has(d.id)).length} / {levelDots.length} this level
              </div>
              <button
                onClick={closeActive}
                className="rounded border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Keep playing · esc
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/75 backdrop-blur-sm">
      <div className="max-w-lg px-8 text-center animate-slide-up">{children}</div>
    </div>
  );
}

function LevelProgress({ dots, collected, color }: { dots: Dot[]; collected: Set<string>; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {dots.map((d) => {
        const got = collected.has(d.id);
        return (
          <span
            key={d.id}
            className="inline-block h-1.5 w-4 rounded-full"
            style={{ background: got ? color : "var(--surface-2)", boxShadow: got ? `0 0 8px ${color}` : "none" }}
          />
        );
      })}
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-border bg-surface-2 px-2 font-mono text-xs text-foreground">
      {children}
    </kbd>
  );
}

function Burst({ x, y, color }: { x: number; y: number; color: string }) {
  const palette = [color, "var(--primary)", "var(--signal-mint)", "var(--signal-violet)", "var(--accent)"];
  const pieces = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute" style={{ left: x, top: y, width: 0, height: 0 }}>
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 28 + Math.random() * 22;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const sz = 4 + Math.random() * 5;
        const c = palette[i % palette.length];
        const rot = Math.random() * 360;
        return (
          <span
            key={i}
            className="absolute block"
            style={{
              left: 0,
              top: 0,
              width: sz,
              height: sz * (Math.random() > 0.5 ? 1 : 0.45),
              background: c,
              borderRadius: Math.random() > 0.5 ? 999 : 1,
              boxShadow: `0 0 6px ${c}`,
              ["--dx" as never]: `${dx}px`,
              ["--dy" as never]: `${dy}px`,
              ["--rot" as never]: `${rot}deg`,
              animation: "confetti-burst 700ms cubic-bezier(0.2,0.7,0.3,1) forwards",
            }}
          />
        );
      })}
      <span
        className="absolute block"
        style={{
          left: -16,
          top: -16,
          width: 32,
          height: 32,
          borderRadius: 999,
          border: `2px solid ${color}`,
          animation: "spark-ring 600ms ease-out forwards",
        }}
      />
    </div>
  );
}

function Onepager({ onReplay }: { onReplay: () => void }) {
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);
  const groups: { key: Category; title: string; items: Dot[] }[] = [
    { key: "approach", title: "My Approach", items: DOTS.filter((d) => d.category === "approach") },
    { key: "project", title: "Selected Projects", items: DOTS.filter((d) => d.category === "project") },
    { key: "resume", title: "Résumé", items: DOTS.filter((d) => d.category === "resume") },
    { key: "fact", title: "Off the Clock", items: DOTS.filter((d) => d.category === "fact") },
  ];
  return (
    <main className="min-h-screen w-full overflow-y-auto bg-background text-foreground" style={{ overflow: "auto" }}>
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-24">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
          ✶ You finished the game
        </div>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
          Mira Cendrars
        </h1>
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          Design strategist · Lisbon / remote · mira@cendrars.studio
        </p>
        <p className="mt-8 font-display text-xl leading-relaxed text-foreground/90 md:text-2xl">
          I help teams find the question worth answering, prototype the answer
          fast, and ship the smallest version that proves it true.
        </p>

        {groups.map((g) => (
          <section key={g.key} className="mt-16">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: categoryColor[g.key] }} />
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: categoryColor[g.key] }}>
                {g.title}
              </h2>
            </div>
            <ul className="space-y-6">
              {g.items.map((it) => (
                <li key={it.id} className="border-t border-border pt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl font-semibold md:text-2xl">{it.title}</h3>
                    {it.meta && (
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        {it.meta}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-mono text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-20 rounded-lg border bg-surface p-8 md:p-10 panel-shadow">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Let's work together</h2>
          <p className="mt-3 font-mono text-sm leading-relaxed text-muted-foreground">
            Available for fractional strategy engagements, research sprints, and
            embedded product work. Quickest reply by email.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:mira@cendrars.studio"
              className="rounded border border-primary bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              mira@cendrars.studio
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-surface-2"
            >
              LinkedIn ↗
            </a>
            <button
              onClick={onReplay}
              className="rounded border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-surface-2"
            >
              ↺ Play again
            </button>
          </div>
        </section>

        <footer className="mt-16 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          © Mira Cendrars · Built as a snake game
        </footer>
      </div>
    </main>
  );
}
