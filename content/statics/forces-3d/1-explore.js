// Unit 2.3, stage 1 — explore: set a force's three components and watch its size and
// direction angles; turn the picture round.
// Start: {200 i + 300 j + 400 k} N → F = 538.5 N, α = 68.2°, β = 56.1°, γ = 42.0° (no task done).
// Checks: along +y only; γ = 60° (e.g. {0 i + 520 j + 300 k}: 60.02°); all angles equal (F_x = F_y = F_z > 0:
// 54.7°); pointing below the x-y plane (F_z < 0).

const angles = (v) => [v["F.alpha"], v["F.beta"], v["F.gamma"]];

export default {
  id: "forces-3d/1-explore",
  challenge: "explore",
  solver: "statics.force3d",
  title: "A Force in Space",
  mission: "Set a force's three components and watch its size and direction angles.",
  instructions:
    "A force $\\mathbf{F}$ acts at O. Set its three components with the sliders — the dashed box shows them in the picture — and watch its size $F$ and its direction angles " +
    "α, β and γ, each measured from its own positive axis. Turn the picture with the last slider to see it from another side.",
  setup: {
    forces: [{ id: "F", symbol: "F", dir: { components: [200, 300, 400] } }],
    showComponents: "always",
    showAngles: { alpha: "given", beta: "given", gamma: "given" },
    axisLength: 3,
    fullScale: 1100, // N to a whole axis: the arrow grows and shrinks with the sliders
    reach: [600, 600, 600], // the sliders' limits: the picture keeps room for all of them
    view3d: { yaw: 30, pitch: 22 },
  },
  editable: [
    { path: "forces.0.dir.components.0", label: "x component", min: -600, max: 600, step: 10, unit: "N" },
    { path: "forces.0.dir.components.1", label: "y component", min: -600, max: 600, step: 10, unit: "N" },
    { path: "forces.0.dir.components.2", label: "z component", min: -600, max: 600, step: 10, unit: "N" },
    { path: "view3d.yaw", label: "Turn the view", min: 0, max: 90, step: 5, unit: "deg" },
  ],
  tasks: [
    { text: "Make the force point straight along **+y** (α = γ = 90°).", check: (v, s) => { const [x, y, z] = s.forces[0].dir.components; return x === 0 && z === 0 && y > 0; } },
    { text: "Make **γ = 60°** (to ±0.5°), with the force not in the y-z plane.", check: (v, s) => Math.abs(v["F.gamma"] - 60) < 0.5 && s.forces[0].dir.components[0] !== 0 },
    { text: "Make all three direction angles **equal**.", check: (v) => { const a = angles(v); return Math.max(...a) - Math.min(...a) < 0.01 && a[0] < 90; } },
    { text: "Point the force **below** the x-y plane. What happens to γ?", check: (v) => v["F.gamma"] > 90 + 1e-6 },
  ],
  hints: [
    "Each direction angle comes from its own component: $\\cos\\alpha = F_x/F$, $\\cos\\beta = F_y/F$, $\\cos\\gamma = F_z/F$.",
    "For γ = 60°, $F_z$ must be half of F: for example $F_z = 300$ N with $F = 600$ N.",
    "Equal angles need equal components — then $\\cos\\alpha = 1/\\sqrt{3}$, whatever their size.",
  ],
  explanation:
    "The size is Pythagoras in 3D, $F = \\sqrt{F_x^2 + F_y^2 + F_z^2}$, and each direction angle comes from its own component. " +
    "Because $\\cos\\alpha$, $\\cos\\beta$, $\\cos\\gamma$ are the parts of a unit vector, $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$: only two of the angles are free. " +
    "A negative component makes its angle bigger than 90°.",
};
