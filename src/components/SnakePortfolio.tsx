import { useEffect, useMemo, useRef, useState, useCallback } from "react";

type Category = "approach" | "project" | "fact";

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

const DOTS: Dot[] = [
  // APPROACH — 4 pillars
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

  // PROJECTS
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

  // FUN FACTS
  { id: "f1", x: 4, y: 10, category: "fact", label: "Bread",
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
  fact: "var(--signal-violet)",
};

const categoryFood: Record<Category, string> = {
  approach: "🍓",
  project: "🍰",
  fact: "🍭",
};

const categoryLabel: Record<Category, string> = {
  approach: "MY APPROACH",
  project: "PROJECTS",
  fact: "FUN FACTS",
};

type Dir = { x: number; y: number };
const DIRS: Record<string, Dir> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

export default function SnakePortfolio() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ cols: 36, rows: 22 });
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 16, y: 11 },
    { x: 15, y: 11 },
    { x: 14, y: 11 },
  ]);
  const [dir, setDir] = useState<Dir>({ x: 1, y: 0 });
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<Dot | null>(null);
  const [started, setStarted] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  // Resize board to viewport
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

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(null);
        return;
      }
      const next = DIRS[e.key];
      if (!next) return;
      e.preventDefault();
      setStarted(true);
      // prevent reversing into self
      const cur = dirRef.current;
      if (cur.x + next.x === 0 && cur.y + next.y === 0) return;
      setDir(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Game tick
  useEffect(() => {
    if (!started || active) return;
    const id = window.setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        let nx = head.x + dirRef.current.x;
        let ny = head.y + dirRef.current.y;
        // wrap
        if (nx < 0) nx = size.cols - 1;
        if (nx >= size.cols) nx = 0;
        if (ny < 0) ny = size.rows - 1;
        if (ny >= size.rows) ny = 0;
        const newHead = { x: nx, y: ny };
        const hit = DOTS.find(
          (d) => d.x === nx && d.y === ny && !collected.has(d.id),
        );
        if (hit) {
          setCollected((c) => new Set(c).add(hit.id));
          setActive(hit);
          return [newHead, ...prev];
        }
        return [newHead, ...prev.slice(0, -1)];
      });
    }, 130);
    return () => clearInterval(id);
  }, [started, active, collected, size.cols, size.rows]);

  const closeActive = useCallback(() => setActive(null), []);

  const counts = useMemo(() => {
    const total = { approach: 0, project: 0, fact: 0 } as Record<Category, number>;
    const got = { approach: 0, project: 0, fact: 0 } as Record<Category, number>;
    DOTS.forEach((d) => {
      total[d.category]++;
      if (collected.has(d.id)) got[d.category]++;
    });
    return { total, got };
  }, [collected]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <div ref={boardRef} className="absolute inset-0 grid-bg" />

      {/* HUD top */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between px-6 py-5 md:px-10 md:py-7">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Portfolio · v1
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold leading-none md:text-3xl">
            Mira Cendrars
          </h1>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            Design strategist · Lisbon / remote
          </div>
        </div>
        <div className="hidden gap-6 md:flex">
          <Counter label="Approach" got={counts.got.approach} total={counts.total.approach} color="var(--accent)" />
          <Counter label="Projects" got={counts.got.project} total={counts.total.project} color="var(--signal-mint)" />
          <Counter label="Fun facts" got={counts.got.fact} total={counts.total.fact} color="var(--signal-violet)" />
        </div>
      </header>

      {/* HUD bottom */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-6 py-5 md:px-10 md:py-7">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Use <Key>←</Key> <Key>↑</Key> <Key>↓</Key> <Key>→</Key> to move · eat dots to read
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
        {/* Dots as food */}
        {DOTS.map((d) => {
          const taken = collected.has(d.id);
          const cx = Math.min(d.x, size.cols - 1) * CELL + CELL / 2;
          const cy = Math.min(d.y, size.rows - 1) * CELL + CELL / 2;
          return (
            <div
              key={d.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: cx, top: cy }}
            >
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

        {/* Snake */}
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

      {/* Start overlay */}
      {!started && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="max-w-lg px-8 text-center animate-slide-up">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
              Press any arrow key to begin
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
              A portfolio you have to <em className="text-primary not-italic">play</em>.
            </h2>
            <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
              Steer the snake across the grid. Each dot you eat reveals a piece of how I think,
              what I've shipped, or something useless about me.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <Key>←</Key><Key>↑</Key><Key>↓</Key><Key>→</Key>
            </div>
          </div>
        </div>
      )}

      {/* Active panel */}
      {active && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          onClick={closeActive}
        >
          <article
            className="panel-shadow relative mx-6 max-w-xl rounded-lg border bg-surface p-8 animate-slide-up md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: categoryColor[active.category] }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: categoryColor[active.category] }}
              />
              {categoryLabel[active.category]} {active.meta ? `· ${active.meta}` : ""}
            </div>
            <h3 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
              {active.title}
            </h3>
            <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
              {active.body}
            </p>
            <div className="mt-8 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {collected.size} / {DOTS.length} discovered
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

      {/* Win state */}
      {collected.size === DOTS.length && !active && (
        <div className="pointer-events-none absolute left-1/2 top-10 z-30 -translate-x-1/2 rounded border border-primary/40 bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-primary animate-slide-up">
          ✶ You found everything. Say hi: mira@cendrars.studio
        </div>
      )}
    </div>
  );
}

function Counter({ label, got, total, color }: { label: string; got: number; total: number; color: string }) {
  return (
    <div className="text-right">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-center justify-end gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-4 rounded-full"
            style={{
              background: i < got ? color : "var(--surface-2)",
              boxShadow: i < got ? `0 0 8px ${color}` : "none",
            }}
          />
        ))}
      </div>
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
