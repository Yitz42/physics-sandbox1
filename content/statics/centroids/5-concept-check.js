// Unit 6.1, stage 5 — concept check: centroids and centres of gravity.

export default {
  id: "centroids/5-concept-check",
  challenge: "concept-check",
  title: "Balance Points",
  mission: "Show you understand what a centroid is and how to find one.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Where is a right triangle's centroid?",
      options: [
        { text: "⅓ of each leg from the right angle", correct: true },
        { text: "At the middle of each leg", feedback: "That's a rectangle's. A triangle has more area near its right angle, so its centroid is closer to it: ⅓ of each leg." },
        { text: "⅔ of each leg from the right angle", feedback: "That's measured from the wrong end: it's ⅓ from the right angle (⅔ from the pointed ends)." },
        { text: "At the right angle", feedback: "The centroid is inside the triangle, ⅓ of each leg from the right angle." },
      ],
      explanation: "A right triangle's centroid is ⅓ of each leg from the right angle — where most of its area is.",
    },
    {
      prompt: "A shape is made of a big part and a small part. Its centroid is…",
      options: [
        { text: "on the line between their centroids, nearer the big part", correct: true },
        { text: "halfway between the two parts' centroids", feedback: "Only if the parts had equal areas. Each counts in proportion to its area: $\\bar{x} = \\Sigma \\tilde{x}A / \\Sigma A$." },
        { text: "at the small part's centroid", feedback: "The bigger part pulls the centroid toward itself, not away." },
        { text: "anywhere — it depends on the origin", feedback: "The origin changes the NUMBERS, not the point. The centroid is always between the parts' centroids, nearer the bigger one." },
      ],
      explanation: "The centroid is an area-weighted average, so it lies on the line joining the parts' centroids, closer to the bigger part.",
    },
    {
      prompt: "Can a shape's centroid lie outside the material?",
      options: [
        { text: "Yes — e.g. an L-shape's centroid can sit in its empty corner", correct: true },
        { text: "No, never", feedback: "Think of a ring: its centroid is at the centre of the hole. An L-shape's can sit in its corner too." },
        { text: "Only for curved shapes", feedback: "An L made of two rectangles can have its centroid outside the material." },
        { text: "Only if you choose a bad origin", feedback: "The origin doesn't move the centroid, it only changes the numbers describing it." },
      ],
      explanation: "The centroid is an average position, not a point of the material: rings, L-shapes and C-shapes can have it in the empty space.",
    },
    {
      prompt: "A shape is symmetric about a vertical line. What can you say straight away?",
      options: [
        { text: "Its centroid lies on that line", correct: true },
        { text: "Its centroid is at the bottom of that line", feedback: "Symmetry fixes one coordinate (x̄ on the line), not the height ȳ." },
        { text: "Nothing, until you compute", feedback: "Symmetry gives x̄ for free: the areas on each side balance, so the centroid is on the line." },
        { text: "x̄ = ȳ", feedback: "Symmetry about a vertical line tells you x̄, not that x̄ equals ȳ." },
      ],
      explanation: "The area on each side of a line of symmetry balances, so the centroid lies on it: one coordinate needs no working.",
    },
    {
      prompt: "A bracket is part steel, part aluminium (lighter). Its centre of gravity is found with…",
      options: [
        { text: "the parts' weights: $\\bar{x} = \\Sigma \\tilde{x} W / \\Sigma W$", correct: true },
        { text: "the parts' areas: $\\bar{x} = \\Sigma \\tilde{x} A / \\Sigma A$", feedback: "That gives the centroid of the SHAPE. The steel part weighs more per square metre, so the weight acts nearer it: weigh by W." },
        { text: "the average of the parts' centroids", feedback: "Each part counts in proportion to its weight, not equally." },
        { text: "the heavier part's centroid", feedback: "Both parts count — the heavier one just counts more." },
      ],
      explanation: "The centre of gravity is where the weight acts: average the parts' centroids weighted by their weights. For one uniform material it's the same as the centroid.",
    },
  ],
  explanation: "Centroid: $\\bar{x} = \\Sigma \\tilde{x}A / \\Sigma A$, an area-weighted average (triangles ⅓ from the right angle, half circles $4r/3\\pi$). Centre of gravity: the same with weights. Symmetry gives a coordinate for free.",
};
