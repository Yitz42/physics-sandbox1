// Unit 7, stage 6 — solve: a beam on a pin and a roller, from FBD to reactions.
// Hand check (default numbers): 6 m beam, 40 kg → W = 392.4 N at 3 m;
// P = 500 N on a 3-4-5 slope (down and to the right) at 2 m → (300, −400) N.
//   ΣF_x: A_x + 300 = 0                          → A_x = −300 N (it points left)
//   ΣM_A: 6 B_y − 400(2) − 392.4(3) = 0          → B_y = 1977.2 / 6 = 329.5 N
//        (P's moment arm is its perpendicular distance, 2(4/5) = 1.6 m: 500(1.6) = 400(2) ✓)
//   ΣF_y: A_y + 329.5 − 400 − 392.4 = 0          → A_y = 462.9 N
// (Same numbers as the test in tests/statics/rigid-body.test.js.)

export default {
  id: "supports/6-solve",
  challenge: "solve",
  solver: "statics.rigidBody",
  title: "Pin and Roller",
  mission: "Draw the beam's free-body diagram and find the support reactions.",
  instructions:
    "This beam (its mass is shown) is held by a pin at A and a roller at B, and a slanted force $P$ pushes on it. " +
    "Draw its free-body diagram, choose the equations, then find the reactions. ($A_x$ and $A_y$ are positive if they point right and up.)",
  setup: {
    body: { points: [[0, 0], [6, 0]], mass: 40 },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [6, 0] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 500, direction: { slope: [3, -4] }, at: [2, 0], push: true }],
    massLabel: { at: [4.3, 0.45], text: "beam" }, // e.g. "40 kg beam", whatever the mass
    dims: [{ from: [0, -0.9], to: [2, -0.9] }, { from: [2, -0.9], to: [6, -0.9] }],
  },
  view: { xmin: -1.4, xmax: 7.4, ymin: -2.1, ymax: 2.2 },
  vary: [
    { path: "forces.#P.magnitude", min: 300, max: 800, step: 50 },
    { path: "body.mass", min: 30, max: 60, step: 5 },
  ],
  solve: {
    steps: ["fbd", "equations", "answer"],
    equationMode: "numeric",
    intros: { fbd: "Draw the free-body diagram: isolate the beam — replace each support with the reactions it gives — and show **every** force acting on it." },
    // The palette: the right reactions and the weight, plus reactions these supports can't give.
    candidates: [
      { id: "A_x" },
      { id: "A_y" },
      { id: "B_y", wrongDirection: "A roller can only **push** on the beam, perpendicular to the ground: $B_y$ points up." },
      { id: "W", missing: "A force is missing. The beam has mass: what does gravity do to it?" },
      { id: "B_x", symbol: "B_x", at: "B", feedback: "A roller can't push sideways — it just rolls. It gives only $B_y$, perpendicular to the ground." },
      { id: "M_A", symbol: "M_A", at: "A", moment: true, feedback: "A pin lets the beam turn, so it can't resist a moment. Only a fixed support gives $M_A$." },
    ],
  },
  ask: [{ quantity: "A_x" }, { quantity: "A_y" }, { quantity: "B_y", min: 0 }],
  hints: [
    "The pin gives $A_x$ and $A_y$, the roller gives $B_y$ (up), and the beam's weight $W = mg$ acts at its middle.",
    "$P$ on a 3-4-5 slope: $P_x = \\tfrac{3}{5}P$ (right), $P_y = \\tfrac{4}{5}P$ (down).",
    "Take moments about A: $A_x$ and $A_y$ pass through A, so $\\Sigma M_A = 0$ has only one unknown, $B_y$.",
  ],
  explanation:
    "The whole method: (1) isolate the beam and draw every force on it — the reactions each support gives, the loads, and the weight; " +
    "(2) write $\\Sigma F_x = 0$, $\\Sigma F_y = 0$ and $\\Sigma M_A = 0$; (3) solve. Taking moments about the pin leaves just one unknown — a trick Unit 5.2 uses all the time. " +
    "A negative $A_x$ just means it really points left.",
};
