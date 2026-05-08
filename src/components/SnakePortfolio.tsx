import { useEffect, useMemo, useRef, useState, useCallback } from "react";

type Category = "approach" | "project" | "resume" | "fact";
type LevelId = 1 | 2 | 3;
type SnakeStyle = "blocks" | "line";

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
    meta: "RESUME" },
  { id: "r2", x: 11, y: 4, category: "resume", label: "Senior Designer",
    title: "Senior Product Designer · Northwind",
    body: "2019 — 2022. Owned onboarding and growth surfaces. Shipped the redesign that became the company's reference flow.",
    meta: "RESUME" },
  { id: "r3", x: 17, y: 7, category: "resume", label: "Researcher",
    title: "Design Researcher · IDEO Lisbon",
    body: "2017 — 2019. Field research across EU public services. Co-authored the housing policy playbook now used by three city governments.",
    meta: "RESUME" },
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

const categoryLabel: Record<Category, string> = {
  approach: "MY APPROACH",
  project: "PROJECTS",
  resume: "RESUME",
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

// =============================================================================
// PIXEL SPRITES — drawn as 8x8 grids, scaled to fit 22px in a 28px cell
// =============================================================================
type Sprite = { grid: string[]; palette: Record<string, string> };

const SPRITES: Record<string, Sprite> = {
  // Strawberry — for "approach"
  strawberry: {
    grid: [
      "____GG__",
      "___GGG__",
      "__GGGG__",
      "_RRWRRR_",
      "RRWRRRWR",
      "RRRRRRRR",
      "_RRWRRR_",
      "__RRRR__",
    ],
    palette: { R: "var(--accent)", G: "var(--signal-mint)", W: "oklch(0.99 0.01 340)" },
  },
  // Cake slice — for "project"
  cake: {
    grid: [
      "___YY___",
      "__PPPP__",
      "_WWWWWW_",
      "MMMMMMMM",
      "MWMMWMMM",
      "MMMMMMMM",
      "_TTTTTT_",
      "__TTTT__",
    ],
    palette: {
      M: "var(--signal-mint)",
      W: "oklch(0.99 0.01 340)",
      P: "var(--primary)",
      Y: "var(--signal-yellow)",
      T: "oklch(0.55 0.12 50)",
    },
  },
  // Cherry — for "resume"
  cherry: {
    grid: [
      "____GG__",
      "___GGG__",
      "__GGG___",
      "_GG_GG__",
      "PP_PPP__",
      "PPPPPPP_",
      "PPPPPPPP",
      "_PPPPPP_",
    ],
    palette: { P: "var(--primary)", G: "var(--signal-mint)" },
  },
  // Lollipop — for "fact"
  lolly: {
    grid: [
      "_VVVV___",
      "VVPPVV__",
      "VPVVPV__",
      "VPVVPV__",
      "VVPPVV__",
      "_VVVV___",
      "___K____",
      "___K____",
    ],
    palette: {
      V: "var(--signal-violet)",
      P: "oklch(0.99 0.01 340)",
      K: "oklch(0.55 0.10 340)",
    },
  },
  // Snake head — facing right by default
  snakeHead: {
    grid: [
      "_PPPPPP_",
      "PPPPPPPP",
      "PPWWPPWP",
      "PWBWPWBW",
      "PPPPPPPP",
      "PPRRRPPP",
      "PPPPPPPP",
      "_PPPPPP_",
    ],
    palette: {
      P: "var(--primary)",
      W: "oklch(0.99 0.01 340)",
      B: "oklch(0.20 0.05 340)",
      R: "oklch(0.55 0.18 350)",
    },
  },
  // Snake body segment
  snakeBody: {
    grid: [
      "_PPPPPP_",
      "PPpppppP",
      "PpPPPPpP",
      "PpPDDPpP",
      "PpPDDPpP",
      "PpPPPPpP",
      "PpppppPP",
      "_PPPPPP_",
    ],
    palette: {
      P: "var(--primary)",
      p: "oklch(0.80 0.16 350)",
      D: "var(--primary-dark)",
    },
  },
  // Snake tail tip
  snakeTail: {
    grid: [
      "________",
      "__PPPP__",
      "_PPPPPP_",
      "PPpppppP",
      "PpppPPpP",
      "_PpppPP_",
      "__PPPP__",
      "________",
    ],
    palette: {
      P: "var(--primary)",
      p: "oklch(0.80 0.16 350)",
    },
  },
};

function PixelSprite({
  name,
  size = 22,
  rotate = 0,
  style,
}: {
  name: string;
  size?: number;
  rotate?: number;
  style?: React.CSSProperties;
}) {
  const sprite = SPRITES[name];
  if (!sprite) return null;
  const { grid, palette } = sprite;
  const cell = size / 8;
  const rects: React.ReactNode[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const k = grid[r][c];
      if (k === "_") continue;
      const fill = palette[k] || "currentColor";
      rects.push(
        <rect
          key={`${r}-${c}`}
          x={c * cell}
          y={r * cell}
          width={cell}
          height={cell}
          fill={fill}
        />,
      );
    }
  }
  return (
    <svg
      className="pixel"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", transform: `rotate(${rotate}deg)`, ...style }}
    >
      {rects}
    </svg>
  );
}

const FOOD_FOR: Record<Category, string> = {
  approach: "strawberry",
  project: "cake",
  resume: "cherry",
  fact: "lolly",
};

// =============================================================================
// SNAKE-AS-LINE renderer — connected polyline through cell centers
// =============================================================================
function SnakeLine({
  snake,
  headAngle,
  cell,
  thickness,
  color,
}: {
  snake: { x: number; y: number }[];
  headAngle: number;
  cell: number;
  thickness: number;
  color: string;
}) {
  if (!snake.length) return null;
  // Break path on edge-wraps so we don't draw a line across the whole board
  const segments: { x: number; y: number }[][] = [];
  let cur = [snake[0]];
  for (let i = 1; i < snake.length; i++) {
    const a = snake[i - 1];
    const b = snake[i];
    if (Math.abs(a.x - b.x) > 1 || Math.abs(a.y - b.y) > 1) {
      segments.push(cur);
      cur = [b];
    } else {
      cur.push(b);
    }
  }
  segments.push(cur);

  const head = snake[0];
  const hx = head.x * cell + cell / 2;
  const hy = head.y * cell + cell / 2;

  const dirX = Math.cos((headAngle * Math.PI) / 180);
  const dirY = Math.sin((headAngle * Math.PI) / 180);
  const perpX = -dirY;
  const perpY = dirX;
  const eyeOffset = thickness / 4;
  const eyeForward = thickness / 5;
  const eyeSize = Math.max(2, Math.floor(thickness / 4));

  return (
    <>
      {segments.map((seg, si) => {
        const points = seg
          .map((s) => `${s.x * cell + cell / 2},${s.y * cell + cell / 2}`)
          .join(" ");
        return (
          <svg
            key={si}
            className="pixel"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 4,
            }}
          >
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="butt"
              strokeLinejoin="miter"
            />
            <polyline
              points={points}
              fill="none"
              stroke="oklch(0.99 0.01 340 / 0.55)"
              strokeWidth={Math.max(2, Math.floor(thickness / 4))}
              strokeLinecap="butt"
              strokeLinejoin="miter"
            />
          </svg>
        );
      })}
      {/* Head cap + eyes */}
      <div
        style={{
          position: "absolute",
          left: hx,
          top: hy,
          width: 0,
          height: 0,
          zIndex: 5,
          transition: "left 90ms steps(2, end), top 90ms steps(2, end)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -thickness / 2 - 2,
            top: -thickness / 2 - 2,
            width: thickness + 4,
            height: thickness + 4,
            background: color,
            border: "2px solid oklch(0.20 0.05 340)",
            boxShadow: "2px 2px 0 oklch(0.28 0.04 340 / 0.3)",
            transform: `rotate(${headAngle}deg)`,
          }}
        />
        {[-1, 1].map((s) => (
          <div
            key={s}
            style={{
              position: "absolute",
              left: dirX * eyeForward + perpX * eyeOffset * s - eyeSize / 2,
              top: dirY * eyeForward + perpY * eyeOffset * s - eyeSize / 2,
              width: eyeSize,
              height: eyeSize,
              background: "oklch(0.99 0.01 340)",
              boxShadow: `inset -1px -1px 0 oklch(0.20 0.05 340)`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// =============================================================================
// MAIN
// =============================================================================
export default function SnakePortfolio() {
  // Visual tweaks (local UI state — wire to settings/Tweaks if you have them)
  const [snakeStyle, setSnakeStyle] = useState<SnakeStyle>("blocks");
  const [snakeThickness] = useState(12);
  const [snakeColor] = useState("var(--primary)");

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
  const [score, setScore] = useState(0);
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

  // Advance level
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
          (d) =>
            !collected.has(d.id) &&
            Math.abs(d.x - nx) <= 1 &&
            Math.abs(d.y - ny) <= 1,
        );
        if (hit) {
          setCollected((c) => new Set(c).add(hit.id));
          setScore((s) => s + 100 * level);
          const bid = ++burstId.current;
          const c = getComputedStyle(document.documentElement)
            .getPropertyValue(
              hit.category === "approach" ? "--accent"
                : hit.category === "project" ? "--signal-mint"
                : hit.category === "resume" ? "--primary"
                : "--signal-violet",
            )
            .trim();
          setBursts((b) => [...b, { id: bid, x: hit.x, y: hit.y, color: c }]);
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

  const headAngle =
    dir.x === 1 ? 0 : dir.x === -1 ? 180 : dir.y === -1 ? -90 : 90;

  if (phase === "finished") {
    return (
      <Onepager
        score={score}
        onReplay={() => {
          setCollected(new Set());
          setLevel(1);
          setSnake([
            { x: 16, y: 11 },
            { x: 15, y: 11 },
            { x: 14, y: 11 },
          ]);
          setDir({ x: 1, y: 0 });
          setScore(0);
          setPhase("intro");
        }}
      />
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 grid-bg" />

      {/* HUD top */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between px-6 py-5 md:px-10 md:py-7">
        <div>
          <div className="font-pixel text-[9px] uppercase text-muted-foreground">
            {LEVEL_META[level].name}
          </div>
          <h1
            className="mt-3 font-pixel text-xl leading-none md:text-2xl"
            style={{ textShadow: "3px 3px 0 var(--primary)" }}
          >
            MIRA CENDRARS
          </h1>
          <div className="mt-2 font-arcade text-lg leading-none text-muted-foreground tracking-wide">
            DESIGN STRATEGIST · LISBON / REMOTE
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="font-pixel text-[10px]">
            SCORE{" "}
            <span style={{ color: "var(--primary)" }}>
              {String(score).padStart(6, "0")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((l) => (
              <div
                key={l}
                className="font-pixel text-[9px]"
                style={{
                  color:
                    l === level
                      ? "var(--primary)"
                      : l < level
                      ? "var(--signal-mint)"
                      : "var(--muted-foreground)",
                  opacity: l === level ? 1 : 0.7,
                }}
              >
                {l < level ? "✓" : l === level ? "▶" : "·"} LV{l}
              </div>
            ))}
          </div>
          <LevelProgress dots={levelDots} collected={collected} />
        </div>
      </header>

      {/* HUD bottom */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-6 py-5 md:px-10 md:py-7">
        <div className="font-pixel text-[9px] uppercase text-muted-foreground flex items-center gap-2">
          MOVE <Key>←</Key>
          <Key>↑</Key>
          <Key>↓</Key>
          <Key>→</Key> · EAT TO READ
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSnakeStyle((s) => (s === "blocks" ? "line" : "blocks"))}
            className="pixel-btn"
            type="button"
          >
            SNAKE: {snakeStyle.toUpperCase()}
          </button>
          <div className="font-pixel text-[9px] uppercase text-muted-foreground">
            mira@cendrars.studio
          </div>
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
          if (collected.has(d.id)) return null;
          const cx = Math.min(d.x, size.cols - 1) * CELL + CELL / 2;
          const cy = Math.min(d.y, size.rows - 1) * CELL + CELL / 2;
          return (
            <div
              key={d.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-pulse-dot"
              style={{ left: cx, top: cy, width: CELL * 2, height: CELL * 2 }}
            >
              <PixelSprite name={FOOD_FOR[d.category]} size={32} />
            </div>
          );
        })}

        {bursts.map((b) => {
          const cx = Math.min(b.x, size.cols - 1) * CELL + CELL / 2;
          const cy = Math.min(b.y, size.rows - 1) * CELL + CELL / 2;
          return <Burst key={b.id} x={cx} y={cy} color={b.color} />;
        })}

        {snakeStyle === "line" ? (
          <SnakeLine
            snake={snake}
            headAngle={headAngle}
            cell={CELL}
            thickness={snakeThickness}
            color={snakeColor}
          />
        ) : (
          snake.map((s, i) => {
            const isHead = i === 0;
            const isTail = i === snake.length - 1;
            const sprite = isHead ? "snakeHead" : isTail ? "snakeTail" : "snakeBody";
            const rot = isHead ? headAngle : 0;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: s.x * CELL + 3,
                  top: s.y * CELL + 3,
                  width: CELL - 6,
                  height: CELL - 6,
                  transition: "left 90ms steps(2, end), top 90ms steps(2, end)",
                  zIndex: isHead ? 5 : 4,
                }}
              >
                <PixelSprite name={sprite} size={CELL - 6} rotate={rot} />
              </div>
            );
          })
        )}
      </div>

      {/* Intro */}
      {phase === "intro" && (
        <Overlay>
          <div className="font-pixel text-[10px] text-primary">
            ★ INSERT ARROW KEY TO START ★
          </div>
          <h2
            className="mt-7 font-pixel text-2xl leading-snug md:text-3xl animate-title-bob"
            style={{ textShadow: "4px 4px 0 var(--primary)" }}
          >
            A PORTFOLIO<br />YOU HAVE TO{" "}
            <span style={{ color: "var(--primary)", textShadow: "4px 4px 0 var(--foreground)" }}>
              PLAY
            </span>
            .
          </h2>
          <p className="mt-6 font-arcade text-xl leading-snug text-muted-foreground">
            Three levels. Each one faster. Eat the treats to unlock how I work,
            what I've shipped, my résumé, and a few useless facts.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <FoodLegend name="strawberry" label="APPROACH" />
            <FoodLegend name="cake" label="PROJECTS" />
            <FoodLegend name="cherry" label="RESUME" />
            <FoodLegend name="lolly" label="FACTS" />
          </div>
          <div className="mt-7 flex items-center justify-center gap-2">
            <Key>←</Key>
            <Key>↑</Key>
            <Key>↓</Key>
            <Key>→</Key>
          </div>
          <div className="mt-5 font-pixel text-[9px] text-muted-foreground animate-blink">
            PRESS ANY KEY
          </div>
        </Overlay>
      )}

      {/* Level intro */}
      {phase === "level-intro" && (
        <Overlay>
          <div
            className="font-pixel text-[10px]"
            style={{ color: categoryColor[levelDots[0].category] }}
          >
            {LEVEL_META[level].name.toUpperCase()}
          </div>
          <h2
            className="mt-6 font-pixel text-xl leading-snug md:text-2xl"
            style={{ textShadow: "3px 3px 0 var(--primary)" }}
          >
            {LEVEL_META[level].tagline.toUpperCase()}
          </h2>
          <p className="mt-5 font-arcade text-xl text-muted-foreground">
            Press any arrow key to start moving.
          </p>
          <div className="mt-4 font-pixel text-[9px] text-primary animate-blink">
            ▶ READY?
          </div>
        </Overlay>
      )}

      {/* Level complete */}
      {phase === "level-complete" && (
        <Overlay>
          <div className="font-pixel text-[10px] text-primary">
            ★ STAGE {level} CLEAR ★
          </div>
          <h2
            className="mt-6 font-pixel text-xl leading-snug md:text-2xl animate-title-bob"
            style={{ textShadow: "3px 3px 0 var(--primary)" }}
          >
            NICE. THE SNAKE<br />GETS{" "}
            <span style={{ color: "var(--primary)", textShadow: "3px 3px 0 var(--foreground)" }}>
              FASTER
            </span>
            .
          </h2>
          <p className="mt-5 font-arcade text-xl text-muted-foreground">
            Up next: {LEVEL_META[(level + 1) as LevelId].name}.<br />
            Press any arrow key to continue.
          </p>
        </Overlay>
      )}

      {/* Active panel */}
      {active && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-sm"
          style={{ background: "oklch(0.28 0.04 340 / 0.55)" }}
          onClick={closeActive}
        >
          <article
            className="pixel-panel relative mx-6 max-w-xl p-7 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mb-4 inline-flex items-center gap-2 font-pixel text-[9px]"
              style={{ color: categoryColor[active.category] }}
            >
              <PixelSprite name={FOOD_FOR[active.category]} size={16} />
              {categoryLabel[active.category]}{" "}
              {active.meta ? `· ${active.meta}` : ""}
            </div>
            <h3
              className="font-pixel text-base leading-relaxed md:text-lg"
              style={{ textShadow: "2px 2px 0 var(--primary)" }}
            >
              {active.title.toUpperCase()}
            </h3>
            <p className="mt-4 font-arcade text-xl leading-snug">{active.body}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="font-pixel text-[9px] text-muted-foreground">
                {levelDots.filter((d) => collected.has(d.id)).length} /{" "}
                {levelDots.length} THIS LEVEL
              </div>
              <button onClick={closeActive} className="pixel-btn pixel-btn-solid">
                KEEP PLAYING · ESC
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
    <div
      className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm"
      style={{ background: "oklch(0.985 0.012 340 / 0.85)" }}
    >
      <div className="max-w-lg px-8 text-center animate-slide-up">{children}</div>
    </div>
  );
}

function FoodLegend({ name, label }: { name: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <PixelSprite name={name} size={20} />
      <span className="font-pixel text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

function LevelProgress({ dots, collected }: { dots: Dot[]; collected: Set<string> }) {
  return (
    <div className="flex items-center gap-1">
      {dots.map((d) => {
        const got = collected.has(d.id);
        return <span key={d.id} className={got ? "seg on" : "seg"} />;
      })}
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return <kbd className="pixel-key">{children}</kbd>;
}

function Burst({ x, y, color }: { x: number; y: number; color: string }) {
  const pieces = Array.from({ length: 14 });
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: x, top: y, width: 0, height: 0 }}
    >
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 28 + Math.random() * 22;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const sz = 4 + Math.random() * 4;
        const rot = Math.random() * 360;
        return (
          <span
            key={i}
            className="absolute block"
            style={{
              left: 0,
              top: 0,
              width: sz,
              height: sz,
              background: color,
              boxShadow: "2px 2px 0 oklch(0.28 0.04 340 / 0.4)",
              ["--dx" as never]: `${dx}px`,
              ["--dy" as never]: `${dy}px`,
              ["--rot" as never]: `${rot}deg`,
              animation: "confetti-burst 700ms steps(8, end) forwards",
            }}
          />
        );
      })}
    </div>
  );
}

function Onepager({ score, onReplay }: { score: number; onReplay: () => void }) {
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

  const groups: { key: Category; title: string; food: string; items: Dot[] }[] = [
    { key: "approach", title: "MY APPROACH", food: "strawberry", items: DOTS.filter((d) => d.category === "approach") },
    { key: "project", title: "SELECTED PROJECTS", food: "cake", items: DOTS.filter((d) => d.category === "project") },
    { key: "resume", title: "RESUME", food: "cherry", items: DOTS.filter((d) => d.category === "resume") },
    { key: "fact", title: "OFF THE CLOCK", food: "lolly", items: DOTS.filter((d) => d.category === "fact") },
  ];

  return (
    <main
      className="min-h-screen w-full overflow-y-auto bg-background text-foreground relative"
      style={{ overflow: "auto" }}
    >
      <div className="grid-bg fixed inset-0" />
      <div className="relative mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-20">
        <div className="font-pixel text-[10px] text-primary">
          ★ GAME CLEAR · SCORE {String(score).padStart(6, "0")} ★
        </div>
        <h1
          className="mt-5 font-pixel text-3xl leading-snug md:text-4xl"
          style={{ textShadow: "5px 5px 0 var(--primary)" }}
        >
          MIRA<br />CENDRARS
        </h1>
        <p className="mt-4 font-arcade text-xl text-muted-foreground">
          Design strategist · Lisbon / remote · mira@cendrars.studio
        </p>
        <p className="mt-8 font-arcade text-2xl leading-snug">
          I help teams find the question worth answering, prototype the answer
          fast, and ship the smallest version that proves it true.
        </p>

        {groups.map((g) => (
          <section key={g.key} className="mt-14">
            <div className="mb-5 flex items-center gap-3">
              <PixelSprite name={g.food} size={20} />
              <h2
                className="font-pixel text-[11px]"
                style={{ color: categoryColor[g.key], letterSpacing: "0.1em" }}
              >
                {g.title}
              </h2>
            </div>
            <ul className="flex flex-col gap-4">
              {g.items.map((it) => (
                <li key={it.id} className="pixel-panel p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-pixel text-[13px] leading-relaxed">
                      {it.title.toUpperCase()}
                    </h3>
                    {it.meta && (
                      <span className="shrink-0 font-pixel text-[8px] text-muted-foreground">
                        {it.meta}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-arcade text-lg leading-snug">{it.body}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="pixel-panel mt-16 p-7">
          <h2
            className="font-pixel text-base leading-relaxed md:text-lg"
            style={{ textShadow: "3px 3px 0 var(--primary)" }}
          >
            LET'S WORK<br />TOGETHER
          </h2>
          <p className="mt-3 font-arcade text-xl leading-snug">
            Available for fractional strategy engagements, research sprints, and
            embedded product work. Quickest reply by email.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="mailto:mira@cendrars.studio"
              className="pixel-btn pixel-btn-solid"
              style={{ textDecoration: "none" }}
            >
              MIRA@CENDRARS.STUDIO
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              className="pixel-btn"
              style={{ textDecoration: "none" }}
            >
              LINKEDIN ↗
            </a>
            <button onClick={onReplay} className="pixel-btn">
              ↺ PLAY AGAIN
            </button>
          </div>
        </section>

        <footer className="mt-14 border-t-4 pt-5" style={{ borderColor: "var(--foreground)" }}>
          <div className="font-pixel text-[9px] text-muted-foreground">
            © MIRA CENDRARS · BUILT AS A SNAKE GAME
          </div>
        </footer>
      </div>
    </main>
  );
}
