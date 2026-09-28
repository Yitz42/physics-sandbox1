// Allowable stress, stage 1 — explore: simultaneous failure modes and factor of safety.

export default {
  id: "allowable-stress/1-explore",
  challenge: "explore",
  solver: "materials.allowableStress",
  title: "The Weakest Link",
  mission: "Explore how tension, pin shear, and plate bearing limits determine the safe allowable load.",
  instructions:
    "A connection can fail three ways: the **rod** can break in tension, the **pin** can shear, or the **plate** can crush around the hole (bearing). " +
    "It fails as soon as its weakest part reaches its limit, so the allowable load is the smallest of the three: " +
    "$P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})$. " +
    "Change the sizes and the load, and watch which part governs.",

  setup: {
    rod: { diameter: 20, allowableStress: 140 },
    joint: { planes: 2, pinDiameter: 16, plateThickness: 10, allowableShear: 80, allowableBearing: 160 },
    load: { P: 30 },
  },
  // Predict first (as in statics, owner 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**The rod could carry 60 kN, the pin 40 kN and the plate 45 kN. The whole connection can safely carry…**",
    options: [
      { text: "40 kN — the weakest part", correct: true },
      { text: "60 kN — the strongest part", feedback: "Load it past 40 kN and the pin shears off, however strong the rod is." },
      { text: "about 48 kN — the average", feedback: "Parts don't share out their strength: the first one to reach its limit fails." },
    ],
    explain: "A connection fails at its weakest part: $P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})$.",
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
    "Each part's limit is its allowable stress times its area: the pin's shear and the plate's bearing limits are written by their sections on the right. The smallest governs.",
    "If bearing governs, increasing plate thickness $t$ or pin diameter $d$ expands the contact area and raises bearing capacity.",
    "The factor of safety is $FS = P_{\\text{allow}} / P$. When $FS \\ge 1.0$, the joint is safe.",
  ],
  explanation:
    "A structural assembly is only as strong as its weakest component. " +
    "Calculating the capacities of all independent failure modes and selecting the minimum ensures that no part of the connection yields or shears. " +
    "Efficient design aims to balance these capacities so that no material is needlessly overdesigned.",
};
