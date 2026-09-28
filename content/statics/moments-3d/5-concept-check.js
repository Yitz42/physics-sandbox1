// Unit 4.7, stage 5 — concept check: the moment as a vector.

export default {
  id: "moments-3d/5-concept-check",
  challenge: "concept-check",
  title: "Moments as Vectors",
  mission: "Show you understand what the moment vector r × F means.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "The moment vector $\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{F}$ points…",
      options: [
        { text: "at right angles to both r and F, along the axis of turning", correct: true },
        { text: "along F", feedback: "A cross product is perpendicular to BOTH vectors in it — never along either." },
        { text: "along r", feedback: "It's perpendicular to r as well as to F." },
        { text: "wherever the body moves", feedback: "It shows the AXIS of turning (right-hand rule), not a direction of motion." },
      ],
      explanation: "Curl your right hand's fingers the way the force turns the body: your thumb points along $\\mathbf{M}_O$.",
    },
    {
      prompt: "A rope pulls from B toward C. For its moment about O, which r can you use?",
      options: [
        { text: "From O to B, or from O to C — any point on the rope's line", correct: true },
        { text: "Only from O to B", feedback: "Any point on the line of action gives the same moment: moving r along F adds a part parallel to F, and $\\mathbf{F} \\times \\mathbf{F} = 0$." },
        { text: "From B to C", feedback: "That's the rope's own direction. r must start at the moment point O." },
        { text: "From B to O", feedback: "Backwards: r goes FROM the moment point TO the force's line. This flips every sign." },
      ],
      explanation: "$\\mathbf{r}$ runs from the moment point to ANY point on the force's line of action — choose the one with the easiest coordinates.",
    },
    {
      prompt: "A force's line of action passes right through O. Its moment about O is…",
      options: [
        { text: "zero", correct: true },
        { text: "rF", feedback: "Here r can be taken along F itself, so $\\mathbf{r} \\times \\mathbf{F} = 0$." },
        { text: "the same as about any other point", feedback: "A force's moment depends on the point. Only a COUPLE's moment is the same about every point." },
      ],
      explanation: "A force pointing through a point can't turn anything about it: no moment arm.",
    },
    {
      prompt: "How is $\\mathbf{F} \\times \\mathbf{r}$ related to $\\mathbf{r} \\times \\mathbf{F}$?",
      options: [
        { text: "It's the same size, pointing the opposite way", correct: true },
        { text: "It's the same", feedback: "Cross products change sign when you swap them: $\\mathbf{F} \\times \\mathbf{r} = -\\,\\mathbf{r} \\times \\mathbf{F}$." },
        { text: "It's zero", feedback: "Only a vector crossed with itself (or a parallel one) gives zero." },
      ],
      explanation: "The order matters: the moment is $\\mathbf{r} \\times \\mathbf{F}$, r first.",
    },
    {
      prompt: "$\\mathbf{r} = \\{0.4\\,\\mathbf{i}\\}$ m and $\\mathbf{F} = \\{100\\,\\mathbf{j}\\}$ N. What is $\\mathbf{M}_O$?",
      options: [
        { text: "$\\{40\\,\\mathbf{k}\\}$ N·m", correct: true },
        { text: "$\\{-40\\,\\mathbf{k}\\}$ N·m", feedback: "$\\mathbf{i} \\times \\mathbf{j} = +\\mathbf{k}$: a push along +y at a point on +x turns counterclockwise seen from above." },
        { text: "$\\{40\\,\\mathbf{i}\\}$ N·m", feedback: "The moment is perpendicular to both r (along x) and F (along y): along z." },
        { text: "40 N·m, with no direction", feedback: "In 3D a moment is a vector: its direction is the axis of turning." },
      ],
      explanation: "$M_z = r_x F_y - r_y F_x = (0.4)(100) = 40$ N·m, the other parts zero.",
    },
    {
      prompt: "$r$ = 0.5 m and $F$ = 200 N. The moment's size is 100 N·m…",
      options: [
        { text: "only if r and F are at right angles", correct: true },
        { text: "always", feedback: "$M = rF\\sin\\theta$: it's $rF$ only when θ = 90°." },
        { text: "never", feedback: "It is, when r and F are at right angles ($\\sin 90^\\circ = 1$)." },
      ],
      explanation: "$|\\mathbf{r} \\times \\mathbf{F}| = rF\\sin\\theta$ — the same as force × perpendicular distance from 2D.",
    },
  ],
};
