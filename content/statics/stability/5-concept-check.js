// Unit 4.4, stage 5 — concept check: stability, determinacy and improper supports.

export default {
  id: "stability/5-concept-check",
  challenge: "concept-check",
  title: "Stable or Not?",
  mission: "Show you can tell stable, unstable and indeterminate structures apart.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A beam has **4** unknown reactions. What can equilibrium tell you?",
      options: [
        { text: "Not all four: it's statically indeterminate to degree 1", correct: true },
        { text: "All four, with a fourth moment equation", feedback: "A body in a plane has only 3 independent equations; a 4th moment equation follows from the others." },
        { text: "It's unstable", feedback: "Too MANY unknowns means extra supports, not too few. It's held — just over-held." },
        { text: "Nothing at all", feedback: "The 3 equations still hold; they just can't pin down 4 unknowns." },
      ],
      explanation: "4 unknowns and 3 equations: indeterminate to degree $4 - 3 = 1$. Finding the reactions needs how the beam bends as well.",
    },
    {
      prompt: "A beam rests on **three rollers** on level ground and carries a slanted load. What happens?",
      options: [
        { text: "It slides sideways: the three reactions are all parallel", correct: true },
        { text: "It's fine: 3 unknowns and 3 equations", feedback: "Counting is only the first check. Three vertical pushes can't resist a sideways push." },
        { text: "It's indeterminate", feedback: "There are exactly 3 unknowns, not more. The problem is their direction." },
        { text: "It tips over one roller", feedback: "Up and down and turning are held; sliding sideways isn't." },
      ],
      explanation: "Three parallel reactions leave the body free to slide across them: improperly supported, even with 3 unknowns.",
    },
    {
      prompt: "Three reactions whose lines of action **all pass through one point**. The body…",
      options: [
        { text: "can turn about that point: it's improperly supported", correct: true },
        { text: "is stable, because it has 3 unknowns", feedback: "None of the reactions has a moment about that point, so nothing resists turning about it." },
        { text: "is indeterminate", feedback: "It has 3 unknowns — the trouble is the arrangement, not the count." },
        { text: "can only slide, not turn", feedback: "It's the other way: the forces can resist sliding but have no moment about the common point." },
      ],
      explanation: "About the common point every reaction has zero moment, so $\\Sigma M = 0$ can't be satisfied by a load that turns the body: it rotates.",
    },
    {
      prompt: "What is the degree of indeterminacy of a beam **fixed at both ends**?",
      options: [
        { text: "3", correct: true },
        { text: "6", feedback: "6 is the number of unknowns (3 per fixed end). The degree is unknowns − 3." },
        { text: "0", feedback: "0 would mean exactly 3 unknowns. Each fixed end gives 3." },
        { text: "2", feedback: "Count again: each fixed end gives $A_x$, $A_y$ and $M_A$." },
      ],
      explanation: "Two fixed ends give $3 + 3 = 6$ unknowns; $6 - 3 = 3$.",
    },
    {
      prompt: "Why do real bridges usually have a pin at one end and a roller at the other, and not two pins?",
      options: [
        { text: "Two pins would be indeterminate and stop the deck expanding in the heat", correct: true },
        { text: "Two pins would be unstable", feedback: "Two pins give 4 unknowns: that's over-held, not unstable." },
        { text: "Rollers are cheaper", feedback: "Cost isn't the reason — a roller lets the deck slide as it grows and shrinks." },
        { text: "A pin can't carry vertical loads", feedback: "A pin carries both $A_x$ and $A_y$." },
      ],
      explanation: "Pin + roller gives exactly 3 well-placed unknowns, and the roller lets the deck lengthen freely; two pins would fight the expansion with huge forces.",
    },
  ],
  explanation: "Count the unknowns (compare with 3), then check the arrangement: never all parallel, never all through one point.",
};
