// Unit 1, stage 2 — predict the components of an angled force.
// The angle is measured from the VERTICAL axis on purpose: it's where students
// most often swap sin and cos.

export default {
  id: "01-force-vectors/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "Components of an Angled Force",
  instructions:
    "The force $F$ on the bracket is shown in the picture, with its angle. Predict its components $F_x$ and $F_y$ — **including their signs** — then press **Test**.",
  setup: {
    analysis: "components",
    point: { at: [0, 0], label: "", object: "bracket" }, // the bracket is fixed on the side away from F
    forces: [{ id: "F", symbol: "F", magnitude: 400, direction: { angle: 30, from: "+y", toward: "-x" } }],
  },
  // "Try a new version" picks new numbers from these lists.
  vary: [
    { path: "forces.0.magnitude", min: 150, max: 600, step: 50 },
    { path: "forces.0.direction.angle", values: [20, 25, 30, 35, 40, 50, 55, 60, 65, 70] },
    { path: "forces.0.direction.from", values: ["+y", "-y"] },
    { path: "forces.0.direction.toward", values: ["+x", "-x"] },
  ],
  ask: [
    { quantity: "F.x" },
    { quantity: "F.y" },
  ],
  sceneOpts: { components: true },
  hints: [
    "Which axis is the angle measured from? The component along that axis uses $\\cos\\theta$.",
    "Here the angle is measured from the y-axis, so $F_y = \\pm F\\cos\\theta$ and $F_x = \\pm F\\sin\\theta$.",
    "Pick each sign by looking at the arrow: right or up is positive, left or down is negative.",
  ],
  explanation:
    "The angle is measured from the **y**-axis, so the y-component is the one \"next to\" the angle: $F_y = F\\cos\\theta$. " +
    "The x-component is \"opposite\" the angle: $F_x = F\\sin\\theta$. Then the signs come from the picture, not the formula.",
};
