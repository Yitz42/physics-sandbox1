// Allowable stress, stage 1 — explore: simultaneous failure modes and factor of safety.

export default {
  id: "allowable-stress/1-explore",
  challenge: "explore",
  solver: "materials.allowableStress",
  title: "The Weakest Link",
  mission: "Explore how tension, pin shear, and plate bearing limits determine the safe allowable load.",
  instructions:
    "A structural connection can fail in three different ways under an axial load $P$:\n\n" +
    "1. **Rod Tension**: normal stress in the bar exceeds $\\sigma_{\\text{allow}}$ ($\\sigma = P / A_{\\text{rod}}$).\n" +
    "2. **Pin Shear**: shear stress across the pin planes exceeds $\\tau_{\\text{allow}}$ ($\\tau = V / A_{\\text{pin}}$).\n" +
    "3. **Plate Bearing**: contact pressure in the hole exceeds $\\sigma_{b,\\text{allow}}$ ($\\sigma_b = P / [t \\cdot d]$).\n\n" +
    "The connection fails as soon as its weakest component reaches its limit, so the **allowable load** is:\n\n" +
    "$$P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})$$\n\n" +
    "Adjust the sliders to see which failure mode governs and how the factor of safety $FS = P_{\\text{allow}} / P$ changes.",

  setup: {
    rod: { diameter: 20, allowableStress: 140 },
    joint: { planes: 2, pinDiameter: 16, plateThickness: 10, allowableShear: 80, allowableBearing: 160 },
    load: { P: 30 },
  },
  editable: [
    { path: "load.P", label: "Applied load P", min: 15, max: 70, step: 5, unit: "kN" },
    { path: "rod.diameter", label: "Rod diameter", min: 16, max: 32, step: 1, unit: "mm" },
    { path: "joint.pinDiameter", label: "Pin diameter", min: 12, max: 28, step: 1, unit: "mm" },
    { path: "joint.plateThickness", label: "Plate thickness", min: 8, max: 24, step: 1, unit: "mm" },
  ],
  tasks: [
    {
      text: "Thicken the plate to t ≥ 16 mm so bearing no longer governs the connection.",
      check: (v) => v.t_plate >= 16 && v.governing !== "bearing",
    },
    {
      text: "Adjust dimensions so that the overall allowable load P_allow exceeds 50 kN.",
      check: (v) => v.P_allow >= 50,
    },
    {
      text: "With applied load P = 45 kN, achieve a factor of safety FS ≥ 1.5.",
      check: (v) => v.P === 45 && v.FS >= 1.5,
    },
  ],
  hints: [
    "Look at the capacity bars on the right: the shortest bar governs the connection.",
    "If bearing governs, increasing plate thickness $t$ or pin diameter $d$ expands the contact area and raises bearing capacity.",
    "The factor of safety is $FS = P_{\\text{allow}} / P$. When $FS \\ge 1.0$, the joint is safe.",
  ],
  explanation:
    "A structural assembly is only as strong as its weakest component. " +
    "Calculating the capacities of all independent failure modes and selecting the minimum ensures that no part of the connection yields or shears. " +
    "Efficient design aims to balance these capacities so that no material is needlessly overdesigned.",
};
