// Unit 4.5, stage 5 — concept check: two-force and three-force members.

export default {
  id: "two-force-members/5-concept-check",
  challenge: "concept-check",
  title: "Two and Three Forces",
  mission: "Show you can use the two-force and three-force rules.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A straight bar is pinned at both ends and has **no load between them** (its weight is small). Its forces on the pins…",
      options: [
        { text: "lie along the line joining the two pins, equal and opposite", correct: true },
        { text: "can point any way, like a pin's", feedback: "With only two forces on it, the bar is in equilibrium only if they're equal, opposite AND on the same line — the line through the pins." },
        { text: "are always vertical", feedback: "Gravity isn't the point. The two forces must line up along the bar." },
        { text: "are perpendicular to the bar", feedback: "Perpendicular forces at the two ends would turn the bar. They must act along it." },
      ],
      explanation: "Two forces in equilibrium must be equal, opposite and collinear. For a two-force member that line is the line between its pins.",
    },
    {
      prompt: "A curved bracket is pinned at both ends, with nothing else on it. Which way does it push?",
      options: [
        { text: "Along the straight line between its two pins", correct: true },
        { text: "Along the curve, tangent at each end", feedback: "The shape doesn't matter — only where the two forces act. Their common line is the straight line through the pins." },
        { text: "It can't be a two-force member if it's curved", feedback: "Any body with forces at only two points is a two-force member, whatever its shape." },
        { text: "Straight down", feedback: "Its forces must line up with each other, through both pins." },
      ],
      explanation: "A two-force member can be any shape: its forces act along the straight line joining the two points where they're applied.",
    },
    {
      prompt: "A body is held by exactly **three** non-parallel forces. What must be true?",
      options: [
        { text: "Their lines of action all meet at one point", correct: true },
        { text: "They must be equal in size", feedback: "Their sizes depend on the angles. What must hold is that their lines meet." },
        { text: "Two of them must be perpendicular", feedback: "No angle is required. If two lines meet at O, the third must pass through O too." },
        { text: "Nothing — three forces can be arranged any way", feedback: "About the point where two of them meet, the third would have a moment unless it passes through it too." },
      ],
      explanation: "Take moments about the point where two of the forces meet: they have none, so the third must have none as well — its line passes through that point.",
    },
    {
      prompt: "A link from a wall **up** to a shelf's end hangs the shelf. The link is in…",
      options: [
        { text: "tension: it pulls the shelf toward the wall anchor", correct: true },
        { text: "compression: it pushes the shelf up", feedback: "A link from above holds the shelf up by pulling. A prop from below would push." },
        { text: "neither: two-force members carry no force", feedback: "They carry force — just only along themselves." },
        { text: "bending", feedback: "A two-force member only pulls or pushes along its line; it doesn't bend." },
      ],
      explanation: "A tie from above pulls (tension, positive); a prop from below pushes (compression, negative with tension-positive signs).",
    },
    {
      prompt: "A boom is pinned at A and held by a tie. You know the tie's line and the load's line. How can you find the **direction** of the pin force without solving?",
      options: [
        { text: "It points from A through the point where the other two lines meet", correct: true },
        { text: "It points along the boom", feedback: "Only if the other two lines meet on the boom. In general it points toward their meeting point." },
        { text: "It's always vertical", feedback: "The pin also has to balance the tie's sideways pull." },
        { text: "It can't be found without the equations", feedback: "The three-force rule gives it straight from the geometry." },
      ],
      explanation: "The boom is a three-force member, so the pin force's line must pass through the point where the load's line and the tie's line cross.",
    },
  ],
  explanation: "Two forces on a body: along the line through their points. Three: their lines meet at one point.",
};
