// Unit 9.1, stage 6 — solve: a painter's ladder on a rough floor, against a smooth wall.
// A 5 m ladder at 60° to the floor: foot A (2.5, 0), top B (0, 4.330) on the wall. Its mass m
// (at its middle), a painter P a distance d up it. The floor is rough (μs = 0.4), the wall smooth.
// Hand check (m = 20 kg → W = 196.2 N, P = 700 N, d = 3 m):
//   ΣF_y: N_A − W − P = 0            → N_A = 896.2 N
//   ΣM_A: 4.330 N_B − 1.25 W − (0.5 d) P = 0 → N_B = (245.25 + 1050) / 4.3301 = 299.1 N
//   ΣF_x: N_B − F_A = 0              → F_A = 299.1 N (toward the wall)
//   μs needed: F_A / N_A = 0.334 < 0.4 — it holds. (Same numbers as tests/statics/friction.test.js.)
// Versions: m 15–25 kg, P 600–900 N, d 1–3 m: the ratio stays below 0.35, so the ladder always holds.

const H = 5 * Math.sin(Math.PI / 3); // the top's height on the wall, 4.330 m

export default {
  id: "dry-friction/6-solve",
  challenge: "solve",
  solver: "statics.friction",
  title: "The Painter's Ladder",
  mission: "Draw a ladder's free-body diagram and find the friction that holds it.",
  instructions:
    "A 5 m ladder leans against a smooth wall at 60° to the floor, with a painter partway up. The floor is rough ($\\mu_s = 0.4$); the wall is smooth. " +
    "Draw the ladder's free-body diagram, choose the equations, then find the reactions and the smallest $\\mu_s$ that stops the foot slipping.",
  setup: {
    body: { points: [[2.5, 0], [0, H]], mass: 20, look: "ladder", clip: { xmin: 0, ymin: 0 } },
    // The wall and the rough floor themselves, drawn full length (not support symbols).
    grounds: [
      { from: [0, 0], to: [4, 0], normal: [0, 1], rough: true },
      { from: [0, 0], to: [0, H + 0.4], normal: [1, 0] },
    ],
    supports: [
      { id: "A", type: "rough", at: [2.5, 0], normal: [0, 1], friction: "left", mus: 0.4, drawn: false },
      { id: "B", type: "smooth", at: [0, H], normal: [1, 0], drawn: false },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 700, direction: "down", along: 3, push: true }], // (the painter presses down on a rung)
    ladderMarks: true,
    massLabel: { at: [3.4, 3.8], text: "ladder" }, // "20 kg ladder", in the open space right of its top
  },
  vary: [
    { path: "body.mass", values: [15, 20, 25] },
    { path: "forces.#P.magnitude", min: 600, max: 900, step: 50 },
    { path: "forces.#P.along", values: [1, 1.5, 2, 2.5, 3] },
  ],
  solve: {
    steps: ["fbd", "equations", "answer"],
    equationMode: "numeric",
    intros: {
      fbd: "Draw the free-body diagram: replace the floor and the wall with the forces they give — and remember the ladder's own weight.",
      equations: "Choose the correct equation in each group. The moments are about A, the foot, where two unknowns act.",
    },
    candidates: [
      { id: "N_A" },
      { id: "W", missing: "A force is missing. The ladder has mass: what does gravity do to it?" },
      { id: "F_A" },
      { id: "N_B", wrongDirection: "A smooth wall can only **push** on the ladder, away from the wall: $N_B$ points right." },
      { id: "F_B", symbol: "F_B", at: "B", feedback: "The wall is SMOOTH: it can't grip, so there's no friction at B — only its push $N_B$." },
      { id: "M_A", symbol: "M_A", at: "A", moment: true, feedback: "The floor can't stop the ladder turning by itself: a surface only pushes and grips. The wall's push does that." },
    ],
  },
  ask: [{ quantity: "N_B", min: 0 }, { quantity: "F_A" }, { quantity: "N_A", min: 0 }, { quantity: "mu_A", precision: 0.005 }],
  hints: [
    "The rough floor gives $N_A$ (up) and friction $F_A$ (along the floor); the smooth wall only pushes, $N_B$. The weight $W = mg$ acts at the middle.",
    "Moments about A: $N_A$ and $F_A$ drop out. $N_B$'s arm is the top's height; W's and P's arms are their distances from the wall side of A, measured level.",
    "Then $\\Sigma F_x = 0$ gives $F_A = N_B$, and $\\Sigma F_y = 0$ gives $N_A$. The smallest $\\mu_s$ that holds is $F_A / N_A$.",
  ],
  explanation:
    "The wall pushes the ladder's top away; only friction at the foot stops the foot sliding out, so $F_A = N_B$. " +
    "The ladder holds while $F_A \\le \\mu_s N_A$ — here it needs less than the floor's 0.4. The higher the painter climbs, the bigger $N_B$ and $F_A$ get, while $N_A$ stays the same: climb too high and the foot slips.",
};
