// Unit 4.2, stage 2 — predict the reactions of an overhanging beam and of a cantilever.
// Hand checks (default numbers):
//   Overhang: pin A (0), roller B (4 m), w = 300 N/m on AB → F_w = 1200 N at 2 m; P = 400 N at 6 m.
//     ΣM_A: 4B_y − 1200(2) − 400(6) = 0 → B_y = 4800/4 = 1200 N
//     ΣF_y: A_y + 1200 − 1200 − 400 = 0 → A_y = 400 N
//   Cantilever: fixed at A (0), w = 400 N/m over 3 m → F_w = 1200 N at 1.5 m; P = 500 N at 3 m.
//     ΣF_y: A_y − 1200 − 500 = 0 → A_y = 1700 N
//     ΣM_A: M_A − 1200(1.5) − 500(3) = 0 → M_A = 3300 N·m (counterclockwise)
// (Same numbers as tests/statics/rigid-body.test.js.)

export default {
  id: "rigid-body-equilibrium/2-predict",
  challenge: "predict",
  solver: "statics.rigidBody",
  title: "Predict the Reactions",
  mission: "Predict the support reactions, using the smartest moment point.",
  instructions: "Predict the support reactions. (Each version is a different beam.)",
  situations: [
    {
      name: "overhang",
      instructions:
        "A beam rests on a pin at A and a roller at B, with a uniform load $w$ between them and a point load $P$ on the overhanging end. " +
        "Predict the vertical reactions. (Replace the distributed load by its resultant: its area, at its middle.)",
      setup: {
        body: { points: [[0, 0], [6, 0]] },
        supports: [
          { id: "A", type: "pin", at: [0, 0] },
          { id: "B", type: "roller", at: [4, 0] },
        ],
        forces: [{ id: "P", symbol: "P", magnitude: 400, direction: "down", at: [6, 0], push: true }],
        loads: [{ id: "w", shape: "uniform", from: 0, to: 4, w: 300, partSymbols: ["F_w"] }],
        showReactions: "reveal",
      },
      view: { xmin: -1.2, xmax: 7.2, ymin: -2.2, ymax: 2.6 },
      vary: [
        { path: "loads.0.w", min: 200, max: 500, step: 50 },
        { path: "forces.#P.magnitude", min: 200, max: 600, step: 50 },
      ],
      ask: [{ quantity: "A_y" }, { quantity: "B_y", min: 0 }],
      hints: [
        "The distributed load's resultant is its area, $F_w = w \\times 4$ m, acting at the middle of AB.",
        "Moments about A: $A_x$ and $A_y$ drop out, leaving only $B_y$.",
        "Then $\\Sigma F_y = 0$ gives $A_y$. It could even come out negative — that just means it points down.",
      ],
    },
    {
      name: "cantilever",
      instructions:
        "A cantilever beam is built into a wall at A. It carries a uniform load $w$ along its length and a load $P$ hangs from its tip. " +
        "Predict the wall's vertical reaction $A_y$ and its moment $M_A$ (counterclockwise positive).",
      setup: {
        body: { points: [[0, 0], [3, 0]] },
        supports: [{ id: "A", type: "fixed", at: [0, 0], normal: [1, 0] }],
        // P hangs from the tip (drawn below the beam, clear of the distributed load's arrows).
        forces: [{ id: "P", symbol: "P", magnitude: 500, direction: "down", at: [3, 0] }],
        loads: [{ id: "w", shape: "uniform", from: 0, to: 3, w: 400, partSymbols: ["F_w"] }],
        showReactions: "reveal",
      },
      view: { xmin: -1.2, xmax: 4.2, ymin: -1.9, ymax: 2.2 },
      vary: [
        { path: "loads.0.w", min: 200, max: 600, step: 50 },
        { path: "forces.#P.magnitude", min: 300, max: 900, step: 50 },
      ],
      ask: [{ quantity: "A_y" }, { quantity: "M_A" }],
      hints: [
        "A fixed support gives $A_x$, $A_y$ AND a moment $M_A$. With only vertical loads, $A_x = 0$.",
        "$\\Sigma F_y = 0$: $A_y$ holds up the whole load, $F_w + P$.",
        "Moments about A (where $A_x$ and $A_y$ act): $M_A$ must cancel the clockwise moments of $F_w$ (at 1.5 m) and $P$ (at 3 m).",
      ],
    },
  ],
  hints: [],
  explanation:
    "For each beam, taking moments about the support with the most unknowns leaves ONE unknown in $\\Sigma M$: $B_y$ for the overhanging beam, $M_A$ for the cantilever. " +
    "$\\Sigma F_y = 0$ then gives the vertical reaction at A. A distributed load acts, for these equations, like its resultant: its area at its centroid.",
};
