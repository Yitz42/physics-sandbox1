// Moment of a force, stage 6 — solve: the moment of an angled force, two ways.
// Hand check (default numbers): F = 250 N at A = (0.4, 0.3) m, 30° above the −x axis.
//   Components: F_x = −250 cos30° = −216.5 N, F_y = 250 sin30° = 125 N
//   M_O = x F_y − y F_x = 0.4(125) − 0.3(−216.5) = 50 + 64.95 = 114.95 N·m (counterclockwise)
//   Moment arm: d = M_O / F = 0.4598 m (not |OA| = 0.5 m)

export default {
  id: "moments/6-solve",
  challenge: "solve",
  solver: "statics.moment",
  title: "An Angled Force, Two Ways",
  instructions:
    "A force $F$ acts on the bracket at A. Find its moment about O. First choose the correct equation for each method — $M_O = Fd$, and Varignon's theorem $M_O = xF_y - yF_x$ — then find $M_O$. Stuck on the moment arm $d$? Press **Show how d is found** under the picture.",
  setup: {
    analysis: "moment",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0, 0.3], [0.55, 0.3]] }, // A can be anywhere along the top
    forces: [{ id: "F", symbol: "F", magnitude: 250, direction: { angle: 30, from: "-x", toward: "+y" }, at: [0.4, 0.3], pointLabel: "A" }],
    dims: [{ force: "F", offset: -0.1 }, { force: "F", axis: "y", offset: -0.12 }],
  },
  view: { xmin: -0.22, xmax: 0.78, ymin: -0.2, ymax: 0.65 },
  vary: [
    { path: "forces.0.magnitude", min: 150, max: 400, step: 10 },
    { path: "forces.0.direction.angle", min: 15, max: 65, step: 5 },
    { path: "forces.0.at.0", values: [0.3, 0.4, 0.5] },
  ],
  // A button under the picture shows how the moment arm d is found (never M_O, the answer).
  sceneOpts: { hideMoment: true },
  toggles: [{ key: "arms", label: "how d is found" }],
  solve: { steps: ["equations", "answer"], equationMode: "numeric" },
  ask: [{ quantity: "M" }],
  hints: [
    "Components first: $F_x = -F\\cos\\theta$ (it points left), $F_y = +F\\sin\\theta$.",
    "$M_O = xF_y - yF_x$, with $x$ and $y$ the coordinates of A. Watch the double minus on $-yF_x$.",
    "Then $d = |M_O| / F$. It is shorter than the distance OA, because the force is angled.",
  ],
  explanation:
    "Both methods give the same answer. The components method (Varignon's theorem) avoids finding $d$ directly; $M = Fd$ is quicker when $d$ is easy to see. " +
    "Here $F_y$ turns the bracket counterclockwise about O, and so does $F_x$ (it pushes left above O) — both terms add.",
};
