// Unit 5.3, stage 5 — concept check: when and how to cut a truss.

export default {
  id: "truss-sections/5-concept-check",
  challenge: "concept-check",
  title: "Where to Cut?",
  mission: "Show you know how the method of sections works — and when to use it.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "When is the method of sections quicker than the method of joints?",
      options: [
        { text: "When you need the force in a few members in the middle of a truss", correct: true },
        { text: "When you need every member's force", feedback: "For every member, going joint by joint is just as good. Sections shine when you need one or two members deep inside." },
        { text: "Only for trusses with no supports", feedback: "Sections work on any truss. Usually you find the reactions first, from the whole truss." },
        { text: "Never: it gives the same answers more slowly", feedback: "Same answers, but often in ONE equation instead of several joints." },
      ],
      explanation: "A section reaches a member in the middle directly: cut through it, take moments about a clever point, done.",
    },
    {
      prompt: "Why cut through **no more than three** members (with unknown forces)?",
      options: [
        { text: "A part of the truss gives only three equations", correct: true },
        { text: "Because a truss has three supports", feedback: "It's about the part you keep: a rigid body in a plane gives exactly three equations, so at most three unknowns." },
        { text: "Because members come in threes (triangles)", feedback: "Triangles make the truss rigid, but the limit comes from the three equations of the part kept." },
        { text: "There's no limit", feedback: "With four unknown member forces and three equations, the part can't be solved on its own." },
      ],
      explanation: "The part kept is a rigid body with three equations: three unknown member forces at most.",
    },
    {
      prompt: "Where is the best point to take moments about?",
      options: [
        { text: "Where two of the cut members' lines cross", correct: true },
        { text: "At a support", feedback: "A support point removes the reactions, but here they're known. Remove two unknown member forces instead: where their lines cross." },
        { text: "At the middle of the cut", feedback: "The middle usually keeps all three member forces in the equation." },
        { text: "Anywhere on the part kept, but not off it", feedback: "The point may be anywhere, even off the truss. What matters is that two cut members' lines pass through it." },
      ],
      explanation: "Two member forces whose lines pass through the point have no moment about it, so the third comes from one equation.",
    },
    {
      prompt: "On the section's FBD, which way do you draw each cut member's force?",
      options: [
        { text: "Pulling on the part kept (tension); a negative answer means it pushes", correct: true },
        { text: "Always pointing down", feedback: "A member's force is along the member. Draw it pulling on the part kept, away from it." },
        { text: "Pushing on the part kept", feedback: "You can, but then the signs flip from the method of joints. The usual habit is to assume tension everywhere." },
        { text: "It doesn't matter as long as the numbers come out positive", feedback: "The drawn direction sets what the sign means. Assume tension, and a negative answer honestly means compression." },
      ],
      explanation: "Assume tension, as in the method of joints: then a positive answer is tension and a negative one compression.",
    },
    {
      prompt: "A cut goes through three members but the truss is still one piece. What's wrong?",
      options: [
        { text: "It missed a member that joins the two parts, so that member's force is unknown too", correct: true },
        { text: "Nothing: any three members will do", feedback: "The cut must separate the truss. A member it misses still pulls or pushes between the parts." },
        { text: "The cut must be vertical", feedback: "Cuts can be slanted or curved. What matters is that it separates the truss completely." },
        { text: "The truss is unstable", feedback: "The truss is fine. The cut just doesn't isolate a part, so the part's FBD would be missing a force." },
      ],
      explanation: "A section must cut every member joining the two parts; otherwise one more unknown force acts between them.",
    },
  ],
  explanation: "Cut through at most three members so the truss falls in two, draw one part with every cut member pulling on it, and take moments where two cut members cross.",
};
