// Unit 5.5, stage 6 — solve: a boom propped by a strut (a two-force member).
// The boom: pinned to the wall at A, 4 m, 30 kg (W = 294.3 N at 2 m), a load P
// at its tip; a strut from B (3, 0) down to D (0, −2): L = √13 = 3.606 m.
// Its force F_BD is positive in tension (pulling B toward D), so a strut pushing is negative.
// Hand check (default numbers, P = 600 N):
//   ΣM_A: F_BD's moment about A: r_B × F = (3, 0) × F(−3, −2)/√13 = −6F/√13
//         −6F/√13 − 294.3(2) − 600(4) = 0 → F_BD = −2988.6·√13/6 = −1796.0 N (compression)
//   ΣF_x: A_x − (3/√13)F_BD = 0 → A_x = (3/√13)(−1796.0) = −1494.3 N (it points left)
//   ΣF_y: A_y − (2/√13)F_BD − 294.3 − 600 = 0 → A_y = 894.3 − 996.2 = −101.9 N (down)
// (Same numbers as tests/statics/rigid-body.test.js.)

export default {
  id: "two-force-members/6-solve",
  challenge: "solve",
  solver: "statics.rigidBody",
  title: "Boom and Strut",
  mission: "Draw the boom's free-body diagram and find the strut's force and the pin reactions.",
  instructions:
    "A boom (its mass is shown) is pinned to the wall at A and propped by a strut BD — a bar pinned at both ends. A load $P$ acts at its tip. " +
    "Draw its free-body diagram, choose the equations, then find the forces. ($F_{BD}$ is positive in tension; $A_x$ and $A_y$ are positive right and up.)",
  setup: {
    body: { points: [[0, 0], [4, 0]], mass: 30 },
    supports: [
      { id: "A", type: "pin", at: [0, 0], normal: [1, 0] },
      { id: "B", type: "link", at: [3, 0], anchor: [0, -2], anchorLabel: "D", symbol: "F_{BD}" },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [4, 0], push: true }],
    massLabel: { at: [1.2, 0.45], text: "boom" },
    dims: [{ from: [0, 0.9], to: [3, 0.9] }, { from: [3, 0.9], to: [4, 0.9] }, { from: [-1, 0], to: [-1, -2] }],
  },
  view: { xmin: -2, xmax: 5.4, ymin: -3.2, ymax: 2.6 },
  vary: [
    { path: "forces.#P.magnitude", min: 400, max: 900, step: 25 },
    { path: "body.mass", values: [20, 25, 30, 35, 40] },
  ],
  solve: {
    steps: ["fbd", "equations", "answer"],
    equationMode: "numeric",
    intros: { fbd: "Draw the free-body diagram: replace the pin with its reactions and the strut with its ONE force along BD, and show **every** force on the boom." },
    candidates: [
      { id: "A_x" },
      { id: "A_y" },
      { id: "F_BD" },
      { id: "W", missing: "A force is missing. The boom has mass: what does gravity do to it?" },
      { id: "B_y", symbol: "B_y", at: "B", feedback: "The strut is a two-force member: it gives one force, along BD. Its vertical part is already inside $F_{BD}$." },
      { id: "M_A", symbol: "M_A", at: "A", moment: true, feedback: "A pin lets the boom turn, so it can't resist a moment. The strut stops it turning." },
    ],
  },
  ask: [{ quantity: "F_BD" }, { quantity: "A_x" }, { quantity: "A_y" }],
  hints: [
    "The strut gives one force along BD (a slope of 3 across, 2 down, length $\\sqrt{13}$). Draw it either way — the sign will tell.",
    "Moments about A: $A_x$ and $A_y$ drop out. Only $F_{BD}$'s vertical part, $\\tfrac{2}{\\sqrt{13}}F_{BD}$, has an arm (3 m).",
    "A negative $F_{BD}$ means the strut pushes: it's in compression.",
  ],
  explanation:
    "Because BD is a two-force member, its force lies along BD — one unknown instead of two. Moments about the pin then give it straight away; " +
    "it comes out negative: the strut pushes (compression). The pin reactions follow from $\\Sigma F_x$ and $\\Sigma F_y$.",
};
