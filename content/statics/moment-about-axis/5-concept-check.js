// Unit 4.8, stage 5 — concept check: the moment about an axis.

export default {
  id: "moment-about-axis/5-concept-check",
  challenge: "concept-check",
  title: "Turning About a Line",
  mission: "Show you understand what turns a body about an axis — and what can't.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A force acts **parallel** to a door's hinge line. Its moment about the hinges is…",
      options: [
        { text: "zero", correct: true },
        { text: "Fd, with d its distance from the hinges", feedback: "$\\mathbf{r} \\times \\mathbf{F}$ is then at right angles to the hinges, so its part along them is zero." },
        { text: "the same as its moment about the bottom hinge", feedback: "That's a vector; about the hinge LINE only its part along the line counts — here none." },
      ],
      explanation: "A force parallel to an axis can't turn anything about it — like pushing a door straight up.",
    },
    {
      prompt: "$M_a = \\mathbf{u}_a \\cdot (\\mathbf{r} \\times \\mathbf{F})$. Where must $\\mathbf{r}$ start?",
      options: [
        { text: "At any point on the axis", correct: true },
        { text: "Only at the axis's first point", feedback: "Any point on the axis gives the same $M_a$: moving along the axis changes $\\mathbf{M}_O$ only in ways at right angles to the axis." },
        { text: "At the origin, always", feedback: "Only if the origin is on the axis. r must start ON the axis." },
      ],
      explanation: "Choose the point on the axis that makes r simplest.",
    },
    {
      prompt: "Why use the UNIT vector $\\mathbf{u}_a$ and not just any vector along the axis?",
      options: [
        { text: "So the dot product gives the moment's part along the axis, not that times a length", correct: true },
        { text: "To make $M_a$ positive", feedback: "Dividing by a length keeps the sign. The sign tells the turning direction." },
        { text: "It doesn't matter", feedback: "A vector of length 2 m would double the answer — and give it wrong units." },
      ],
      explanation: "$\\mathbf{u}_a \\cdot \\mathbf{M}_O$ is the projection of $\\mathbf{M}_O$ on the axis only when $\\mathbf{u}_a$ has length 1.",
    },
    {
      prompt: "The moment about an axis, $M_a$, is…",
      options: [
        { text: "a number (with a sign) — the vector $M_a\\,\\mathbf{u}_a$ points along the axis", correct: true },
        { text: "always the size of $\\mathbf{M}_O$", feedback: "Only when $\\mathbf{M}_O$ happens to lie along the axis." },
        { text: "always positive", feedback: "Negative means it turns the body the other way about $\\mathbf{u}_a$." },
      ],
      explanation: "$M_a$ is a dot product: a signed number. + is the right-hand turn about $\\mathbf{u}_a$ (thumb along it).",
    },
    {
      prompt: "You push a door with 100 N, straight across it, 0.8 m from the hinges. $M_a$ = ?",
      options: [
        { text: "80 N·m", correct: true },
        { text: "100 N·m", feedback: "The moment arm is the handle's distance from the hinges: $M_a$ = 100 × 0.8." },
        { text: "0", feedback: "A push across the door, off the hinges, turns it: that's how doors open." },
      ],
      explanation: "Straight across the door and at right angles to the hinges, $M_a = Fd$ — the 2D moment from Chapter 4.",
    },
  ],
};
