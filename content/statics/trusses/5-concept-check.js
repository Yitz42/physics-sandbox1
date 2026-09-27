// Unit 6.1, stage 5 — concept check: tension, compression and the method of joints.

export default {
  id: "trusses/5-concept-check",
  challenge: "concept-check",
  title: "Joint by Joint",
  mission: "Show you understand how truss members carry load.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Why does every member of a truss carry force only **along its length**?",
      options: [
        { text: "It is pinned at both ends and loaded only at the joints: a two-force member", correct: true },
        { text: "Because trusses are made of steel", feedback: "The material doesn't matter. What matters is that each member has forces at only two points — its pins." },
        { text: "Because the members are thin", feedback: "Thin or thick, a member with forces only at its two pins must carry them along the line between the pins." },
        { text: "It doesn't: members also carry bending", feedback: "With pins at the ends and loads only at the joints, there's nothing to bend it: it's a two-force member." },
      ],
      explanation: "Pins at both ends and no load in between make each member a two-force member: it pulls or pushes along itself.",
    },
    {
      prompt: "On a joint's FBD, a member's arrow points **away from the joint**. What does that show?",
      options: [
        { text: "Tension: the member pulls on the joint", correct: true },
        { text: "Compression: the member pushes the joint away", feedback: "An arrow away from the joint is a pull on it. A member in compression pushes INTO the joint." },
        { text: "Nothing — the direction doesn't matter", feedback: "On a joint's FBD, away = pull (tension), toward = push (compression)." },
        { text: "The member carries no force", feedback: "A zero-force member gets no arrow at all (or a zero answer)." },
      ],
      explanation: "Draw every member pulling away from the joint (tension). A negative answer then means it really pushes: compression.",
    },
    {
      prompt: "Where should you start the method of joints?",
      options: [
        { text: "At a joint with no more than two unknown forces", correct: true },
        { text: "At the joint with the biggest load", feedback: "The load's size doesn't matter. A joint gives only two equations, so start where there are only two unknowns." },
        { text: "At the middle of the truss", feedback: "Middle joints usually have too many unknown members. Start at one with at most two." },
        { text: "Anywhere — each joint has three equations", feedback: "A joint is a point: its forces all pass through it, so there's no moment equation. Just ΣF_x and ΣF_y." },
      ],
      explanation: "Each joint gives two equations, so begin where only two unknowns meet (often a support, after finding the reactions, or a loaded tip).",
    },
    {
      prompt: "A truss has 5 joints, 7 members and a pin plus a roller (3 reactions). It is…",
      options: [
        { text: "statically determinate: 7 + 3 = 10 = 2 × 5", correct: true },
        { text: "unstable: too few members", feedback: "Count: 7 + 3 = 10 unknowns and 2 × 5 = 10 equations. It's exactly enough." },
        { text: "indeterminate: more members than joints", feedback: "Compare m + r with 2j, not members with joints." },
        { text: "impossible to tell without solving", feedback: "The count m + r = 2j tells you (as long as the members are arranged in triangles)." },
      ],
      explanation: "A plane truss is determinate when $m + r = 2j$: here $7 + 3 = 10 = 2 \\times 5$.",
    },
    {
      prompt: "A member's force comes out as **−800 N**. What does that mean?",
      options: [
        { text: "It is in compression, pushing on its joints with 800 N", correct: true },
        { text: "You made a mistake: forces can't be negative", feedback: "We ASSUMED tension. A negative answer just says the member really pushes." },
        { text: "It is in tension of 800 N", feedback: "Tension came out positive in our convention. Negative means the opposite: compression." },
        { text: "It carries 800 N downward", feedback: "A member's force is along the member, not up or down. The sign says pull (+) or push (−)." },
      ],
      explanation: "With tension assumed positive, a negative member force is compression of that size.",
    },
  ],
  explanation: "Every member is a two-force member; every joint is a particle with two equations. Assume tension, and let the signs tell you which members push.",
};
