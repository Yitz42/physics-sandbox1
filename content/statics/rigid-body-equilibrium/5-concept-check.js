// Unit 5.2, stage 5 — concept check: the three equations and the smart moment point.

export default {
  id: "rigid-body-equilibrium/5-concept-check",
  challenge: "concept-check",
  title: "Smart Moments",
  mission: "Show you know how to choose and use the equilibrium equations.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A beam sits on a **pin at A** and a **roller at B**. About which point does $\\Sigma M = 0$ give $B_y$ straight away?",
      options: [
        { text: "About A: both of the pin's reactions act there, so they have no moment about it", correct: true },
        { text: "About B, because that's where $B_y$ acts", feedback: "About B, $B_y$ has NO moment — it drops out. You'd get $A_y$ instead." },
        { text: "About the middle of the beam", feedback: "About the middle, both $A_y$ and $B_y$ have moments: two unknowns in one equation." },
        { text: "It doesn't matter — every point gives $B_y$ directly", feedback: "Every point gives a TRUE equation, but only a point where the other unknowns act leaves $B_y$ alone in it." },
      ],
      explanation: "Take moments about the point where the most unknowns act. At the pin, $A_x$ and $A_y$ have zero moment arm, so $\\Sigma M_A = 0$ has only $B_y$ in it.",
    },
    {
      prompt: "Can you take moments about a point that is **not on the body**?",
      options: [
        { text: "Yes: a body in equilibrium has $\\Sigma M = 0$ about every point", correct: true },
        { text: "No, only about points on the body", feedback: "Equilibrium means no turning at all, so the moments balance about any point in the plane — on the body or off it." },
        { text: "Only about a support", feedback: "Supports are often the SMART choice, but $\\Sigma M = 0$ holds about every point." },
        { text: "Only about the centre of gravity", feedback: "The centre of gravity is nothing special for statics. Any point works." },
      ],
      explanation: "In equilibrium, $\\Sigma M_P = 0$ for every point P. Choosing P is about making the algebra easy, not about which point is allowed.",
    },
    {
      prompt: "You solve and get $A_x = -250$ N. What does the minus sign mean?",
      options: [
        { text: "$A_x$ is 250 N, pointing opposite to the way it was drawn on the FBD", correct: true },
        { text: "You made a mistake: forces can't be negative", feedback: "On an FBD you guess each unknown's direction. A negative answer just says the guess was backwards." },
        { text: "The support is pulling instead of pushing, so it will break", feedback: "A pin can push or pull either way. The sign only tells the direction." },
        { text: "The beam is not in equilibrium", feedback: "The equations assumed equilibrium and found a consistent answer. The sign is about direction." },
      ],
      explanation: "Draw pin and fixed-support components in any direction; solve; a negative value means the real force points the other way, with that size.",
    },
    {
      prompt: "After $\\Sigma F_x = 0$, $\\Sigma F_y = 0$ and $\\Sigma M_A = 0$, you also write $\\Sigma M_B = 0$. What does it add?",
      options: [
        { text: "Nothing new: a body in a plane has only 3 independent equations", correct: true },
        { text: "A 4th equation, so you can find a 4th unknown", feedback: "It's true, but it follows from the other three. You still can only find 3 unknowns." },
        { text: "It contradicts the others", feedback: "It's consistent with them — it just doesn't tell you anything new." },
        { text: "It is only true if B is a support", feedback: "$\\Sigma M = 0$ holds about every point, support or not." },
      ],
      explanation: "In a plane there are exactly 3 independent equilibrium equations. An extra moment equation is a good CHECK of your answers, but not a way to find a 4th unknown.",
    },
    {
      prompt: "A beam carries a uniform load of 300 N/m over 4 m. For the equilibrium equations, it acts like…",
      options: [
        { text: "One 1200 N force at the middle of the loaded length", correct: true },
        { text: "One 300 N force at the middle", feedback: "300 N/m is the load per metre. The total is the area: 300 × 4 = 1200 N." },
        { text: "One 1200 N force at the end of the load", feedback: "The resultant acts at the centroid of the load's area — for a uniform load, its middle." },
        { text: "It can't be replaced; you need calculus", feedback: "For the reactions of a rigid body, a distributed load is equivalent to its resultant: its area at its centroid." },
      ],
      explanation: "For the reactions, replace a distributed load by its resultant: the area under the load, acting at the area's centroid.",
    },
  ],
  explanation: "Three equations, $\\Sigma F_x = 0$, $\\Sigma F_y = 0$ and $\\Sigma M_P = 0$, about a point P you choose to make the algebra easy.",
};
