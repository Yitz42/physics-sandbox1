// Unit 3, stage 4 — debug: find the wrong moment arm.
// Hand check (default numbers), bracket with O at the base:
//   F1 = 200 N right at (0, 0.4):  M = −(200)(0.4)   = −80 N·m
//   F2 = 150 N down  at (0.5, 0.4): M = −(150)(0.5)  = −75 N·m
//   F3 = 100 N, 30° above +x, at (0.3, 0.4): d = |0.3 sin30° − 0.4 cos30°| = 0.196 m, M = −19.6 N·m
//   M_O = −174.6 N·m.  (F3 acts 0.5 m from O, but its moment arm is only 0.196 m.)

export default {
  id: "03-moments/4-debug",
  challenge: "debug",
  solver: "statics.moment",
  title: "Find the Wrong Moment Arm",
  instructions:
    "A student found the moment of three forces about O. Their $\\Sigma Fd$ line has one mistake — the other line ($xF_y - yF_x$) is right, and the two should agree.",
  setup: {
    analysis: "moment",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0, 0.4], [0.5, 0.4]] }, // an L-shaped bracket
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 200, direction: "right", at: [0, 0.4] },
      { id: "F2", symbol: "F_2", magnitude: 150, direction: "down", at: [0.5, 0.4] },
      { id: "F3", symbol: "F_3", magnitude: 100, direction: { angle: 30, from: "+x", toward: "+y" }, at: [0.3, 0.4] },
    ],
    dims: [
      { force: "F3", offset: 0.55 },
      { force: "F2", offset: 0.66 },
      { force: "F1", axis: "y", offset: -0.12 },
    ],
  },
  view: { xmin: -0.3, xmax: 0.95, ymin: -0.25, ymax: 0.8 },
  vary: [
    { path: "forces.0.magnitude", min: 100, max: 300, step: 50 },
    { path: "forces.1.magnitude", min: 100, max: 250, step: 50 },
    { path: "forces.2.magnitude", min: 80, max: 200, step: 20 },
  ],
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's work (numbers in N and m). One term in the first line is wrong.",
    mutations: [
      { kind: "swap", equation: "Md", term: "F3" },
      { kind: "sign", equation: "Md", term: "F1" },
      { kind: "missing", equation: "Md", term: "F2" },
      { kind: "sign", equation: "Md", term: "F2" },
    ],
    notes: {
      F1: "$F_1$'s term is right: its line of action is horizontal at height 0.4 m, so $d = 0.4$ m, and it turns the bracket clockwise.",
      F2: "$F_2$'s term is right: it acts vertically, 0.5 m to the right of O, so $d = 0.5$ m, clockwise.",
      F3: "$F_3$'s term is right here. Its moment arm is the perpendicular distance to its line of action.",
    },
  },
  hints: [
    "For each force, picture its line of action. The moment arm is the shortest distance from O to that line.",
    "$F_3$ acts at a point 0.5 m from O, but it is angled — is its moment arm really 0.5 m?",
    "Check each sign: does that force turn the bracket clockwise (−) or counterclockwise (+) about O?",
  ],
  explanation:
    "The moment arm is the **perpendicular** distance from O to the line of action, not the distance to where the force is applied. " +
    "For an angled force these differ. Working the moment out a second way ($xF_y - yF_x$) is a great check: both ways must give the same $M_O$.",
};
