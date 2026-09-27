// Varignon's theorem, stage 5 — concept check. 3 correct answers finish it.

export default {
  id: "varignon/5-concept-check",
  challenge: "concept-check",
  solver: "statics.moment",
  title: "Varignon Sense",
  mission: "Show you know why a force's moment equals its components' moments.",
  instructions: "Answer 3 questions about Varignon's theorem: finding a moment from the force's components. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "What does Varignon's theorem say?",
      options: [
        { text: "The moment of a force about a point equals the sum of the moments of its components about that point", correct: true },
        { text: "The moment of a force is the same about every point", feedback: "That's true for a COUPLE (Unit 4.3), not for a single force: move O and the moment arm changes." },
        { text: "A force can slide along its line of action without changing its moment", feedback: "That's also true — it's the principle of transmissibility — but it isn't Varignon's theorem." },
        { text: "The moments of the components cancel out", feedback: "They add (with their signs) to give the force's moment. They only cancel in special cases." },
      ],
      explanation: "Varignon: $M_O(F) = M_O(F_x) + M_O(F_y)$. Splitting a force into components doesn't change its turning effect, and each component usually has an easy moment arm.",
    },
    {
      prompt: "A force with $F_x = 30$ N and $F_y = 40$ N acts at the point (2, 1) m. What is its moment about the origin O?",
      options: [
        { text: "+50 N·m (counterclockwise)", correct: true },
        { text: "+110 N·m", feedback: "That adds $xF_y + yF_x$. $F_x$ pushes right ABOVE O, which turns clockwise: $M_O = xF_y - yF_x = 2(40) - 1(30)$." },
        { text: "+100 N·m", feedback: "That's $xF_x + yF_y$: the arms are swapped. $F_y$ (vertical) has arm $x$; $F_x$ (horizontal) has arm $y$." },
        { text: "+111.8 N·m", feedback: "That's $F \\times |OA| = 50 \\times 2.24$. $|OA|$ isn't the moment arm; use the components instead." },
      ],
      explanation: "$M_O = xF_y - yF_x = 2(40) - 1(30) = 80 - 30 = +50$ N·m. $F_y$ turns it counterclockwise, $F_x$ clockwise, and the moments add with their signs.",
    },
    {
      prompt: "An angled force acts at a point A. Why is Varignon's theorem often easier than $M = Fd$?",
      options: [
        { text: "Each component's moment arm is just a coordinate of A, so you never need the perpendicular distance d", correct: true },
        { text: "It gives a bigger, safer answer", feedback: "Both ways give exactly the same moment. Varignon is a different route, not a different answer." },
        { text: "It ignores the force's direction", feedback: "The direction is still there: it decides the sizes and signs of $F_x$ and $F_y$." },
        { text: "It works only for forces at 90° to OA", feedback: "It works for any force. For a force at 90° to OA both methods are equally easy." },
      ],
      explanation: "For $F_y$ the arm is the sideways distance $x$; for $F_x$ it's the height $y$. Those are read straight off the drawing, while $d$ for an angled force needs trigonometry.",
    },
    {
      prompt: "A force acts at A = (0.3, 0) m, on the x-axis through O. Which of its components has a moment about O?",
      options: [
        { text: "Only $F_y$", correct: true },
        { text: "Only $F_x$", feedback: "$F_x$ acts along the x-axis, which passes through O: its moment arm is zero." },
        { text: "Both", feedback: "A is on the x-axis, so $y = 0$: the $-yF_x$ term is zero. Only $xF_y$ is left." },
        { text: "Neither", feedback: "$F_y$ acts 0.3 m to the side of O, so it has a moment: $xF_y$." },
      ],
      explanation: "With $y = 0$, $M_O = xF_y - yF_x = xF_y$. The horizontal component's line passes through O, so it can't turn anything about O.",
    },
  ],
  hints: ["Split the force into $F_x$ and $F_y$ at its point. $F_y$'s arm is the sideways distance $x$; $F_x$'s arm is the height $y$."],
  explanation: "Varignon's theorem: $M_O = xF_y - yF_x$ — the moments of the components, added with their signs, equal the moment of the force.",
};
