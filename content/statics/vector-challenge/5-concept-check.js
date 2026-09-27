// Unit 2.4, stage 5 — concept check: the ideas behind the chapter's harder problems.
// Questions are drawn from this pool in random order; 3 correct answers finish it.

export default {
  id: "vector-challenge/5-concept-check",
  challenge: "concept-check",
  title: "Think It Through",
  mission: "Show you can reason about forces in situations you haven't seen before.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "$F_1$ is fixed. You add a force $F_2$ so the resultant $F_1 + F_2$ points along the x-axis. For $F_2$ to be as **small** as possible, it should point…",
      options: [
        { text: "at right angles to the x-axis (straight up or down, whichever cancels $F_{1y}$)", correct: true },
        { text: "exactly opposite to $F_1$", feedback: "That cancels ALL of $F_1$ (resultant zero) and needs $F_2 = F_1$. Only $F_{1y}$ needs cancelling." },
        { text: "along the x-axis", feedback: "A force along x has no y-part, so it can't cancel $F_{1y}$: the resultant would still point off the x-axis." },
        { text: "at 45°, halfway between", feedback: "At 45°, half of $F_2$'s effort goes into x, which doesn't help steer. The smallest $F_2$ puts all of itself into cancelling $F_{1y}$." },
      ],
      explanation: "Only $F_2$'s part across the x-axis does the steering: $F_{2y} = -F_{1y}$. The smallest force with that y-part has no x-part at all — it is perpendicular to the resultant's line.",
    },
    {
      prompt: "A 500 N force is split into components along two axes u and v that are **not** at right angles. Which is true?",
      options: [
        { text: "A component can be bigger than 500 N.", correct: true },
        { text: "Each component is 500 N × cos(angle between the force and that axis).", feedback: "That's the PROJECTION onto the axis. It equals the component only when u and v are at right angles; otherwise the two components must be solved together (parallelogram law)." },
        { text: "The two components add up to 500 N.", feedback: "They add as ARROWS (vectors) to make the 500 N force, not as numbers — their sizes can add up to much more." },
        { text: "Neither component can be bigger than the force.", feedback: "That's only true for perpendicular axes. When u and v are far apart, both components can be larger than the force (try u and v 140° apart)." },
      ],
      explanation: "With slanted axes the parallelogram of components can be long and thin: the components can each be bigger than the force they add up to. Only for perpendicular axes are components the same as projections.",
    },
    {
      prompt: "Can a force in space have α = β = γ = 45°?",
      options: [
        { text: "No: $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma$ would be 1.5, not 1.", correct: true },
        { text: "Yes: it points equally between all three axes.", feedback: "A force equally between the axes has $\\cos\\alpha = \\cos\\beta = \\cos\\gamma = 1/\\sqrt{3}$, so each angle is 54.7°, not 45°." },
        { text: "Yes, if the force is big enough.", feedback: "Direction angles don't depend on the size: they come from the unit vector, whose length is always 1." },
        { text: "Only if it lies in the x-y plane.", feedback: "A force in the x-y plane has γ = 90°." },
      ],
      explanation: "The cosines of the direction angles are the parts of a unit vector, so their squares must add to 1. Three angles of 45° give $3 \\times 0.5 = 1.5$: impossible.",
    },
    {
      prompt: "Three 100 N forces act at one point, 120° apart. What is their resultant?",
      options: [
        { text: "0 N", correct: true },
        { text: "300 N", feedback: "That adds the sizes as if all three pointed the same way. Add components: they cancel." },
        { text: "100 N", feedback: "Any two of them add to a 100 N force pointing exactly opposite the third — so all three cancel." },
        { text: "It depends which force you start with.", feedback: "Vector addition doesn't depend on the order: $F_1 + F_2 + F_3 = F_3 + F_1 + F_2$." },
      ],
      explanation: "Put one along +x: the other two each have $F_x = 100\\cos 120^\\circ = -50$ N, cancelling it, and their y-parts ($\\pm 86.6$ N) cancel each other. The resultant is zero.",
    },
    {
      prompt: "You know a resultant exactly (size and direction) and the directions of two ropes that make it, but not their tensions. How many tensions can you find?",
      options: [
        { text: "Both: $F_{Rx} = \\Sigma F_x$ and $F_{Ry} = \\Sigma F_y$ are two equations for two unknowns.", correct: true },
        { text: "Only one: you only have one resultant.", feedback: "The resultant gives TWO numbers, $F_{Rx}$ and $F_{Ry}$ — one equation each." },
        { text: "Both, but only if the ropes are at right angles.", feedback: "Any two directions work, as long as they're not along the same line. At right angles the algebra is just easier." },
        { text: "None, without the ropes' angles in degrees.", feedback: "Coordinates or slopes give the directions just as well as angles do." },
      ],
      explanation: "In the plane, a known resultant gives two equations, so it can find any two unknowns — two sizes, or one force's size and angle. A third unknown would need more information.",
    },
    {
      prompt: "A student writes a unit vector as $\\mathbf{u} = 0.6\\,\\mathbf{i} + 0.6\\,\\mathbf{j}$. What's wrong?",
      options: [
        { text: "Its length is $\\sqrt{0.6^2 + 0.6^2} \\approx 0.85$, not 1.", correct: true },
        { text: "Nothing: both parts are between −1 and 1.", feedback: "Being between −1 and 1 is needed but not enough: the squares must add to exactly 1." },
        { text: "Its parts should add up to 1.", feedback: "The SQUARES add up to 1: $u_x^2 + u_y^2 = 1$. (0.6 and 0.8 is a real one: 0.36 + 0.64 = 1.)" },
        { text: "A unit vector can't have two equal parts.", feedback: "It can: $0.707\\,\\mathbf{i} + 0.707\\,\\mathbf{j}$ points at 45° and has length 1." },
      ],
      explanation: "A unit vector has length 1: $u_x^2 + u_y^2 = 1$. A quick check like this catches a wrong division by $r_{AB}$ before it spoils a whole problem.",
    },
    {
      prompt: "You turn your x-y axes by 30° and work a problem again. What changes?",
      options: [
        { text: "The components — but not the forces' sizes or the resultant itself.", correct: true },
        { text: "The size of the resultant.", feedback: "The resultant is a real push on the object: it can't depend on how you draw your axes. Only its components change." },
        { text: "Nothing, not even the components.", feedback: "Components are measured along the axes, so turning the axes changes them." },
        { text: "Every force's size.", feedback: "Sizes are lengths of arrows — they don't depend on the axes." },
      ],
      explanation: "Axes are a choice you make to do the arithmetic. Components depend on that choice; sizes, directions in the picture and the resultant do not. Choosing an axis along an unknown force can even make a problem easier.",
    },
  ],
};
