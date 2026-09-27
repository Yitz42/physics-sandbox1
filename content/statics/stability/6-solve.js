// Unit 4.4, stage 6 — solve: a beam on a pin and a roller on a 30° incline.
// Check it's stable (3 unknowns, not parallel, not concurrent), then find the reactions.
// The roller pushes perpendicular to its incline: 30° from vertical, up and to the LEFT.
// Hand check (default numbers): 5 m beam, 40 kg → W = 392.4 N at 2.5 m; P = 600 N down at 2 m.
//   ΣM_A: 5 N_B cos30° − 600(2) − 392.4(2.5) = 0 → N_B = 2181 / 4.3301 = 503.7 N
//   ΣF_x: A_x − N_B sin30° = 0                   → A_x = 251.8 N
//   ΣF_y: A_y + N_B cos30° − 600 − 392.4 = 0      → A_y = 992.4 − 436.2 = 556.2 N
// (Same numbers as tests/statics/rigid-body.test.js.)

export default {
  id: "stability/6-solve",
  challenge: "solve",
  solver: "statics.rigidBody",
  title: "Roller on a Slope",
  mission: "Check the beam is properly supported, then find its reactions.",
  instructions:
    "A beam (its mass is shown) is pinned at A and rests on a roller on a 30° incline at B. It carries a load $P$. " +
    "Draw its free-body diagram, choose the equations, then count the unknowns and find the reactions. ($A_x$ and $A_y$ are positive if they point right and up.)",
  setup: {
    body: { points: [[0, 0], [5, 0]], mass: 40 },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [5, 0], normal: [-0.5, Math.sqrt(3) / 2], direction: { angle: 30, from: "+y", toward: "-x" }, symbol: "N_B" },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [2, 0], push: true }],
    massLabel: { at: [3.6, 0.45], text: "beam" },
    texts: [{ at: [5.75, -0.75], text: "30° incline" }], // under the tilted roller at B
    showDegree: true,
  },
  view: { xmin: -1.4, xmax: 6.4, ymin: -2.2, ymax: 2.2 },
  vary: [
    { path: "forces.#P.magnitude", min: 400, max: 900, step: 25 },
    { path: "body.mass", min: 30, max: 60, step: 5 },
  ],
  solve: {
    steps: ["fbd", "equations", "answer"],
    equationMode: "numeric",
    intros: {
      fbd: "Draw the free-body diagram: replace the pin and the inclined roller with their reactions, and show **every** force on the beam.",
      answer: "Count the unknowns, then solve the equations for the reactions:",
    },
    candidates: [
      { id: "A_x" },
      { id: "A_y" },
      { id: "N_B", wrongDirection: "The roller pushes perpendicular to ITS surface — the 30° incline — so $N_B$ tilts 30° from vertical, up and to the left." },
      { id: "W", missing: "A force is missing. The beam has mass: what does gravity do to it?" },
      { id: "B_x", symbol: "B_x", at: "B", feedback: "A roller can't grip along its surface. It gives one push, $N_B$, perpendicular to the incline." },
      { id: "M_A", symbol: "M_A", at: "A", moment: true, feedback: "A pin lets the beam turn, so it gives no moment." },
    ],
  },
  ask: [{ quantity: "n", whole: true, min: 0, max: 9 }, { quantity: "N_B", min: 0 }, { quantity: "A_x" }, { quantity: "A_y" }],
  hints: [
    "Pin: $A_x$, $A_y$. Inclined roller: one push $N_B$, perpendicular to the incline. 3 unknowns, and they don't all meet at one point.",
    "Moments about A: only $N_B$'s vertical part, $N_B\\cos 30^\\circ$, has a moment arm (5 m); its horizontal part acts along the beam.",
    "Then $\\Sigma F_x$: $A_x = N_B \\sin 30^\\circ$; and $\\Sigma F_y$ gives $A_y$.",
  ],
  explanation:
    "A pin and an inclined roller give 3 unknowns, not parallel and not concurrent: the beam is stable and determinate. " +
    "Because the roller's push is tilted, it has a horizontal part — which the pin must balance with $A_x$.",
};
