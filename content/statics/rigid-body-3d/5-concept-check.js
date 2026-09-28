// Unit 5.6, stage 5 — concept check: supports and equations in 3D.

export default {
  id: "rigid-body-3d/5-concept-check",
  challenge: "concept-check",
  title: "Supports in Space",
  mission: "Show you understand 3D supports and the six equations.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A ball-and-socket joint gives…",
      options: [
        { text: "three force components, and no moments", correct: true },
        { text: "three forces and three moments", feedback: "That's a fixed support. A ball-and-socket lets the body turn freely every way, so it can't resist a moment." },
        { text: "two forces", feedback: "It stops sliding in ALL three directions: three forces." },
        { text: "one force, along the body", feedback: "That's a cable or a two-force link." },
      ],
      explanation: "It stops every slide (three forces) and no turn (no moments).",
    },
    {
      prompt: "A single journal bearing on a shaft along y (used with other bearings) gives…",
      options: [
        { text: "two forces, across the shaft (x and z)", correct: true },
        { text: "three forces", feedback: "A journal bearing lets the shaft slide along its own axis: no force along y. (A thrust bearing adds that one.)" },
        { text: "one force", feedback: "It stops the shaft moving sideways in both directions across it: two forces." },
        { text: "a force along y", feedback: "Along its axis the shaft slides freely in a journal bearing." },
      ],
      explanation: "Across the shaft it's held both ways; along the shaft, and turning about it, it's free.",
    },
    {
      prompt: "How many independent equilibrium equations does a rigid body in 3D have?",
      options: [
        { text: "six", correct: true },
        { text: "three", feedback: "Three is for a particle in 3D (or a body in 2D). A body can also TURN about three axes: three more." },
        { text: "four", feedback: "Three force sums, plus three moment sums — one about each axis." },
        { text: "as many as there are forces", feedback: "The equations come from the ways the body can move: three slides and three turns." },
      ],
      explanation: "$\\Sigma F_x = \\Sigma F_y = \\Sigma F_z = 0$ and $\\Sigma M_x = \\Sigma M_y = \\Sigma M_z = 0$.",
    },
    {
      prompt: "Why take moments about an axis through a hinge (or two bearings)?",
      options: [
        { text: "every reaction there passes through it, so it drops out of the equation", correct: true },
        { text: "moments must always be taken about a support", feedback: "Any axis works in equilibrium. Through the supports is just the smart choice: fewer unknowns." },
        { text: "the hinge has no moment of its own", feedback: "True for a hinge, but the point is its FORCES have no moment about an axis through them." },
        { text: "it makes the forces smaller", feedback: "The forces are what they are; the choice only changes which ones appear in the equation." },
      ],
      explanation: "A force that crosses (or is parallel to) an axis has no moment about it — pick axes that leave one unknown.",
    },
    {
      prompt: "A force parallel to the z axis acts at (2, 3, 0) m. Its moment arm about the x axis is…",
      options: [
        { text: "3 m (its y distance)", correct: true },
        { text: "2 m (its x distance)", feedback: "That's the distance ALONG the x axis — it doesn't turn anything about x. The arm is square to both the axis and the force: along y." },
        { text: "√13 m", feedback: "That's its distance from the origin, not from the x axis measured square to the force." },
        { text: "0 — it's parallel to the axis", feedback: "It's parallel to z, not to x. A force only has no moment about an axis it's parallel to or crosses." },
      ],
      explanation: "$(\\mathbf{r} \\times \\mathbf{F})_x = y F_z - z F_y = 3F$: the arm is its y coordinate.",
    },
  ],
};
