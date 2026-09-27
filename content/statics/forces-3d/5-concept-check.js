// Unit 2.3, stage 5 — concept check: forces in space.

export default {
  id: "forces-3d/5-concept-check",
  challenge: "concept-check",
  title: "Directions in Space",
  mission: "Show you understand how a force's direction is described in 3D.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A force has α = 60° and β = 60°. What can γ be?",
      options: [
        { text: "45° or 135°", correct: true },
        { text: "60°", feedback: "Then $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 0.75$, not 1. The three angles aren't free." },
        { text: "240°", feedback: "Direction angles are between 0° and 180° — measured from the positive axis, the short way round." },
        { text: "anything", feedback: "Two angles fix the third up to its sign: $\\cos^2\\gamma = 1 - \\cos^2\\alpha - \\cos^2\\beta$." },
      ],
      explanation: "$\\cos^2\\gamma = 1 - 0.25 - 0.25 = 0.5$, so $\\cos\\gamma = \\pm 0.707$: γ = 45° (pointing up) or 135° (pointing down).",
    },
    {
      prompt: "The position vector for a cable that pulls from A toward B is…",
      options: [
        { text: "$\\mathbf{r}_B - \\mathbf{r}_A$", correct: true },
        { text: "$\\mathbf{r}_A - \\mathbf{r}_B$", feedback: "That points from B to A — the wrong way: every component's sign flips." },
        { text: "$\\mathbf{r}_A + \\mathbf{r}_B$", feedback: "Adding positions doesn't give a direction between them. Subtract: END minus START." },
        { text: "$\\mathbf{r}_B$", feedback: "Only if A is at the origin. In general the line starts at A: subtract A's coordinates." },
      ],
      explanation: "From A to B: $\\mathbf{r}_{AB} = (x_B - x_A)\\,\\mathbf{i} + (y_B - y_A)\\,\\mathbf{j} + (z_B - z_A)\\,\\mathbf{k}$.",
    },
    {
      prompt: "Why do we divide $\\mathbf{r}_{AB}$ by its length before multiplying by the force F?",
      options: [
        { text: "to keep only its direction (a unit vector, length 1)", correct: true },
        { text: "to change metres into newtons", feedback: "Dividing does cancel the metres — but the point is that $\\mathbf{u}_{AB}$ has length 1, so $F\\,\\mathbf{u}_{AB}$ has size F." },
        { text: "we don't: $\\mathbf{F} = F\\,\\mathbf{r}_{AB}$", feedback: "Then the force would be as big as F times the cable's length." },
        { text: "to make the components positive", feedback: "Dividing by a length (positive) keeps every sign. Signs show the direction." },
      ],
      explanation: "$\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$ points along the cable with length 1, so $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$ has exactly size F.",
    },
    {
      prompt: "A force's component $F_x$ is negative. Its direction angle α is…",
      options: [
        { text: "more than 90°", correct: true },
        { text: "negative", feedback: "Direction angles are always between 0° and 180°: a negative component shows as an angle past 90°." },
        { text: "less than 90°", feedback: "$\\cos\\alpha = F_x/F < 0$ means α is past 90°." },
        { text: "exactly 180°", feedback: "Only if the force points straight along −x. Any negative $F_x$ gives 90° < α ≤ 180°." },
      ],
      explanation: "$\\cos\\alpha = F_x/F$: the sign of the component decides which side of 90° the angle is.",
    },
    {
      prompt: "A force has azimuth θ (in the x-y plane from +x) and elevation φ (up from the x-y plane). Its x component is…",
      options: [
        { text: "$F\\cos\\phi\\cos\\theta$", correct: true },
        { text: "$F\\cos\\theta$", feedback: "That splits the WHOLE force in the x-y plane. First take the part that lies in that plane: $F' = F\\cos\\phi$." },
        { text: "$F\\sin\\phi\\cos\\theta$", feedback: "$F\\sin\\phi$ is the part going up, along z. The part in the x-y plane is $F\\cos\\phi$." },
        { text: "$F\\cos\\phi\\sin\\theta$", feedback: "That's $F_y$: θ is measured from +x, so x gets the cosine." },
      ],
      explanation: "Two steps: $F' = F\\cos\\phi$ in the x-y plane (and $F_z = F\\sin\\phi$ up), then $F_x = F'\\cos\\theta$, $F_y = F'\\sin\\theta$.",
    },
  ],
};
