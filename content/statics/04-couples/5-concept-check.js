// Unit 4, stage 5 — concept check: what a couple is, and what it does.

// A plate with a couple on it, for the picture questions.
const plate = (direction, at, opposite) => ({
  analysis: "couple",
  plates: [{ from: [0, 0], to: [0.5, 0.3] }],
  couples: [{ id: "C", symbol: "F", magnitude: 100, direction, at, opposite }],
});

export default {
  id: "04-couples/5-concept-check",
  challenge: "concept-check",
  solver: "statics.couple",
  title: "Couple Sense",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Which pair of forces is a **couple**?",
      options: [
        { text: "Equal in size, opposite in direction, along parallel lines that are apart", correct: true },
        { text: "Equal in size, opposite in direction, along the same line", feedback: "Along the same line they simply cancel: no net force and no turning. The lines must be offset." },
        { text: "Equal in size, same direction, along parallel lines", feedback: "Those add up to a net force of $2F$, which pushes the body along. A couple's forces cancel." },
        { text: "Any two forces that make the body turn", feedback: "Many force pairs turn a body, but a couple is special: equal, opposite and offset, so it turns without pushing." },
      ],
      explanation: "A couple is two equal, opposite forces whose lines of action are a distance $d$ apart. They cancel as forces but not as moments.",
    },
    {
      prompt: "The couple's moment about point P is 40 N·m. What is its moment about a different point Q?",
      options: [
        { text: "40 N·m — the same", correct: true },
        { text: "It depends on how far Q is from P", feedback: "For a single force, yes. For a couple, the two moments change by equal and opposite amounts, so the total stays the same." },
        { text: "Zero, because the forces cancel", feedback: "The forces cancel, but their moments don't: they are offset, so they both turn the body the same way." },
        { text: "It can't be known without the coordinates of Q", feedback: "It can: a couple has the same moment about every point. That's what makes couples so convenient." },
      ],
      explanation: "A couple has the same moment $M = Fd$ about every point, so we can talk about \"the moment of the couple\" without naming a point.",
    },
    {
      prompt: "In the picture, what is the **net force** of the couple on the plate?",
      setup: plate("up", [0.5, 0.15], [0, 0.15]),
      options: [
        { text: "Zero", correct: true },
        { text: "$2F$ = 200 N", feedback: "The two forces point in opposite directions, so they cancel as forces." },
        { text: "$F$ = 100 N", feedback: "Add them as vectors: 100 N up plus 100 N down is zero." },
        { text: "$Fd$", feedback: "$Fd$ is the couple's moment (N·m), not a force. The net force is zero." },
      ],
      explanation: "The forces are equal and opposite, so $\\Sigma F = 0$: the plate isn't pushed anywhere. It only turns.",
    },
    {
      prompt: "In the picture, which way does the couple turn the plate?",
      setup: plate("left", [0.25, 0.3], [0.25, 0]),
      options: [
        { text: "Counterclockwise, so $M$ is positive", correct: true },
        { text: "Clockwise, so $M$ is negative", feedback: "The top is pushed left and the bottom right: picture a steering wheel turned that way. It turns counterclockwise." },
        { text: "It doesn't turn, because the forces cancel", feedback: "They cancel as forces, but they are offset by $d$ = 0.3 m, so they turn the plate." },
        { text: "It depends on where you take moments", feedback: "A couple turns the same way about every point." },
      ],
      explanation: "Pushing the top to the left and the bottom to the right turns the plate counterclockwise: $M = +Fd$.",
    },
    {
      prompt: "A couple of 50 N forces acts along parallel lines 0.4 m apart. What is the couple moment?",
      options: [
        { text: "20 N·m", correct: true },
        { text: "40 N·m", feedback: "That counts $Fd$ for each force. A couple's moment is $F \\times d$ once, with $d$ the distance between the two lines." },
        { text: "10 N·m", feedback: "That uses half the distance. $d$ is the full distance between the two lines of action." },
        { text: "125 N·m", feedback: "That's $F / d$. A moment is force **times** distance." },
      ],
      explanation: "$M = Fd = 50 \\times 0.4 = 20$ N·m.",
    },
    {
      prompt: "A 30 N·m counterclockwise couple acts on a plate. Which couple could replace it?",
      options: [
        { text: "60 N forces, 0.5 m apart, turning counterclockwise", correct: true },
        { text: "60 N forces, 0.5 m apart, turning clockwise", feedback: "Right size, but equivalent couples must also turn the same way." },
        { text: "100 N forces, 0.5 m apart, turning counterclockwise", feedback: "That's $100 \\times 0.5 = 50$ N·m, not 30 N·m." },
        { text: "A single 60 N force, 0.5 m from the centre", feedback: "A single force also pushes the plate along. Only a couple can replace a couple." },
      ],
      explanation: "Couples are equivalent when they have the same moment and turning sense: $60 \\times 0.5 = 30$ N·m counterclockwise.",
    },
    {
      prompt: "Why do you turn a car's steering wheel with two hands pushing in opposite directions?",
      options: [
        { text: "The two hands make a couple: the wheel turns without being pushed sideways", correct: true },
        { text: "Two hands give twice the force, so the wheel moves faster", feedback: "The forces point opposite ways, so they don't add as forces — together they make a pure turning effect." },
        { text: "It makes the moment depend less on where the centre is", feedback: "A couple's moment doesn't depend on the point at all. The real benefit is that there's no net sideways force on the column." },
        { text: "It doesn't matter: one hand works exactly the same", feedback: "One hand pushes the wheel sideways as well as turning it; the steering column has to resist that push." },
      ],
      explanation: "Equal and opposite hands form a couple: $\\Sigma F = 0$, so the column feels only a moment $M = Fd$.",
    },
  ],
  hints: ["Remember: a couple's forces cancel as forces, but not as moments."],
  explanation: "A couple is a pure turning effect: zero net force, and the same moment $M = Fd$ about every point.",
};
