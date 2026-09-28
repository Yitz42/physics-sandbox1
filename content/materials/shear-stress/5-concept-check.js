// Direct shear, stage 5 — concept check: intuition for shear planes, stress direction, and diameter scaling.

export default {
  id: "shear-stress/5-concept-check",
  challenge: "concept-check",
  solver: "materials.shearStress",
  title: "Understanding Direct Shear",
  mission: "Answer questions testing your intuition for shear planes, stress orientation, and joint design.",
  instructions:
    "Test your understanding of the concepts behind direct shear stress $\\tau = V / A$. " +
    "Think about the orientation of the cutting plane, single vs double shear, and how pin diameter governs resistance.",
  required: 3,
  questions: [
    {
      prompt: "How does the direction of **shear stress** $\\tau$ differ from **normal stress** $\\sigma$ relative to a cut cross-section?",
      options: [
        { text: "Shear stress acts parallel (tangent) to the cut plane, while normal stress acts perpendicular to it.", correct: true },
        { text: "Shear stress acts perpendicular to the cut plane, while normal stress acts parallel to it.", feedback: "Normal means perpendicular in geometry. Normal stress is perpendicular; shear stress slides along the surface." },
        { text: "Both shear stress and normal stress act in the exact same direction.", feedback: "They are perpendicular to each other: normal is $\\perp$ to the face, shear is $\\parallel$ to the face." },
        { text: "Shear stress only exists in circular rods, while normal stress only exists in flat plates.", feedback: "Both stress types can occur in any shape of cross-section." },
      ],
      explanation: "By definition, normal stress $\\sigma$ acts perpendicular (normal) to the cross-sectional area, trying to pull apart or push together. Shear stress $\\tau$ acts parallel (tangential) to the surface, trying to slide one side past the other.",
    },
    {
      prompt: "Why is a **double-shear** clevis connection structurally superior to a **single-shear** lap joint carrying the same load $P$?",
      options: [
        { text: "The load is shared between two shear planes ($V = P / 2$), halving the shear stress for the same pin size.", correct: true },
        { text: "Double shear completely eliminates shear stress from the pin.", feedback: "Double shear halves the shear stress, but does not eliminate it." },
        { text: "Double shear doubles the shear force on each cross-section.", feedback: "Double shear divides the shear force by 2, not multiplies by 2." },
      ],
      explanation: "In double shear, the applied load $P$ is divided between two cross-sections ($V = P / 2$). For the same pin diameter, the shear stress $\\tau = V / A$ is cut in half, or a pin with half the cross-sectional area can be used.",
    },
    {
      prompt: "If you double the diameter $d$ of a connecting pin while keeping the load $P$ constant, what happens to the shear stress $\\tau$?",
      options: [
        { text: "It decreases to 1/4 of its original value.", correct: true },
        { text: "It decreases to 1/2 of its original value.", feedback: "Remember that circular cross-sectional area depends on diameter SQUARED: $A = \\frac{\\pi}{4} d^2$." },
        { text: "It doubles, because the pin has twice the diameter.", feedback: "A larger pin increases the area resisting the cut, which decreases the stress." },
      ],
      explanation: "Because the pin is a cylinder, its shear area is $A = \\frac{\\pi}{4} d^2$. Doubling the diameter quadruples the area ($2^2 = 4$). Since $\\tau = V / A$, the shear stress drops to $\\frac{1}{4}$ of its initial value.",
    },
    {
      prompt: "What physical failure occurs when a bolted connection fails in **direct shear**?",
      options: [
        { text: "The bolt is cleanly sliced across its cylindrical shank at the plane between the plates.", correct: true },
        { text: "The bolt stretches longitudinally until it snaps in tension.", feedback: "Longitudinal stretching is tensile failure, not shear failure." },
        { text: "The plate crushes into a powder beneath the bolt head.", feedback: "Crushing of plate material is bearing failure, not bolt shear." },
      ],
      explanation: "In direct shear, the two overlapping plates slide in opposite directions, acting like scissor blades that slice through the bolt shank along the plane where the plates meet.",
    },
  ],
  hints: [
    "Remember: 'normal' = perpendicular; 'shear' = sliding parallel.",
    "Single shear has $n = 1$; double shear has $n = 2$.",
    "Area of a circle is proportional to diameter squared ($A \\propto d^2$).",
  ],
  explanation:
    "Direct shear governs the strength of fasteners, pins, rivets, and welded lap joints. " +
    "Understanding the number of shear planes and the distinction between parallel shear and perpendicular normal stress is essential for connection design.",
};
