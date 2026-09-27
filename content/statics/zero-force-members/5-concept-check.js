// Unit 6.2, stage 5 — concept check: spotting zero-force members, and why they stay.

export default {
  id: "zero-force-members/5-concept-check",
  challenge: "concept-check",
  title: "Why Keep Them?",
  mission: "Show you know when a member carries nothing — and why it's still there.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Three members meet at a joint with no load or support. Two of them are in one straight line. What about the third?",
      options: [
        { text: "It carries no force", correct: true },
        { text: "It carries the same force as the other two", feedback: "Across the line of the other two, nothing but the third member acts — so nothing balances it. It must be zero." },
        { text: "It can't be known without solving", feedback: "This one can: ΣF across the line of the two in-line members has only the third member in it, so it's zero." },
        { text: "The two in line are zero", feedback: "The two in line can carry equal and opposite forces. It's the member OFF the line that must be zero." },
      ],
      explanation: "Across the line of the two in-line members, the third member's force is the only one — so it must be zero.",
    },
    {
      prompt: "Only two members meet at an unloaded, unsupported joint, at an angle to each other. Then…",
      options: [
        { text: "both carry no force", correct: true },
        { text: "they carry equal forces", feedback: "At an angle, neither can balance the other: each has a part the other can't cancel. Both must be zero." },
        { text: "one of them is zero", feedback: "Take components across each member in turn: each one is alone in its own direction. Both are zero." },
        { text: "the joint is unstable", feedback: "The joint is held by the rest of the truss. The members just carry nothing under this load." },
      ],
      explanation: "Two members at an angle can't balance each other, so with nothing else at the joint both forces are zero.",
    },
    {
      prompt: "A load hangs at a joint where two members are in line and a third is not. Is the third a zero-force member?",
      options: [
        { text: "No: the load acts across the line, so the third member holds it", correct: true },
        { text: "Yes: two members are in line", feedback: "The rule needs NOTHING else at the joint. Here the load acts across the line, and only the third member can balance it." },
        { text: "Yes, if the load is small", feedback: "Any load across the line needs the third member to hold it, however small." },
        { text: "Only if the joint is at a support", feedback: "A support at the joint also stops the rule. Here it's the load that stops it." },
      ],
      explanation: "Loads and supports at a joint stop the rule: they act on the joint too, and the odd member may be what balances them.",
    },
    {
      prompt: "If a member carries no force, why not take it out of the truss?",
      options: [
        { text: "It keeps the truss stable, and carries force when the load moves", correct: true },
        { text: "You can: it does nothing", feedback: "It does nothing under THIS load. Move the load, and it may carry plenty. Without it, the truss can also fold up." },
        { text: "It holds up its own weight", feedback: "Truss members' weights are usually neglected. Its real jobs: keeping the truss stable and carrying other loads." },
        { text: "Because m + r = 2j must stay true forever", feedback: "The count follows from the truss shape. The reason to keep the member is stability, and other loads." },
      ],
      explanation: "Zero-force members brace the truss (a long compression member would buckle without them) and take load when the loading changes.",
    },
    {
      prompt: "You've found one zero-force member. What should you do next?",
      options: [
        { text: "Ignore it and look at the joints again: it may reveal another", correct: true },
        { text: "Stop: a truss has at most one", feedback: "A truss can have many. And removing one from a joint can leave that joint with only two members, or three with two in line." },
        { text: "Solve the whole truss to check it", feedback: "No need: inspection is exact. But look again — with it ignored, another joint may follow a rule." },
        { text: "Set every member at that joint to zero", feedback: "Only the member the rule points to is zero. The others may carry force." },
      ],
      explanation: "With one zero member ignored, a neighbouring joint may now have two members at an angle, or three with two in line: keep looking.",
    },
  ],
  explanation: "At a joint with nothing but members: two at an angle → both zero; three with two in line → the third is zero. Loads and supports stop the rule. Zero members stay for stability and other loads.",
};
