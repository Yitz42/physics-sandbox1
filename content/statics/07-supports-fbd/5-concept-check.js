// Unit 7, stage 5 — concept check: what each support does, and what goes on an FBD.

export default {
  id: "07-supports-fbd/5-concept-check",
  challenge: "concept-check",
  title: "Which Reactions?",
  mission: "Show you know which reactions each kind of support gives.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A beam is held by a **pin** at A. Which reactions does the pin give?",
      options: [
        { text: "Two force components, $A_x$ and $A_y$", correct: true },
        { text: "One force, $A_y$", feedback: "That's a roller. A pin also stops the beam sliding sideways, so it gives $A_x$ too." },
        { text: "$A_x$, $A_y$ and a moment $M_A$", feedback: "That's a fixed support. A pin lets the beam turn, so it can't resist a moment." },
        { text: "A moment only", feedback: "A pin's whole job is to stop the point sliding — in both x and y. It's turning that it allows." },
      ],
      explanation: "A pin stops sliding in x and in y but lets the body turn: two unknowns, $A_x$ and $A_y$.",
    },
    {
      prompt: "A beam rests on a **roller** on level ground at B. Which reaction does it give?",
      options: [
        { text: "One force, perpendicular to the ground", correct: true },
        { text: "A vertical and a horizontal force", feedback: "The roller just rolls sideways, so it can't push sideways. It only stops the beam moving into the ground." },
        { text: "One force along the ground", feedback: "Along the ground is exactly the way a roller lets it move. Its push is perpendicular to the ground." },
        { text: "A force and a moment", feedback: "A roller lets the beam turn and roll; it only stops motion into the surface." },
      ],
      explanation: "A roller stops only motion into its surface, so it pushes perpendicular to the surface: one unknown.",
    },
    {
      prompt: "A **cable** is tied to the end of a beam. What can it do to the beam?",
      options: [
        { text: "Pull along the cable, toward where it's anchored", correct: true },
        { text: "Push or pull along the cable", feedback: "A cable goes slack if you push on it. It can only pull." },
        { text: "Pull in any direction", feedback: "A cable pulls along its own length only — the direction is fixed by the cable." },
        { text: "Pull, and resist turning", feedback: "A cable can't resist turning; it gives one force along itself." },
      ],
      explanation: "A cable gives one unknown, its tension, always pulling away from the body along the cable.",
    },
    {
      prompt: "Why does a **fixed** support (a beam built into a wall) give a moment $M_A$, when a pin doesn't?",
      options: [
        { text: "It stops the beam turning; a pin lets it turn", correct: true },
        { text: "It's stronger than a pin", feedback: "Strength isn't the point: reactions come from which motions a support stops. A fixed support stops turning." },
        { text: "The wall is bigger", feedback: "Size doesn't matter. A moment appears because the support stops rotation." },
        { text: "It carries the weight of the beam", feedback: "A pin carries weight too (through $A_y$). The moment is there because a fixed support also stops turning." },
      ],
      explanation: "A support gives a reaction for each motion it prevents. Preventing rotation takes a moment, $M_A$.",
    },
    {
      prompt: "A crate rests against a **smooth** wall. Which way does the wall push on it?",
      options: [
        { text: "Perpendicular to the wall, pushing the crate away from it", correct: true },
        { text: "Along the wall, holding the crate up", feedback: "A smooth wall has no friction, so it can't push along itself. Only perpendicular to it." },
        { text: "Toward the wall, pulling the crate", feedback: "A surface can only push. It pushes the crate away from the wall." },
        { text: "Straight down", feedback: "The wall's push is perpendicular to its surface; gravity is what pulls down." },
      ],
      explanation: "A smooth surface pushes perpendicular to itself (a normal force $N$), never pulls, and has no friction along it.",
    },
    {
      prompt: "Which of these does NOT belong on a beam's free-body diagram?",
      options: [
        { text: "The pin and roller themselves", correct: true },
        { text: "The beam's weight", feedback: "The weight acts on the beam, so it belongs — at the centre of gravity." },
        { text: "The reactions $A_x$, $A_y$ and $B_y$", feedback: "These are the forces the supports exert on the beam — they're the reason to draw an FBD." },
        { text: "The loads on the beam", feedback: "Every load acting on the beam belongs on its FBD." },
      ],
      explanation: "An FBD isolates the body: the supports are removed and replaced by the forces they exert on it.",
    },
    {
      prompt: "A beam has a fixed support at A and a roller at B. How many unknown reactions, and what does that mean?",
      options: [
        { text: "4 — more than the 3 equations, so it's statically indeterminate", correct: true },
        { text: "3 — just right to solve", feedback: "Fixed gives 3 ($A_x$, $A_y$, $M_A$) and the roller 1: that's 4." },
        { text: "2 — it's unstable", feedback: "A fixed support alone gives 3. Adding the roller makes 4." },
        { text: "5 — it's very stable", feedback: "Fixed 3 + roller 1 = 4. More unknowns than equations means the equations alone can't find them." },
      ],
      explanation: "Fixed (3) + roller (1) = 4 unknowns, but only 3 equations: the beam is held, but statically indeterminate.",
    },
  ],
  hints: ["A support gives one reaction for every motion it stops: sliding in x, sliding in y, turning."],
  explanation: "Each support type stops certain motions, and gives exactly one reaction for each: roller, smooth surface and cable 1; pin 2; fixed support 3.",
};
