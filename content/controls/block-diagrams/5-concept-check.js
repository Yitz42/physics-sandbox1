// Block diagram reduction, stage 5 — concept check: the rules, and why they work.
// Questions are drawn from this pool in random order; 3 correct answers finish it.

// Small diagrams for the pictures below.
const loop = (sign) => ({ diagram: { loop: { block: "G" }, back: { block: "H" }, sign } });

export default {
  id: "block-diagrams/5-concept-check",
  challenge: "concept-check",
  solver: "controls.blockDiagram",
  title: "Block Diagram Sense",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "What is the closed-loop transfer function $C/R$ of this negative-feedback loop?",
      setup: loop(-1),
      options: [
        { text: "$\\dfrac{G}{1 + GH}$", correct: true },
        { text: "$\\dfrac{G}{1 - GH}$", feedback: "That's for POSITIVE feedback. With a minus at the summing junction, the loop gain is added in the bottom." },
        { text: "$\\dfrac{GH}{1 + GH}$", feedback: "Only the forward path goes on top. $H$ is in the feedback path, so it appears only in the loop gain $GH$." },
        { text: "$G - H$", feedback: "Blocks aren't subtracted like that. Write $E = R - HC$ and $C = GE$, then solve for $C/R$." },
      ],
      explanation: "$C = G(R - HC)$, so $C(1 + GH) = GR$ and $\\dfrac{C}{R} = \\dfrac{G}{1 + GH}$.",
    },
    {
      prompt: "The summing junction now ADDS the feedback signal (positive feedback, as in the picture). What is $C/R$?",
      setup: loop(+1),
      options: [
        { text: "$\\dfrac{G}{1 - GH}$", correct: true },
        { text: "$\\dfrac{G}{1 + GH}$", feedback: "That's negative feedback. With a plus at the junction, $C = G(R + HC)$." },
        { text: "$\\dfrac{G}{GH - 1}$", feedback: "Close, but upside down in sign: $C(1 - GH) = GR$, so the bottom is $1 - GH$." },
        { text: "$G + H$", feedback: "Write the junction's equation: $C = G(R + HC)$, then solve for $C/R$." },
      ],
      explanation: "$C = G(R + HC)$ gives $C(1 - GH) = GR$: $\\dfrac{C}{R} = \\dfrac{G}{1 - GH}$. If $GH$ reaches 1, the output blows up.",
    },
    {
      prompt: "Three blocks $G_1$, $G_2$, $G_3$ are in series. What single block replaces them?",
      options: [
        { text: "$G_1G_2G_3$", correct: true },
        { text: "$G_1 + G_2 + G_3$", feedback: "Adding is for PARALLEL branches. In series, each block's output is the next block's input, so the gains multiply." },
        { text: "$\\dfrac{G_1G_2G_3}{1 + G_1G_2G_3}$", feedback: "That's what you'd get with a unity feedback loop around them — but there's no loop here." },
        { text: "The largest of the three", feedback: "Every block acts on the signal, so all three count: they multiply." },
      ],
      explanation: "$C = G_3(G_2(G_1R))$, so $\\dfrac{C}{R} = G_1G_2G_3$. (For transfer functions, the order doesn't matter.)",
    },
    {
      prompt: "Two branches, $G_1$ and $G_2$, leave the same pickoff point and meet at a summing junction with signs $+$ and $-$. What replaces them?",
      options: [
        { text: "$G_1 - G_2$", correct: true },
        { text: "$G_1G_2$", feedback: "Multiplying is for blocks in SERIES. These branches carry the same input side by side, and the junction adds their outputs." },
        { text: "$G_1 + G_2$", feedback: "Check the signs at the summing junction: the $G_2$ branch is subtracted." },
        { text: "$\\dfrac{G_1}{1 + G_2}$", feedback: "That's a feedback loop's form. Here both branches go forward from the same input." },
      ],
      explanation: "Both branches see the same input $R$, and the junction adds them with their signs: $C = G_1R - G_2R$.",
    },
    {
      prompt: "To move a pickoff point from AFTER a block $G$ to BEFORE it, what must be added to the branch that leaves the pickoff point?",
      options: [
        { text: "A block $G$, so the branch still carries the same signal", correct: true },
        { text: "A block $1/G$", feedback: "That's for moving a pickoff point the other way (from before a block to after it)." },
        { text: "Nothing: pickoff points can move freely", feedback: "Before $G$ the signal is different (it hasn't been multiplied by $G$ yet), so the branch must make up for that." },
        { text: "A feedback loop", feedback: "Only the branch's signal needs fixing: multiply it by $G$." },
      ],
      explanation: "After $G$ the branch carried $GX$. Taken before $G$, it carries $X$, so a block $G$ is added to it to keep the same signal.",
    },
    {
      prompt: "What does \"unity feedback\" mean?",
      options: [
        { text: "The feedback path is $H = 1$: the output is fed straight back", correct: true },
        { text: "The whole system has a gain of 1", feedback: "Unity feedback only describes the feedback path. The closed-loop gain is $\\dfrac{G}{1 + G}$, which isn't 1 in general." },
        { text: "There is only one loop", feedback: "It's about the feedback path's gain, $H = 1$, not the number of loops." },
        { text: "The error is always zero", feedback: "The error $E = R - C$ is usually not zero; chapter 7 shows how big it is." },
      ],
      explanation: "With $H = 1$ the loop compares the output directly with the input: $T = \\dfrac{G}{1 + G}$ and $E = R - C$.",
    },
  ],
  hints: ["Write the equation at each summing junction, e.g. $E = R - HC$ and $C = GE$, then solve for $C/R$."],
  explanation: "Every reduction rule comes from writing the signals' equations: series multiply, parallel add with signs, and a loop gives $\\dfrac{G}{1 \\mp GH}$.",
};
