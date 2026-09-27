// Unit 5.4, stage 5 — concept check: taking frames apart.

export default {
  id: "frames/5-concept-check",
  challenge: "concept-check",
  title: "Equal and Opposite",
  mission: "Show you know how to take a frame apart correctly.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Two bodies share a pin C. On body 1's FBD the pin pushes with $C_x$ to the right. On body 2's FBD it pushes…",
      options: [
        { text: "with $C_x$ to the left — equal and opposite", correct: true },
        { text: "with $C_x$ to the right, the same as on body 1", feedback: "The two bodies push on each other: by Newton's third law, the forces are equal and OPPOSITE." },
        { text: "with half of $C_x$", feedback: "The whole force acts on each body, in opposite directions — nothing is split." },
        { text: "not at all: a pin only acts on one body", feedback: "The pin joins both bodies, and acts on both — equally and oppositely." },
      ],
      explanation: "Action and reaction: whatever the pin does to one body, it does the reverse to the other.",
    },
    {
      prompt: "What makes a frame different from a truss?",
      options: [
        { text: "At least one member is loaded at more than two points (a multi-force member)", correct: true },
        { text: "A frame has no pins", feedback: "Frames are pinned together too. The difference: some of their members carry loads at more than two points, so they bend." },
        { text: "A frame is always made of wood", feedback: "The material doesn't matter. It's about the members: in a frame, some are multi-force members." },
        { text: "A truss can't carry loads", feedback: "Trusses carry loads — at their joints, so every member is a two-force member. A frame has multi-force members." },
      ],
      explanation: "In a truss every member is a two-force member. A frame has at least one multi-force member, so it must be taken apart body by body.",
    },
    {
      prompt: "A bar in a frame is pinned at both ends and nothing else touches it. Its force on each pin is…",
      options: [
        { text: "along the bar — it's a two-force member", correct: true },
        { text: "vertical, like its weight", feedback: "With forces at only two points, they must be equal, opposite and along the line between them: along the bar." },
        { text: "two unknown components at each end", feedback: "You could, but it's a two-force member: ONE unknown force along the bar is enough. Spotting that saves equations." },
        { text: "zero", feedback: "It may carry plenty — but only along its own line." },
      ],
      explanation: "A two-force member carries one force along its line (tension or compression): one unknown instead of four.",
    },
    {
      prompt: "A frame of 2 bodies has 5 unknown forces (reactions, pin forces, links). It is…",
      options: [
        { text: "a mechanism: 5 unknowns but 2 × 3 = 6 equations", correct: true },
        { text: "determinate: 5 < 6 is fine", feedback: "Fewer unknowns than equations means the supports and pins can't hold every motion: it moves." },
        { text: "indeterminate", feedback: "Indeterminate is MORE unknowns than equations. Here there are fewer: it's a mechanism." },
        { text: "impossible to tell", feedback: "Count: each body gives 3 equations, so 2 bodies give 6. With 5 unknowns, something can move." },
      ],
      explanation: "Count unknowns against 3 equations per body. Fewer unknowns: it moves (a mechanism). More: indeterminate.",
    },
    {
      prompt: "A load sits exactly on the pin joining two bodies. In your FBDs you should…",
      options: [
        { text: "put the load on one of the two bodies (either), and keep it there consistently", correct: true },
        { text: "put the whole load on both bodies", feedback: "That counts the load twice. It acts once: choose one body to carry it on its FBD." },
        { text: "leave it out: it acts on the pin, not the bodies", feedback: "The load still pushes on the structure. Put it on one body's FBD." },
        { text: "split it half and half", feedback: "You could, but then the pin forces change to match. Simplest: put it all on one body, and stay consistent." },
      ],
      explanation: "A load at a shared pin can go on either body's FBD — the pin forces you find will include the rest. Just don't count it twice.",
    },
  ],
  explanation: "Take the frame apart body by body: a shared pin acts equally and oppositely, two-force members pull or push along themselves, and each body gives three equations.",
};
