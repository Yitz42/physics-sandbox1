// Unit 4.7, stage 1 — explore: set the three components of a force at the end B of a bent pipe,
// and watch its moment vector about O = r × F. r = r_B = {0.4 i + 0.5 j} m, so
//   M_x = 0.5 F_z,  M_y = −0.4 F_z,  M_z = 0.4 F_y − 0.5 F_x.
// Start F = {100 i + 200 k} N → M = {100 i − 80 j − 50 k} N·m (no task done).
// Checks: M along +z — F_z = 0 and 0.4 F_y > 0.5 F_x (e.g. F = {0, 100, 0}); M = 0 with F ≠ 0 —
// F along r, e.g. {40, 50, 0} or {80, 100, 0}; M_z = 0 with M ≠ 0 — 0.4 F_y = 0.5 F_x, F_z ≠ 0.

const Mz0 = (v) => Math.abs(v["M.x"]) < 0.5 && Math.abs(v["M.y"]) < 0.5;

export default {
  id: "moments-3d/1-explore",
  challenge: "explore",
  solver: "statics.force3d",
  title: "Twist the Pipe",
  mission: "Push on the end of a bent pipe in 3D and watch its moment vector about O.",
  instructions:
    "A bent pipe is fixed to the wall at O. Set the three components of the force $\\mathbf{F}$ at its end B and watch the moment $\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{F}$: " +
    "the purple double-headed arrow at O. It points along the axis the force turns the pipe about (curl your right hand's fingers the way it turns; your thumb points along $\\mathbf{M}$).",
  setup: {
    analysis: "moment",
    about: "O",
    points: { O: [0, 0, 0], A: [0, 0.5, 0], B: [0.4, 0.5, 0] },
    body: ["O", "A", "B"],
    forces: [{ id: "F", symbol: "F", at: "B", dir: { components: [100, 0, 200] } }],
    showR: true,
    showMoment: "always",
    axisLength: 0.8,
    fullScale: 1200, // N to a whole axis: the force arrow grows and shrinks with the sliders
    reach: [300, 300, 300],
    view3d: { yaw: 30, pitch: 22 },
  },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "If $F$ pushed straight **up** (+z) at B, which way would its moment about O point?",
    options: [
      { text: "Level, at right angles to both r and F", correct: true },
      { text: "Straight up, along F", feedback: "$\\mathbf{r} \\times \\mathbf{F}$ is at right angles to BOTH r and F — never along the force." },
      { text: "Along the pipe, from O to B", feedback: "It's at right angles to r too: along the axis the push turns the pipe about." },
    ],
    explain: "$\\mathbf{r} \\times \\mathbf{F}$ is perpendicular to both: an upward push on B turns the pipe about a level axis.",
  },
  editable: [
    { path: "forces.0.dir.components.0", label: "F: x component", min: -300, max: 300, step: 10, unit: "N" },
    { path: "forces.0.dir.components.1", label: "F: y component", min: -300, max: 300, step: 10, unit: "N" },
    { path: "forces.0.dir.components.2", label: "F: z component", min: -300, max: 300, step: 10, unit: "N" },
    { path: "view3d.yaw", label: "Turn the view", min: 0, max: 90, step: 5, unit: "deg" },
  ],
  tasks: [
    { text: "Make $\\mathbf{M}_O$ point straight **up** (+z): a pure twist about the vertical.", check: (v) => Mz0(v) && v["M.z"] > 1 },
    { text: "Make $\\mathbf{M}_O = 0$ while $F$ is not zero. Where must F point?", check: (v) => v.M < 0.5 && v.F > 1 },
    { text: "Make $M_z = 0$ but $\\mathbf{M}_O$ not zero.", check: (v) => Math.abs(v["M.z"]) < 0.5 && v.M > 1 },
  ],
  hints: [
    "$M_x = 0.5F_z$ and $M_y = -0.4F_z$: any up-or-down push bends the pipe about a level axis.",
    "A force whose line passes through O has no moment about O: point F along r, from O through B.",
    "$M_z = 0.4F_y - 0.5F_x$: make those two equal.",
  ],
  explanation:
    "The moment vector is at right angles to both $\\mathbf{r}$ and $\\mathbf{F}$, along the axis of turning. A push whose line passes through O has no moment at all, " +
    "and each component of $\\mathbf{M}$ tells how hard the force turns the pipe about that axis: $M_z$ twists it about the vertical, $M_x$ and $M_y$ bend it.",
};
