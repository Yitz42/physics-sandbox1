// Unit 7.2, stage 6 — solve: sketch a beam's diagrams (by their shapes), then find its
// largest bending moment and where it is.
// Pin A (0), roller B (6), w on the first 3 m, P at 4.5 m. w = 400, P = 600:
//   load 1200 N at 1.5 m → B_y = (1800 + 2700)/6 = 750 N, A_y = 1050 N.
//   V = 1050 − 400x = 0 at x = 2.625 m (under the load): M_max = 1050(2.625) − 200(2.625)² = 1378.1 N·m.
//   (M at the point load, 750 × 1.5 = 1125 N·m, is smaller.)
// Versions: w 300…500, P 400…800 — V always reaches 0 under the load (w = 300, P = 800: x = 2.917 m).

export default {
  id: "shear-moment-diagrams/6-solve",
  challenge: "solve",
  solver: "statics.internal",
  title: "The Loading Dock Beam",
  mission: "Sketch a beam's shear and moment diagrams and find its largest bending moment.",
  instructions:
    "A loading dock beam rests on a pin at A and a roller at B. Crates spread a uniform load along its left half, and a hoist hangs a point load P further along. " +
    "Work out the shapes of its diagrams, then find the largest bending moment and where it is.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [6, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [4.5, 0], push: true }],
    loads: [{ id: "w", shape: "uniform", from: 0, to: 3, w: 400 }],
    view: "diagrams",
    showReactions: "reveal",
  },
  tallPicture: true,
  vary: [
    { path: "loads.#w.w", min: 300, max: 500, step: 25 },
    { path: "forces.#P.magnitude", min: 400, max: 800, step: 50 },
  ],
  solve: {
    steps: ["choices", "answer"],
    choicesName: "Sketch the diagrams",
    choices: [
      {
        title: "Under the uniform load (from A to 3 m), the shear diagram is…",
        options: [
          { tex: "\\text{a straight line sloping down (slope } -w)", correct: true },
          { tex: "\\text{flat}", kind: "concept", feedback: "It's flat only where there's no distributed load. Here $dV/dx = -w$." },
          { tex: "\\text{a parabola}", kind: "concept", feedback: "That's M under a uniform load. V falls at a steady rate: a straight line." },
        ],
      },
      {
        title: "Between the end of the load and P, the moment diagram is…",
        options: [
          { tex: "\\text{a straight line (V is constant there)}", correct: true },
          { tex: "\\text{a parabola}", kind: "concept", feedback: "No load acts there, so V is constant — and M, its area, grows in a straight line." },
          { tex: "\\text{flat}", kind: "concept", feedback: "M is flat only where V = 0. Here V is constant but not zero." },
        ],
      },
      {
        title: "The largest bending moment is…",
        options: [
          { tex: "\\text{where } V = 0 \\text{, under the uniform load}", correct: true },
          { tex: "\\text{under the point load } P", kind: "concept", feedback: "V is already negative before P, so M is falling there: its peak came earlier, where V passed through zero." },
          { tex: "\\text{at the middle of the beam}", kind: "concept", feedback: "The loading isn't symmetric. The peak is where V = 0." },
        ],
      },
    ],
    choicesDone: "V slopes down under the load and crosses zero there; M peaks at that point. Now find it.",
  },
  ask: [{ quantity: "Mmax" }, { quantity: "xM", precision: 0.01 }],
  hints: [
    "Find the reactions first: replace the uniform load by its resultant, $w \\times 3$ m at 1.5 m.",
    "Under the load, $V = A_y - wx$. It is zero at $x = A_y / w$.",
    "$M_{max}$ = the area under V from A to there: $\\tfrac{1}{2} A_y x$.",
  ],
  explanation:
    "The shapes follow from $dV/dx = -w$ and $dM/dx = V$: under the uniform load V is a sloping line and M a parabola; past it V is constant and M a straight line; at P, V jumps and M has a corner. " +
    "M peaks where V = 0: $x = A_y/w$, with $M_{max} = \\tfrac{1}{2}A_y x$.",
};
