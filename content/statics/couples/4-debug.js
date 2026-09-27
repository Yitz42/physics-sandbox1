// Couples, stage 4 — debug: the moment of a couple about a point P, force by force.
// Hand check (default numbers): 150 N left at A (0, 0.5), 150 N right at B (0.3, 0.1), P = (0.6, −0.1):
//   F_A: pulls left, 0.6 m above P → counterclockwise:  +150(0.6) = +90 N·m
//   F_B: pulls right, 0.2 m above P → clockwise:        −150(0.2) = −30 N·m
//   M_P = +60 N·m  =  F·d with d = 0.5 − 0.1 = 0.4 m.    (A is 0.849 m from P, but its arm is 0.6 m.)

export default {
  id: "couples/4-debug",
  challenge: "debug",
  solver: "statics.couple",
  title: "Find the Mistake",
  instructions:
    "A student found the moment of this couple about point P, one force at a time. " +
    "The second line, $M = Fd$, is right — and the two lines must agree, because a couple has the same moment about every point.",
  setup: {
    analysis: "couple",
    about: { at: [0.6, -0.1], label: "P" },
    plates: [{ from: [0, 0], to: [0.3, 0.6] }],
    forces: [
      { id: "F_A", symbol: "F_A", magnitude: 150, direction: "left", at: [0, 0.5], pointLabel: "A" },
      { id: "F_B", symbol: "F_B", magnitude: 150, direction: "right", at: [0.3, 0.1], pointLabel: "B" },
    ],
    couples: [{ id: "C", symbol: "F", forces: ["F_A", "F_B"] }],
    hideSeparation: true, // the picture shows the arms from P; d is left to the equations
  },
  view: { xmin: -0.35, xmax: 1.0, ymin: -0.4, ymax: 0.8 },
  // New versions move P, so the arms change but the answer M doesn't.
  vary: [
    { path: "about.at.0", min: 0.45, max: 0.8, step: 0.05 },
    { path: "about.at.1", min: -0.35, max: -0.05, step: 0.05 },
  ],
  sceneOpts: { arms: true, hideMoment: true },
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's work (numbers in N and m). One term in the first line is wrong.",
    mutations: [
      { kind: "sign", equation: "Mp", term: "F_B" },
      { kind: "missing", equation: "Mp", term: "F_B" },
      { kind: "swap", equation: "Mp", term: "F_A" },
      { kind: "sign", equation: "Mp", term: "F_A" },
    ],
    notes: {
      F_A: "$F_A$'s term is right: its line of action is horizontal, so its moment arm is the vertical distance from P, and pulling left above P turns counterclockwise (+).",
      F_B: "$F_B$'s term is right: its moment arm is the vertical distance from P to its line, and pulling right above P turns clockwise (−).",
    },
  },
  hints: [
    "Add up the first line and compare it with $M = Fd$. They must be equal.",
    "Both forces count: a couple is **two** forces, and about P each has its own moment.",
    "For each force: which way does it turn the plate about P? Is its moment arm the **perpendicular** distance to its line of action?",
  ],
  explanation:
    "About a point outside the couple, the two forces turn opposite ways: one moment is clockwise, the other counterclockwise. " +
    "Their sum is always $Fd$ — here counterclockwise — no matter where P is. Computing it both ways is a great check.",
};
