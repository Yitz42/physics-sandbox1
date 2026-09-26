// Unit 1, stage 5 — concept check: why vectors behave the way they do.
// Questions are drawn from this pool in random order; 3 correct answers finish it.

export default {
  id: "01-force-vectors/5-concept-check",
  challenge: "concept-check",
  solver: "statics.particle",
  title: "Vector Sense",
  mission: "Show you know how forces split into components and add as vectors.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "The force in the picture points down and to the left. What are the signs of its components?",
      setup: { analysis: "components", point: { at: [0, 0], label: "" }, forces: [{ id: "F", symbol: "F", magnitude: 250, direction: { angle: 35, from: "-x", toward: "-y" } }] },
      options: [
        { text: "$F_x < 0$ and $F_y < 0$", correct: true },
        { text: "$F_x > 0$ and $F_y < 0$", feedback: "Left is the −x direction, so a force pointing left has a negative x-component." },
        { text: "$F_x < 0$ and $F_y > 0$", feedback: "Down is the −y direction, so a force pointing down has a negative y-component." },
        { text: "It depends on the angle", feedback: "The angle changes the SIZES of the components, not their signs. Signs come only from which way the arrow points." },
      ],
      explanation: "Signs come from the direction: left → $F_x$ negative, down → $F_y$ negative. The angle only sets the sizes.",
    },
    {
      prompt: "A force's angle $\\theta$ is measured from the **y**-axis (as in the picture). Which expression gives the size of $F_y$?",
      setup: { analysis: "components", point: { at: [0, 0], label: "" }, forces: [{ id: "F", symbol: "F", magnitude: 300, direction: { angle: 25, from: "+y", toward: "+x" } }] },
      options: [
        { text: "$F\\cos\\theta$", correct: true },
        { text: "$F\\sin\\theta$", feedback: "$\\sin\\theta$ goes with the axis the angle is NOT measured from. Here that's x." },
        { text: "$F\\tan\\theta$", feedback: "$\\tan\\theta$ is a ratio of two components, not a component itself." },
        { text: "$F/\\cos\\theta$", feedback: "Dividing makes the component bigger than $F$ — but a component can never be larger than the force." },
      ],
      explanation: "The component along the axis the angle is measured from is \"adjacent\" to the angle, so it uses $\\cos\\theta$.",
    },
    {
      prompt: "Two forces of 300 N and 400 N act on the same point, in directions you can choose. Which resultant is **impossible**?",
      options: [
        { text: "50 N", correct: true },
        { text: "100 N", feedback: "Possible: point them in opposite directions and 400 − 300 = 100 N." },
        { text: "500 N", feedback: "Possible: at right angles, $\\sqrt{300^2 + 400^2} = 500$ N." },
        { text: "700 N", feedback: "Possible: point them the same way and 300 + 400 = 700 N." },
      ],
      explanation: "The resultant ranges from 400 − 300 = 100 N (opposite) to 400 + 300 = 700 N (same direction). 50 N is below that range.",
    },
    {
      prompt: "A 100 N force has $F_x = 100$ N. What is $F_y$?",
      options: [
        { text: "0 N", correct: true },
        { text: "100 N", feedback: "Then the force would be $\\sqrt{100^2 + 100^2} \\approx 141$ N, not 100 N." },
        { text: "50 N", feedback: "Components don't split the magnitude in half. Use $F^2 = F_x^2 + F_y^2$." },
        { text: "You can't tell without the angle", feedback: "You can: $F_y^2 = F^2 - F_x^2 = 100^2 - 100^2 = 0$." },
      ],
      explanation: "$F^2 = F_x^2 + F_y^2$. If $F_x$ is already the whole 100 N, nothing is left for $F_y$: the force is horizontal.",
    },
    {
      prompt: "Why can't you just add the sizes of two forces to get their resultant?",
      options: [
        { text: "Forces have direction, so they add like arrows (components add), not like plain numbers.", correct: true },
        { text: "You can, as long as you round at the end.", feedback: "Two 100 N forces pulling in opposite directions have a resultant of 0 N, not 200 N — rounding won't fix that." },
        { text: "Newtons can't be added together.", feedback: "They can: components in newtons add perfectly well. It's the directions that matter." },
        { text: "Only because of friction.", feedback: "Friction has nothing to do with it; this is true for any forces." },
      ],
      explanation: "Forces are vectors. Add their x-components, add their y-components, then find the size: $F_R = \\sqrt{F_{Rx}^2 + F_{Ry}^2}$.",
    },
    {
      prompt: "A force has components $F_x = -30$ N and $F_y = 40$ N. What is its magnitude?",
      options: [
        { text: "50 N", correct: true },
        { text: "10 N", feedback: "That's −30 + 40: you added the components. Use $\\sqrt{F_x^2 + F_y^2}$." },
        { text: "70 N", feedback: "That's 30 + 40. Components combine by Pythagoras, not by adding." },
        { text: "−50 N", feedback: "A magnitude is a size, so it's never negative. Direction is described separately." },
      ],
      explanation: "$F = \\sqrt{(-30)^2 + 40^2} = \\sqrt{900 + 1600} = 50$ N — a 3-4-5 triangle.",
    },
  ],
  hints: ["Draw a quick sketch: arrows, and the right triangle each force makes with the axes."],
  explanation: "Vectors carry direction as well as size. That's why we work with components.",
};
