// Unit 3, stage 5 — concept check, in two parts: what a moment is, and isn't
// (3 questions); Varignon's theorem (2 questions).

// A bar pinned at O with one force on it, for the pictures below.
const bar = (direction, at = [0.4, 0]) => ({
  analysis: "moment",
  about: { at: [0, 0], label: "O", pivot: true },
  body: { points: [[0, 0], [0.5, 0]] },
  forces: [{ id: "F", symbol: "F", magnitude: 100, direction, at }],
});

export default {
  id: "03-moments/5-concept-check",
  challenge: "concept-check",
  solver: "statics.moment",
  title: "Moment Sense",
  parts: [
    {
      title: "Moments",
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
          prompt: "The force in the picture points straight up, at the right end of the bar. Which way does it turn the bar about O?",
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
    },
    {
      title: "Varignon's theorem",
      instructions: "Answer 2 questions about Varignon's theorem: finding a moment from the force's components. Every wrong choice explains the misconception behind it.",
      required: 2,
      questions: [
        {
          prompt: "What does Varignon's theorem say?",
          options: [
            { text: "The moment of a force about a point equals the sum of the moments of its components about that point", correct: true },
            { text: "The moment of a force is the same about every point", feedback: "That's true for a COUPLE (Unit 4), not for a single force: move O and the moment arm changes." },
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
    },
  ],
  explanation:
    "A moment is a turning effect: force times perpendicular distance, with a sign for its direction — or, by Varignon's theorem, the moments of the force's components added up.",
};
