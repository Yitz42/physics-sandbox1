// Unit 5.2, stage 1 — explore: choose the point to take moments about, and see
// how many unknowns the moment equation keeps.
// Hand check (pin A at 0, roller B at 6 m, P = 600 N down at x):
//   ΣM_A: 6B_y − 600x = 0 → B_y = 100x;  ΣM_B: −6A_y + 600(6 − x) = 0 → A_y = 100(6 − x)
//   Unknowns in ΣM: about A → B_y only; about B → A_y only; about C (3, 0) → A_y and B_y;
//   about D (3, 1.5), off the beam → A_x too (its line y = 0 misses D): all three.
//   A_y = B_y when x = 3; A_y < 0 (the pin pulls down) once P is past B (x > 6).

const point = (label, about) => ({ label, set: { about } });

export default {
  id: "rigid-body-equilibrium/1-explore",
  challenge: "explore",
  solver: "statics.rigidBody",
  title: "Pick Your Moment Point",
  mission: "Find the moment point that leaves only one unknown in ΣM.",
  instructions:
    "The beam is in equilibrium, so $\\Sigma M = 0$ about **every** point — but some points make the work much easier. " +
    "Choose the point to take moments about (the ring on the picture) and watch which unknowns stay in $\\Sigma M$: a reaction whose line passes through the point has no moment about it. " +
    "Then slide the load $P$ along the beam, even onto the overhang past B.",
  setup: {
    body: { points: [[0, 0], [8, 0]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [6, 0] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [2, 0], push: true }],
    about: { at: [3, 0], label: "C" }, // starts in the middle: 2 unknowns, so every task needs a change
    showMomentPoint: true,
    showMomentUnknowns: true,
  },
  view: { xmin: -1.3, xmax: 9.3, ymin: -3.9, ymax: 2.6 }, // room below for B_y with the load on the overhang (up to 800 N)
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**If you take moments about the pin A, which unknowns are left in $\\Sigma M_A$?**",
    options: [
      { text: "Only $B_y$", correct: true },
      { text: "$A_x$, $A_y$ and $B_y$", feedback: "$A_x$ and $A_y$ act AT A: their moment arm about A is zero." },
      { text: "None of them", feedback: "$B_y$ acts 6 m from A, so it has a moment about A." },
    ],
    explain: "A force through the moment point has no moment about it: about A, one equation holds one unknown.",
  },
  editable: [
    {
      label: "Take moments about",
      options: [
        point("C — the middle of AB", { at: [3, 0], label: "C" }),
        point("D — a point off the beam", { at: [3, 1.5], label: "D" }),
        point("A — the pin", "A"),
        point("B — the roller", "B"),
      ],
    },
    { path: "forces.#P.at.0", label: "P acts at x", min: 0.5, max: 8, step: 0.5, unit: "m" },
  ],
  tasks: [
    { text: "Take moments about a point where $\\Sigma M$ has only **one** unknown.", check: (v) => v.nM === 1 },
    { text: "Find a point where $\\Sigma M$ has all **three** unknowns (it still equals zero!).", check: (v) => v.nM === 3 },
    { text: "Move $P$ so that A and B carry the same load ($A_y = B_y$).", check: (v) => Math.abs(v.A_y - v.B_y) < 1 },
    { text: "Move $P$ onto the overhang so the pin has to pull **down** ($A_y < 0$).", check: (v) => v.A_y < -1 },
  ],
  hints: [
    "A reaction has no moment about a point on its own line of action. Both of the pin's reactions, $A_x$ and $A_y$, act at A.",
    "$A_x$ acts along the beam's line. A point off that line (like D) feels its moment too.",
    "Taking moments about B: $A_y$ turns the beam one way and $P$ the other. What happens when $P$ passes B?",
  ],
  explanation:
    "Equilibrium means $\\Sigma M = 0$ about every point, but the SMART point is where the unknowns meet: about A, both pin reactions drop out and " +
    "$\\Sigma M_A = 0$ gives $B_y$ at once; about B it gives $A_y$. A point like D keeps all three unknowns, so you'd have to solve them together. " +
    "With the load on the overhang, $P$ and $B_y$ tip the beam about B, and the pin must hold the end down: $A_y$ comes out negative.",
};
