// Cartesian vectors, stage 5 — concept check: i and j, unit vectors, position vectors.
// Questions are drawn from this pool in random order; 3 correct answers finish it.

export default {
  id: "cartesian-vectors/5-concept-check",
  challenge: "concept-check",
  solver: "statics.particle",
  title: "Cartesian Sense",
  mission: "Show you know how to write a force with $\\mathbf{i}$ and $\\mathbf{j}$.",
  instructions: "Answer 3 questions about writing forces with $\\mathbf{i}$ and $\\mathbf{j}$. Every wrong choice explains the misconception behind it.",
  required: 3,
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
};
