// Unit 5, stage 4 — debug: a mistake in moving a system to O.
// Hand check (default numbers), beam from O (x = 0) to x = 5 m:
//   F_1 = 300 N down at 1 m:                  −300(1)          = −300 N·m
//   F_2 = 200 N, 60° above +x, at 3 m:        +200(3 sin 60°)  = +519.6 N·m  (d = 2.598 m, not 3 m)
//   F_3 = 250 N down at 5 m:                  −250(5)          = −1250 N·m
//   couple M_1 = 400 N·m counterclockwise:                       +400 N·m
//   (M_R)_O = −630.4 N·m;  F_Rx = 100 N,  F_Ry = −300 + 173.2 − 250 = −376.8 N.

export default {
  id: "05-equivalent-systems/4-debug",
  challenge: "debug",
  solver: "statics.equivalent",
  title: "Find the Mistake",
  instructions:
    "A student replaced these forces and the couple with a resultant force and moment at O. Their $F_{Rx}$ and $F_{Ry}$ lines are right; " +
    "their $(M_R)_O$ line has one mistake.",
  setup: {
    analysis: "equivalent",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [5, 0]] },
    arrowFraction: 0.13,
    hideArms: true,
    resultant: "at O",
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 300, direction: "down", at: [1, 0], push: true },
      { id: "F2", symbol: "F_2", magnitude: 200, direction: { angle: 60, from: "+x", toward: "+y" }, at: [3, 0] },
      { id: "F3", symbol: "F_3", magnitude: 250, direction: "down", at: [5, 0], push: true },
    ],
    moments: [{ id: "M1", symbol: "M_1", magnitude: 400, sense: 1, at: [4, 0.35] }],
    dims: [
      { from: [0, -0.3], to: [1, -0.3] },
      { from: [1, -0.3], to: [3, -0.3] },
      { from: [3, -0.3], to: [5, -0.3] },
    ],
  },
  view: { xmin: -0.8, xmax: 5.7, ymin: -1.1, ymax: 1.1 },
  vary: [
    { path: "forces.#F1.magnitude", min: 200, max: 400, step: 20 },
    { path: "forces.#F3.magnitude", min: 200, max: 300, step: 10 },
  ],
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's work (numbers in N and m). One term in the $(M_R)_O$ line is wrong.",
    mutations: [
      { kind: "sign", equation: "Mp", term: "F3" },
      { kind: "missing", equation: "Mp", term: "F1" },
      { kind: "swap", equation: "Mp", term: "F2" },
      { kind: "sign", equation: "Mp", term: "F2" },
    ],
    notes: {
      F1: "$F_1$'s term is right: it pushes down 1 m to the right of O, so it turns the beam clockwise (−).",
      F2: "$F_2$'s term is right: its moment arm is the perpendicular distance from O to its slanted line of action, and it turns the beam counterclockwise (+).",
      F3: "$F_3$'s term is right: it pushes down at the far end, clockwise (−).",
      M1: "The couple moment is right: a couple adds its own moment, the same about any point, with its sign.",
    },
  },
  hints: [
    "Go term by term: which way does each force turn the beam about O?",
    "For the slanted force, the moment arm is the perpendicular distance from O to its line of action — not the distance along the beam.",
    "Every force with a moment arm about O belongs in $(M_R)_O$.",
  ],
  explanation:
    "Moving a system to O keeps its effect only if $(M_R)_O$ includes every force's moment about O — with the right moment arm and sign — plus every couple moment. " +
    "A couple needs no moment arm: its moment is the same about any point.",
};
