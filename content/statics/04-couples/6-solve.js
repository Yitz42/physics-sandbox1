// Unit 4, stage 6 — solve: the resultant of several couples.
// Hand check (default numbers):
//   F_1 = 200 N, pushing right at A (0, 0.4), pulling left at B (0, 0): d_1 = 0.4 m, clockwise → −80 N·m
//   F_2 = 150 N at 60° above +x at D (0.8, 0), opposite at C (0.4, 0):
//        d_2 = 0.4 sin 60° = 0.3464 m (not CD = 0.4 m), counterclockwise                 → +51.96 N·m
//   M_3 = 40 N·m clockwise                                                                → −40 N·m
//   M_R = −80 + 51.96 − 40 = −68.04 N·m (clockwise).  Every version stays clockwise
//   (M_R ≤ −60 + 200(0.4)(0.866) − 40 = −30.7 N·m), so a sign slip is always visible.

export default {
  id: "04-couples/6-solve",
  challenge: "solve",
  solver: "statics.couple",
  title: "Add Up the Couples",
  instructions:
    "Two couples and a couple moment $M_3$ act on the plate. Find the **resultant couple moment** $M_R$. " +
    "First choose the correct equation, then find $M_R$ (counterclockwise positive). " +
    "Stuck on a distance? Press **Show the distances d** under the picture.",
  setup: {
    analysis: "couple",
    plates: [{ from: [0, 0], to: [0.8, 0.4] }],
    couples: [
      { id: "C1", symbol: "F_1", magnitude: 200, direction: "right", at: [0, 0.4], opposite: [0, 0], pointLabels: ["A", "B"], push: [true, false], dimShift: -0.16 },
      { id: "C2", symbol: "F_2", magnitude: 150, direction: { angle: 60, from: "+x", toward: "+y" }, at: [0.8, 0], opposite: [0.4, 0], pointLabels: ["D", "C"] },
    ],
    moments: [{ id: "M3", symbol: "M_3", magnitude: 40, sense: -1, at: [0.3, 0.2] }],
    dims: [
      { from: [0, 0.52], to: [0.4, 0.52] },
      { from: [0.4, 0.52], to: [0.8, 0.52] },
      { from: [1.2, 0], to: [1.2, 0.4], side: -1 },
    ],
    momentAt: [0.62, 0.22],
  },
  view: { xmin: -0.5, xmax: 1.35, ymin: -0.35, ymax: 0.65 },
  vary: [
    { path: "couples.#C1.magnitude", values: [150, 200, 250] },
    { path: "couples.#C2.magnitude", values: [100, 150, 200] },
    { path: "couples.#C2.direction.angle", values: [30, 45, 60] },
    { path: "moments.#M3.magnitude", values: [40, 50, 60, 80] },
  ],
  // A button under the picture shows the distances d (never M_R, the answer).
  sceneOpts: { hideMoment: true },
  toggles: [{ key: "arms", label: "the distances d" }],
  solve: { steps: ["equations", "answer"], equationMode: "numeric" },
  ask: [{ quantity: "M" }],
  hints: [
    "Each couple adds its own moment $\\pm Fd$; a given couple moment like $M_3$ is added as it is, with its sign.",
    "For $F_2$, $d_2$ is the perpendicular distance between its two lines of action: $d_2 = \\overline{CD}\\,\\sin\\theta$, not CD itself.",
    "Signs: the top of the plate pushed right and the bottom pulled left turns it clockwise (−).",
  ],
  explanation:
    "Couples add like numbers: $M_R = \\Sigma M$, each with its sign. It doesn't matter where on the plate each couple acts — only its moment counts. " +
    "For an angled couple, $d$ is the perpendicular distance between the lines of action, which is shorter than the distance between the points.",
};
