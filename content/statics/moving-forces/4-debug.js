// Moving a force, stage 4 — debug: a student moved a force on a bracket to the
// bolt O; one term of their force-couple system is wrong or missing.
// Hand check (default numbers): F = 300 N on a 4-3 slope (down-right) at A (0.8, 0.6):
//   F_x = 240 N, F_y = −180 N; (M_R)_O = 0.8(−180) − 0.6(240) = −288 N·m;
//   the moment arm is d = 0.96 m (not OA = 1.0 m).

export default {
  id: "moving-forces/4-debug",
  challenge: "debug",
  solver: "statics.equivalent",
  title: "Where's the Couple?",
  instructions:
    "A student replaced the force $F$ on the bracket by a force-couple system at the bolt O. Check their work against the picture: " +
    "the force must stay the same, and the couple must equal $F$'s moment about O.",
  setup: {
    analysis: "equivalent",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0, 0.6], [0.8, 0.6]] },
    arrowFraction: 0.3,
    resultant: "at O",
    line: false,
    forces: [{ id: "F", symbol: "F", magnitude: 300, direction: { slope: [4, -3] }, at: [0.8, 0.6], pointLabel: "A" }],
    dims: [
      { from: [0, -0.12], to: [0.8, -0.12] },
      { from: [-0.32, 0], to: [-0.32, 0.6], side: -1 },
    ],
  },
  view: { xmin: -0.5, xmax: 1.4, ymin: -0.45, ymax: 1.05 },
  vary: [
    { path: "forces.0.magnitude", min: 100, max: 500, step: 10 },
    { path: "forces.0.direction", values: [{ slope: [4, -3] }, { slope: [3, -4] }] }, // both down and to the right
  ],
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's force-couple system at O (numbers in N and m). One term is wrong or missing.",
    mutations: [
      { kind: "missing", equation: "Mp", term: "F" },
      { kind: "swap", equation: "Mp", term: "F" },
      { kind: "sign", equation: "Mp", term: "F" },
      { kind: "sign", equation: "Rx", term: "F" },
    ],
    notes: {
      F: "That term is right: compare it with the picture (its direction, and its perpendicular distance from O).",
    },
  },
  hints: [
    "Moving a force doesn't change it: $F_{Rx}$ and $F_{Ry}$ are just $F$'s components.",
    "The couple is $F$'s moment about O. Is it there at all? Does it use the PERPENDICULAR distance from O to $F$'s line of action?",
    "$F$ pushes down and to the right, above and to the right of O: which way does it turn the bracket about O?",
  ],
  explanation:
    "A force-couple system at O is the same force plus a couple equal to the force's moment about O — with the perpendicular distance $d$ (here 0.96 m, not OA = 1.0 m) and the right sign. " +
    "Forgetting the couple is the most common slip: the force alone at O would not turn the bracket at all.",
};
