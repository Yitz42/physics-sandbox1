// Moment of a force, stage 5 — concept check: what a moment is, and isn't.
// A bar pinned at O with one force on it, for the pictures below.

const bar = (direction, at = [0.4, 0]) => ({
  analysis: "moment",
  about: { at: [0, 0], label: "O", pivot: true },
  body: { points: [[0, 0], [0.5, 0]] },
  forces: [{ id: "F", symbol: "F", magnitude: 100, direction, at }],
});

export default {
  id: "moments/5-concept-check",
  challenge: "concept-check",
  solver: "statics.moment",
  title: "Moment Sense",
  mission: "Show you know what makes a moment, and which way it turns.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "What are the units of a moment in SI?",
      options: [
        { text: "N·m", correct: true },
        { text: "N", feedback: "Newtons measure force. A moment is a force times a distance." },
        { text: "N/m", feedback: "Dividing by distance gives force per length (like a spring stiffness), not a turning effect." },
        { text: "J (joules)", feedback: "A joule is also N·m, but it measures energy. For moments we write N·m to keep the two ideas apart." },
      ],
      explanation: "$M = Fd$: force (N) times distance (m), so N·m.",
    },
    {
      prompt: "The force in the picture points straight up, 0.4 m to the right of O. Which way does it turn the bar about O?",
      setup: bar("up"),
      options: [
        { text: "Counterclockwise, so $M_O$ is positive", correct: true },
        { text: "Clockwise, so $M_O$ is negative", feedback: "Imagine pushing up on the right end of a door hinged at O: it swings up and to the left — counterclockwise." },
        { text: "It doesn't turn it", feedback: "The force's line of action misses O by 0.4 m, so there is a moment arm and a moment." },
        { text: "It depends on the size of $F$", feedback: "The size sets how big the moment is, not which way it turns." },
      ],
      explanation: "Pushing up to the right of O turns the bar counterclockwise, and counterclockwise moments are positive.",
    },
    {
      prompt: "This force's line of action passes right through O. What is its moment about O?",
      setup: bar("left"), // pushing along the bar, straight toward O
      options: [
        { text: "Zero", correct: true },
        { text: "$F$ times the distance from O to where it acts", feedback: "That distance isn't the moment arm. The moment arm is the perpendicular distance to the line of action — here zero." },
        { text: "It's as big as possible", feedback: "Pushing straight toward O just squeezes the bar — it can't turn it." },
        { text: "It can't be worked out", feedback: "It can: $d = 0$, so $M_O = F \\times 0 = 0$." },
      ],
      explanation: "When the line of action passes through O, the moment arm $d$ is zero, so $M_O = Fd = 0$.",
    },
    {
      prompt: "You push a door with the same force, straight at the door. Where is it easiest to open?",
      options: [
        { text: "At the handle side, far from the hinges", correct: true },
        { text: "Right next to the hinges", feedback: "Near the hinges the moment arm is tiny, so the same force makes almost no moment." },
        { text: "In the middle", feedback: "Better than at the hinges, but the far edge gives an even bigger moment arm." },
        { text: "It makes no difference", feedback: "$M = Fd$: the farther from the hinges, the bigger $d$ and the bigger the moment." },
      ],
      explanation: "For the same force, the moment grows with the moment arm. That's why door handles are far from the hinges.",
    },
    {
      prompt: "Why is pushing on a wrench at an angle less effective than pushing at 90° to the handle?",
      options: [
        { text: "The moment arm (perpendicular distance) is shorter", correct: true },
        { text: "Some of the force is lost", feedback: "The whole force still acts — but its line of action passes closer to O, so the moment arm shrinks." },
        { text: "It isn't: only the size of the force matters", feedback: "Direction matters too. Try it in the Explore stage: angle the force and watch $d$ shrink." },
        { text: "Because of friction in the bolt", feedback: "Friction is the same either way. The difference is the moment arm." },
      ],
      explanation: "At an angle, the line of action passes closer to O. Equivalently, only the component of $F$ perpendicular to the handle turns it.",
    },
    {
      prompt: "You find the moment of a force with $M_O = Fd$, and your friend uses $M_O = xF_y - yF_x$. What should you get?",
      options: [
        { text: "Exactly the same moment", correct: true },
        { text: "Different answers — one of the methods is only approximate", feedback: "Both are exact. They are two ways of computing the same thing." },
        { text: "Same size, opposite signs", feedback: "With counterclockwise positive in both, the signs agree too." },
        { text: "It depends on where the force acts", feedback: "Wherever it acts, both methods agree. That's why the second method is a great check." },
      ],
      explanation: "Both methods give the same $M_O$ (this is Varignon's theorem). Use whichever is easier, and the other to check.",
    },
  ],
  hints: ["Picture the force's line of action, and ask: how far does it pass from O?"],
  explanation: "A moment is a turning effect: force times perpendicular distance, with a sign for its direction.",
};
