// Unit 1.2, stage 5 — concept check: the steps of a statics problem.

export default {
  id: "solving-problems/5-concept-check",
  challenge: "concept-check",
  title: "The Method",
  mission: "Show you know the steps every statics problem follows.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Before writing any equation, you should…",
      options: [
        { text: "draw the free-body diagram", correct: true },
        { text: "pick which formula to use", feedback: "The equations come FROM the FBD: every force on it becomes a term. Without it you'll miss forces." },
        { text: "guess the answer", feedback: "An estimate helps you check at the end — but the FBD comes first." },
        { text: "write ΣF = 0 with the numbers you see", feedback: "Numbers from the picture aren't all forces on the body, and some forces (reactions, weight) aren't numbers yet." },
      ],
      explanation: "Sketch, FBD, equations, solve, check — each step feeds the next.",
    },
    {
      prompt: "On a free-body diagram, you draw…",
      options: [
        { text: "every force acting ON the isolated body, and nothing else", correct: true },
        { text: "the supports, as they look", feedback: "The supports are replaced by the forces they give. That's the whole point of \"free\"." },
        { text: "the forces the body puts on other things", feedback: "Those are the third-law partners; they act on OTHER bodies." },
        { text: "only the loads given in the problem", feedback: "The reactions and the body's weight act on it too — leave them out and the equations are wrong." },
      ],
      explanation: "Isolate the body; replace every contact (support, cable, surface) by its forces; add the weight.",
    },
    {
      prompt: "You found the reactions using $\\Sigma M_A$ and $\\Sigma F_y$. A good check is…",
      options: [
        { text: "$\\Sigma M_B = 0$ with your answers", correct: true },
        { text: "doing $\\Sigma M_A$ again", feedback: "Repeating the same equation repeats any mistake in it. Check with one you DIDN'T use." },
        { text: "checking that the answers are positive", feedback: "Negative answers are fine — they mean the force points the other way. It's a good sense-check, but not a full one." },
        { text: "none is needed if the algebra is careful", feedback: "Everyone slips. A quick independent equation catches it." },
      ],
      explanation: "Every point gives a valid moment equation: one you didn't use is an independent check.",
    },
    {
      prompt: "A reaction comes out negative. That means…",
      options: [
        { text: "it points the other way from how you drew it", correct: true },
        { text: "you made a mistake", feedback: "Not necessarily: you guessed a direction on the FBD, and the sign tells you if the guess was wrong." },
        { text: "the support has broken", feedback: "The math just says the force points the opposite way — though check the support CAN do that (a roller can't pull)." },
        { text: "take its absolute value", feedback: "Keep the sign — it carries the direction." },
      ],
      explanation: "Unknowns may be drawn either way; the sign of the answer gives the true direction.",
    },
    {
      prompt: "Statics uses +x right, +y up and counterclockwise moments positive. If you chose other directions…",
      options: [
        { text: "the answers are the same forces — as long as you stay consistent", correct: true },
        { text: "the forces would change", feedback: "Physics doesn't depend on your axes. Only the signs of the numbers you write change." },
        { text: "the equations stop working", feedback: "ΣF = 0 holds along any direction; you just have to use the same convention throughout." },
        { text: "moments would always come out zero", feedback: "Choosing clockwise positive flips every moment's sign — the sum is still zero in equilibrium, and the reactions come out the same." },
      ],
      explanation: "Conventions are bookkeeping: pick them in step 1 and never switch mid-problem.",
    },
  ],
};
