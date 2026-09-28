// Unit 5.5, stage 1 — explore: a shelf pinned to a wall at A and held by a
// link (a two-force member) from B to the wall at D. The load, the link and
// the pin are the only three forces, so their lines meet at one point O.
// Hand checks (B at 3 m, D at (0, d), P at x):
//   Link force (tension +): ΣM_A: 3·d·F/L − P·x = 0 → F = P·x·L/(3d), L = √(9 + d²);
//   d < 0 (D below): F < 0, a prop in compression; d > 0: a tie in tension.
//   P above B (x = 3): O = B, so the pin force lies along the beam (A_y = 0).
//   P past B (x > 3): A_y < 0 — the pin pulls the shelf down.
//   |F| > 2P needs a flat link: e.g. x = 4, d = 1 → |F| = 4√10/3 P = 4.2P.
//   D level with A (d = 0): the link's line passes through the pin, so nothing
//   resists turning about A — improperly supported, the solver says it moves.

export default {
  id: "two-force-members/1-explore",
  challenge: "explore",
  solver: "statics.rigidBody",
  title: "Along the Line",
  mission: "See why a two-force member's force always lies along it.",
  instructions:
    "A shelf is pinned to the wall at A and held by a link BD — a bar pinned at both ends, with nothing else on it. " +
    "Move the link's wall end D and the load $P$. The faint dashed lines are the three forces' lines of action: they always meet at one point, O.",
  setup: {
    body: { points: [[0, 0], [4.5, 0]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0], normal: [1, 0] },
      { id: "B", type: "link", at: [3, 0], anchor: [0, 2], anchorLabel: "D", symbol: "F_{BD}" }, // starts as a tie, above
    ],
    // P hangs below the shelf, so the lines of action (above) and the dimensions (below) keep apart.
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [1.5, 0] }],
    showConcurrency: true,
  },
  view: { xmin: -1.6, xmax: 5.4, ymin: -3, ymax: 3.1 },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "Link BD is pinned at both ends with nothing else on it. **Which way does it push or pull on the shelf at B?**",
    options: [
      { text: "Along the link, the line from B to D", correct: true },
      { text: "Straight up", feedback: "A member with forces only at its two pins can only push or pull along the line between them." },
      { text: "Any direction, like a pin", feedback: "A pin can push any way — but a two-force member balances only if its two forces lie along one line." },
    ],
    explain: "Two forces balance only if equal, opposite and on the same line: along BD.",
  },
  editable: [
    { path: "supports.#B.anchor.1", label: "D's height on the wall", min: -2.5, max: 2.5, step: 0.5, unit: "m" },
    { path: "forces.#P.at.0", label: "P acts at x", min: 0.5, max: 4.5, step: 0.5, unit: "m" },
  ],
  tasks: [
    { text: "Make the link a **prop**: in compression ($F_{BD} < 0$).", check: (v) => v.F_BD < -1 },
    { text: "Move $P$ right above B: the pin force then lies along the shelf ($A_y = 0$).", check: (v) => Math.abs(v.A_y) < 1 && Math.abs(v.A_x) > 1 },
    { text: "Move $P$ past B, so the pin has to pull the shelf **down** ($A_y < 0$).", check: (v) => v.A_y < -1 },
    { text: "Make the link carry more than **twice** the load.", check: (v) => Math.abs(v.F_BD) > 1200 },
  ],
  hints: [
    "D above the shelf: the link hangs it (a tie, pulling). D below: the link holds it up from underneath (a prop, pushing).",
    "The pin force must point from A to O, where the load's line meets the link's line. Where is O when P is right above B?",
    "A flatter link (D close to the shelf's level) has only a small upward part, so it must carry a big force.",
  ],
  explanation:
    "The link has forces only at its two pins, so they must be equal, opposite and along the line between them — a two-force member. " +
    "The shelf then feels just three forces (P, the link, the pin), and three forces in equilibrium meet at one point: that fixes the pin's direction before any calculation.",
};
