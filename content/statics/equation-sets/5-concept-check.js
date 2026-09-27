// Unit 5.3, stage 5 — concept check: when does a set of three equations work?

export default {
  id: "equation-sets/5-concept-check",
  challenge: "concept-check",
  title: "Which Three?",
  mission: "Show you know when a set of three equations can solve a body.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Which of these can replace $\\Sigma F_x = 0$, $\\Sigma F_y = 0$, $\\Sigma M_A = 0$ for a body in a plane?",
      options: [
        { text: "$\\Sigma M_A = 0$, $\\Sigma M_B = 0$, $\\Sigma F_x = 0$ — if the line AB isn't perpendicular to x", correct: true },
        { text: "$\\Sigma M_A = 0$, $\\Sigma M_B = 0$ — two moment equations are enough", feedback: "A body in a plane can move three ways (slide x, slide y, turn), so it needs three independent equations." },
        { text: "Nothing: it must always be ΣF_x, ΣF_y and one ΣM", feedback: "Any three independent equations work. Two moments and a force (or three moments) are often quicker." },
        { text: "$\\Sigma F_x = 0$, $\\Sigma F_y = 0$ and $\\Sigma F$ along a slant", feedback: "A slanted force sum is just a mix of $\\Sigma F_x$ and $\\Sigma F_y$: it says nothing about turning. At least one moment equation is needed." },
      ],
      explanation: "Two moment equations plus one force equation work, provided the line through the two moment points is not perpendicular to the force direction.",
    },
    {
      prompt: "A crane's pin A is straight **below** its roller B. Why does $\\Sigma M_A$, $\\Sigma M_B$, $\\Sigma F_x$ fail?",
      options: [
        { text: "AB is vertical — perpendicular to x — so ΣF_x adds nothing new", correct: true },
        { text: "Because B is a roller", feedback: "The type of support doesn't matter. What matters is where A and B are: on a vertical line, perpendicular to x." },
        { text: "Because moments about B are always zero", feedback: "Moments about B aren't zero in general — but with A straight below B, $\\Sigma F_x$ follows from $\\Sigma M_A$ and $\\Sigma M_B$." },
        { text: "It doesn't fail", feedback: "Try it: $\\Sigma M_A$ gives $B_x$, $\\Sigma M_B$ gives $A_x$, and $\\Sigma F_x$ holds only $A_x$ and $B_x$ again. Nothing finds $A_y$." },
      ],
      explanation: "With A and B on a line perpendicular to x, any sideways force has the same moment difference about A and B: $\\Sigma F_x$ is already inside the two moment equations. Use $\\Sigma F_y$ instead.",
    },
    {
      prompt: "When do three moment equations, about A, B and C, work?",
      options: [
        { text: "When A, B and C are not all on one line", correct: true },
        { text: "Always", feedback: "Not if the three points are on one line: then the third moment equation follows from the other two." },
        { text: "Only if A, B and C are supports", feedback: "Any points work — on the body or off it. They just mustn't all lie on one line." },
        { text: "Never: you always need a force equation", feedback: "Three moment equations are fine, as long as the points aren't in a line." },
      ],
      explanation: "Moments about three points not on one line are independent, so they can find three unknowns.",
    },
    {
      prompt: "Where is the smartest point to take moments about?",
      options: [
        { text: "Where the lines of action of two unknowns cross", correct: true },
        { text: "Where the biggest load acts", feedback: "The size of a known load doesn't help. Unknowns whose lines pass through the point drop out: pick where two cross." },
        { text: "At the body's centre", feedback: "The centre usually keeps every unknown in the equation. Pick where two unknowns' lines cross." },
        { text: "At the origin of the axes", feedback: "The axes' origin is only a drawing choice. Moments about a point where two unknowns' lines cross leave one unknown." },
      ],
      explanation: "An unknown whose line passes through the moment point has no moment about it. Where two unknowns' lines cross, both drop out and one unknown is left.",
    },
    {
      prompt: "A body has 4 unknown reactions. Can a fourth equation, $\\Sigma M_C = 0$, find the fourth?",
      options: [
        { text: "No: a body in a plane has only three independent equations", correct: true },
        { text: "Yes: every new point gives a new equation", feedback: "Every point gives a true equation, but after three independent ones the rest follow from them. The body stays statically indeterminate." },
        { text: "Yes, if C is off the body", feedback: "It doesn't matter where C is. Only three equations are independent." },
        { text: "Only with a force equation instead", feedback: "Any fourth equation, force or moment, follows from three independent ones." },
      ],
      explanation: "However you choose them, a body in a plane gives three independent equations. A fourth unknown needs more than equilibrium: the structure is statically indeterminate.",
    },
  ],
  explanation: "Three independent equations, no more: two moments plus a force (not perpendicular to the moment points' line) or three moments (points not in line). Pick points where unknowns' lines cross.",
};
