// Unit 1, stage 5 — concept check, in two parts. Questions are drawn from
// each part's pool in random order; `required` correct answers finish a part.
//   1. why vectors behave the way they do (3 questions);
//   2. Cartesian vectors: i and j, unit vectors, position vectors (2 questions).

export default {
  id: "01-force-vectors/5-concept-check",
  challenge: "concept-check",
  solver: "statics.particle",
  title: "Vector Sense",
  parts: [
    {
      title: "Vectors",
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
    },
    {
      title: "Cartesian vectors",
      instructions: "Answer 2 questions about writing forces with $\\mathbf{i}$ and $\\mathbf{j}$. Every wrong choice explains the misconception behind it.",
      required: 2,
      questions: [
        {
          prompt: "A unit vector $\\mathbf{u}$ points along a 500 N force. How long is $\\mathbf{u}$, and what is its unit?",
          options: [
            { text: "Length 1, no unit", correct: true },
            { text: "Length 500, in N", feedback: "That's the force itself. The unit vector is the force divided by its size: $\\mathbf{u} = \\mathbf{F}/F$, so the newtons cancel." },
            { text: "Length 1, in N", feedback: "Dividing newtons by newtons leaves no unit. A unit vector is a pure direction." },
            { text: "It depends on the angle", feedback: "The angle sets which way $\\mathbf{u}$ points, but its length is always 1: $u_x^2 + u_y^2 = 1$." },
          ],
          explanation: "$\\mathbf{u} = \\mathbf{F}/F$ has length 1 and no unit: it only carries the direction. The size comes back when you multiply: $\\mathbf{F} = F\\,\\mathbf{u}$.",
        },
        {
          prompt: "Point A is at (2, 1) m and point B at (5, 5) m. What is the position vector $\\mathbf{r}_{AB}$ from A to B?",
          options: [
            { text: "$\\{3\\,\\mathbf{i} + 4\\,\\mathbf{j}\\}$ m", correct: true },
            { text: "$\\{5\\,\\mathbf{i} + 5\\,\\mathbf{j}\\}$ m", feedback: "That's B's position measured from the origin. From A to B you subtract A's coordinates: $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$." },
            { text: "$\\{-3\\,\\mathbf{i} - 4\\,\\mathbf{j}\\}$ m", feedback: "That goes from B to A. From A TO B is (B's coordinates) − (A's coordinates)." },
            { text: "$\\{7\\,\\mathbf{i} + 6\\,\\mathbf{j}\\}$ m", feedback: "Coordinates are subtracted, not added: the change from A to B is 5 − 2 across and 5 − 1 up." },
          ],
          explanation: "$\\mathbf{r}_{AB} = (x_B - x_A)\\,\\mathbf{i} + (y_B - y_A)\\,\\mathbf{j} = (5 - 2)\\,\\mathbf{i} + (5 - 1)\\,\\mathbf{j} = \\{3\\,\\mathbf{i} + 4\\,\\mathbf{j}\\}$ m, and $r_{AB} = 5$ m.",
        },
        {
          prompt: "A cable force has $F = 200$ N and unit vector $\\mathbf{u} = 0.6\\,\\mathbf{i} - 0.8\\,\\mathbf{j}$. What is $\\mathbf{F}$?",
          options: [
            { text: "$\\{120\\,\\mathbf{i} - 160\\,\\mathbf{j}\\}$ N", correct: true },
            { text: "$\\{0.6\\,\\mathbf{i} - 0.8\\,\\mathbf{j}\\}$ N", feedback: "That's just the direction. Multiply every part by the size: $\\mathbf{F} = F\\,\\mathbf{u}$." },
            { text: "$\\{120\\,\\mathbf{i} + 160\\,\\mathbf{j}\\}$ N", feedback: "The minus sign in $\\mathbf{u}$ carries through: this force points down, so $F_y$ is negative." },
            { text: "$\\{333\\,\\mathbf{i} - 250\\,\\mathbf{j}\\}$ N", feedback: "That's $F$ divided by each part. Multiply instead: $F_x = F u_x = 200(0.6)$." },
          ],
          explanation: "$\\mathbf{F} = F\\,\\mathbf{u} = 200(0.6\\,\\mathbf{i} - 0.8\\,\\mathbf{j}) = \\{120\\,\\mathbf{i} - 160\\,\\mathbf{j}\\}$ N. Check: $\\sqrt{120^2 + 160^2} = 200$ N.",
        },
        {
          prompt: "What is the unit vector along $\\mathbf{r} = \\{6\\,\\mathbf{i} - 8\\,\\mathbf{j}\\}$ m?",
          options: [
            { text: "$0.6\\,\\mathbf{i} - 0.8\\,\\mathbf{j}$", correct: true },
            { text: "$6\\,\\mathbf{i} - 8\\,\\mathbf{j}$", feedback: "That's $\\mathbf{r}$ itself (10 m long). Divide by its length $r = \\sqrt{6^2 + 8^2} = 10$ m." },
            { text: "$0.43\\,\\mathbf{i} - 0.57\\,\\mathbf{j}$", feedback: "That divides by 6 + 8 = 14. The length is found with Pythagoras: $\\sqrt{6^2 + 8^2} = 10$." },
            { text: "$0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$", feedback: "Dividing by the (positive) length keeps each sign: the y part stays negative." },
          ],
          explanation: "$r = \\sqrt{6^2 + (-8)^2} = 10$ m, so $\\mathbf{u} = \\mathbf{r}/r = 0.6\\,\\mathbf{i} - 0.8\\,\\mathbf{j}$ — length 1, same direction as $\\mathbf{r}$.",
        },
        {
          prompt: "Anchor B of a cable is moved further out along the same line, so the cable from A gets twice as long. The cable's tension $T$ stays the same. What happens to $\\mathbf{T}$?",
          options: [
            { text: "Nothing: same size, same direction", correct: true },
            { text: "It doubles", feedback: "$\\mathbf{r}_{AB}$ doubles, but so does its length $r_{AB}$, so $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$ is unchanged. The size is still $T$." },
            { text: "It halves", feedback: "The cable's length doesn't set the force. Only its direction $\\mathbf{u}_{AB}$ and the tension $T$ do." },
            { text: "Its direction changes", feedback: "B moved along the same line, so the direction from A to B hasn't changed." },
          ],
          explanation: "$\\mathbf{T} = T\\,\\mathbf{u}_{AB}$, and $\\mathbf{u}_{AB}$ depends only on the direction from A to B, not on how far away B is.",
        },
      ],
      hints: ["Remember: $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$, $\\mathbf{u} = \\mathbf{r}/r$, and $\\mathbf{F} = F\\,\\mathbf{u}$."],
      explanation: "Cartesian form keeps size and direction together: $\\mathbf{F} = F\\,\\mathbf{u} = F_x\\,\\mathbf{i} + F_y\\,\\mathbf{j}$, with $\\mathbf{u}$ a pure direction of length 1.",
    },
  ],
  explanation: "Vectors carry direction as well as size. That's why we work with components, and why a unit vector (length 1, no unit) is so handy for writing direction on its own.",
};
