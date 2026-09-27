// Varignon's theorem, stage 4 — debug: the student's xF_y − yF_x line has one
// slip; their ΣFd line is right, and the two should agree.
// Hand check (default numbers), bracket with O at the base:
//   F1 = 200 N right at (0, 0.25):  −yF_x = −0.25(200) = −50 N·m
//   F2 = 150 N down at (0.5, 0.4):   xF_y = 0.5(−150) = −75 N·m
//   F3 = 100 N, 30° above +x, at (0.3, 0.4): xF_y − yF_x = 0.3(50) − 0.4(86.6) = −19.6 N·m
//   M_O = −144.6 N·m.  (F1 pushes on the upright, so its arrow doesn't lie along the bracket.)

export default {
  id: "varignon/4-debug",
  challenge: "debug",
  solver: "statics.moment",
  title: "Check the Components",
  instructions:
    "A student found the moment of three forces about O two ways. Their first line ($\\Sigma Fd$) is right. Their second line — Varignon's theorem, $xF_y - yF_x$ — has one mistake. " +
    "For each force, check which components it has, their moment arms ($x$ for $F_y$, $y$ for $F_x$) and their signs.",
  setup: {
    analysis: "moment",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0, 0.4], [0.5, 0.4]] }, // an L-shaped bracket
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 200, direction: "right", at: [0, 0.25] },
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
    intro: "The student's work (numbers in N and m). One term in the SECOND line is wrong or missing.",
    mutations: [
      { kind: "sign", equation: "Mxy", term: "F1" },
      { kind: "swap", equation: "Mxy", term: "F3" },
      { kind: "sign", equation: "Mxy", term: "F2" },
      { kind: "missing", equation: "Mxy", term: "F1" },
    ],
    notes: {
      F1: "$F_1$'s term is right: it is horizontal, 0.25 m above O, pushing right — clockwise, so $-yF_x$ is negative.",
      F2: "$F_2$'s term is right: it is vertical, 0.5 m right of O, pushing down — clockwise.",
      F3: "$F_3$'s terms are right here: $F_{3y} = F_3\\sin 30^\\circ$ with arm $x$, and $F_{3x} = F_3\\cos 30^\\circ$ with arm $y$.",
    },
  },
  hints: [
    "Work each force's moment out yourself, component by component, and compare with the student's terms.",
    "$F_1$ has only an x-component; $F_2$ only a y-component; $F_3$ has both.",
    "Signs: a component pushing right above O turns clockwise (−); one pushing down to the right of O turns clockwise too.",
  ],
  explanation:
    "Varignon's theorem gives a moment without finding $d$: $M_O = \\Sigma(xF_y - yF_x)$. Each term needs the right component (sin or cos), the right arm and the right sign. " +
    "Working a moment out both ways ($\\Sigma Fd$ and $\\Sigma(xF_y - yF_x)$) is a strong check: they must agree.",
};
