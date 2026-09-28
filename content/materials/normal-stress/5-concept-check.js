// Normal stress, stage 5 — concept check: intuition for stress, area scaling, and load types.

export default {
  id: "normal-stress/5-concept-check",
  challenge: "concept-check",
  solver: "materials.axialStress",
  title: "Understanding Normal Stress",
  mission: "Answer questions testing your intuition for normal stress, bar size, and load types.",
  instructions:
    "Test your understanding of the concepts behind normal stress $\\sigma = P / A$. " +
    "Think about how cross-sectional geometry, loading direction, and member dimensions affect the internal stress.",
  required: 3,
  questions: [
    {
      prompt: "If you double the diameter $d$ of a circular bar carrying the same axial load $P$, what happens to the normal stress $\\sigma$?",
      options: [
        { text: "It decreases to 1/4 of its original value.", correct: true },
        { text: "It decreases to 1/2 of its original value.", feedback: "Remember that area depends on diameter SQUARED: $A = \\frac{\\pi}{4} d^2$. Doubling diameter quadruples area." },
        { text: "It doubles, because the bar is twice as thick.", feedback: "A thicker bar spreads the load over MORE area, so stress decreases, not increases." },
        { text: "It stays the same, because load $P$ did not change.", feedback: "Stress is force per unit area: $\\sigma = P / A$. Changing the area directly changes the stress." },
      ],
      explanation: "Since $A = \\frac{\\pi}{4} d^2$, doubling the diameter ($2d$) multiplies the area by $2^2 = 4$. With 4 times the area sharing the same load, the normal stress drops to $\\frac{1}{4}$ of its initial value.",
    },
    {
      prompt: "Does the average normal stress $\\sigma = P / A$ in a uniform axial bar depend on the bar's length $L$?",
      options: [
        { text: "No, stress depends only on internal force P and cross-sectional area A.", correct: true },
        { text: "Yes, longer bars have higher stress because there is more material to stretch.", feedback: "The force $P$ is transmitted through every cross-section equally. Length affects elongation $\\delta = \\frac{PL}{AE}$, but not stress." },
        { text: "Yes, longer bars have lower stress because the load spreads out over more length.", feedback: "Normal stress acts ACROSS the cross-sectional area, not along the length." },
      ],
      explanation: "Normal stress is an internal intensity of force across a cut cross-section: $\\sigma = P / A$. A 1-metre bar and a 10-metre bar of the same cross-section carrying the same load have identical stress. (Total stretch $\\delta = \\frac{PL}{AE}$ does depend on length, but stress $\\sigma$ does not!)",
    },
    {
      prompt: "Why do engineers design structures based on allowable **stress** $\\sigma$ rather than just the maximum allowable **force** $P$?",
      options: [
        { text: "Because stress measures force intensity; a small force can break a thin wire, while a huge force is easily held by a thick rod.", correct: true },
        { text: "Because forces cannot be measured directly in structures.", feedback: "Forces can easily be measured with load cells and calculated with statics equations." },
        { text: "Because allowable stress is the same for all materials.", feedback: "Different materials have wildly different allowable stresses (e.g. steel $\\approx 250\\,\\text{MPa}$, concrete in tension $\\approx 3\\,\\text{MPa}$)." },
      ],
      explanation: "Material strength limits (yield and fracture) are intrinsic material properties measured in stress (force per area, MPa). A force of $10\\,\\text{kN}$ will snap a sewing thread instantly, but won't even tickle a suspension bridge cable.",
    },
    {
      prompt: "When an axial bar is in **compression**, what happens to the internal force and normal stress?",
      options: [
        { text: "The internal force pushes into the cut surface, and normal stress is negative (σ < 0).", correct: true },
        { text: "The internal force pulls away from the cut surface, and normal stress is positive (σ > 0).", feedback: "Pulling away from the cut surface is the definition of tension, not compression." },
        { text: "There is no normal stress in compression, only shear stress.", feedback: "Axial compression creates direct normal stress perpendicular to the cross-section." },
      ],
      explanation: "By universal mechanics convention, tensile loads pull away from the body causing positive normal stress ($\\sigma > 0$), while compressive loads push into the body causing negative normal stress ($\\sigma < 0$).",
    },
  ],
  hints: [
    "Recall that circle area is proportional to the square of diameter: $A \\propto d^2$.",
    "Look at the formula $\\sigma = P / A$: check which variables are present, and which are absent.",
    "Tension pulls and stretches (+); compression pushes and squashes (−).",
  ],
  explanation:
    "Mastering the concept of stress means understanding how geometry and material properties interact. " +
    "Stress $\\sigma = P / A$ tells us how hard the material is working, regardless of overall member length.",
};
