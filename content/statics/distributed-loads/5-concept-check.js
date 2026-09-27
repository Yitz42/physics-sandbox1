// Unit 6, stage 5 — concept check: what the resultant of a distributed load means.

export default {
  id: "distributed-loads/5-concept-check",
  challenge: "concept-check",
  title: "Area and Centroid",
  mission: "Show you know why a distributed load's resultant is its area at its centroid.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A distributed load is replaced by a single resultant force. How big is that force?",
      options: [
        { text: "The area under the load curve", correct: true },
        { text: "The largest value of $w$", feedback: "$w$ is a force per metre (N/m), not a force. The total force adds up $w$ over the whole length: the area." },
        { text: "The average of $w$", feedback: "Still N/m, not N. Multiply by the length (for a straight-topped load), or find the area." },
        { text: "$w$ times the length, always", feedback: "Only for a uniform load. A triangle's area is half of that: $\\tfrac{1}{2}wL$." },
      ],
      explanation: "Each short piece $dx$ of beam carries a force $w\\,dx$; adding them up gives $F_R = \\int w\\,dx$, the area under the curve.",
    },
    {
      prompt: "Where does the resultant of a distributed load act?",
      options: [
        { text: "At the centroid of the area under the load curve", correct: true },
        { text: "At the middle of the loaded length", feedback: "Only for a uniform load. A load that is heavier at one end has its resultant nearer that end." },
        { text: "Where the load is largest", feedback: "The resultant is pulled toward the heavy end, but the lighter parts still count: it's at the centroid of the whole area." },
        { text: "At O", feedback: "O is just where distances are measured from. The resultant acts where its moment about O matches the load's: the centroid." },
      ],
      explanation: "The single force must turn the beam as much as the load does, so it acts at $\\bar{x} = \\int x\\,w\\,dx / \\int w\\,dx$ — the centroid of the area.",
    },
    {
      prompt: "A triangular load grows from 0 at the left end to $w_0$ at the right end, over a length $L$. Where is its resultant?",
      options: [
        { text: "$\\tfrac{2}{3}L$ from the left end", correct: true },
        { text: "$\\tfrac{1}{3}L$ from the left end", feedback: "That's $\\tfrac{1}{3}L$ from the SHORT end. The centroid is $\\tfrac{1}{3}L$ from the TALL end — nearer where the load is heaviest." },
        { text: "$\\tfrac{1}{2}L$ from the left end", feedback: "The middle would suit a uniform load. Here the right end carries more, so the resultant is further right." },
        { text: "At the right end", feedback: "The lighter left part still counts, so the resultant is somewhat left of the tall end: at $\\tfrac{2}{3}L$." },
      ],
      explanation: "A triangle's centroid is $\\tfrac{1}{3}$ of its base from the tall side, which is $\\tfrac{2}{3}L$ from the pointed end.",
    },
    {
      prompt: "A load of 400 N/m acts uniformly along 5 m of a beam. What single force replaces it?",
      options: [
        { text: "2000 N at the middle of the 5 m", correct: true },
        { text: "400 N at the middle", feedback: "400 N/m is the load on EACH metre. Five metres carry $400 \\times 5 = 2000$ N." },
        { text: "1000 N at the middle", feedback: "That's half the area — the ½ belongs to triangles, not rectangles." },
        { text: "2000 N at the end", feedback: "The size is right, but a uniform load is symmetric, so its resultant is at the middle." },
      ],
      explanation: "A uniform load is a rectangle: $F_R = wL = 400 \\times 5 = 2000$ N, at its middle.",
    },
    {
      prompt: "A load rises steadily from $w_A$ at one end to a bigger $w_B$ at the other (a trapezoid). What's the easiest way to find its resultant?",
      options: [
        { text: "Split it into a rectangle and a triangle, then combine their two resultants", correct: true },
        { text: "Use the average $w$ at the middle of the length", feedback: "The average gives the right SIZE, but not the right place: a trapezoid's resultant is nearer its taller end." },
        { text: "Treat it as a rectangle of height $w_B$", feedback: "That overcounts: it adds a triangle of load that isn't there." },
        { text: "Treat it as a triangle of height $w_B$", feedback: "That misses the rectangle of load under $w_A$." },
      ],
      explanation: "Rectangle $w_AL$ at the middle, plus triangle $\\tfrac{1}{2}(w_B - w_A)L$ at $\\tfrac{1}{3}L$ from the tall end; then $\\bar{x} = \\Sigma F\\tilde{x} / F_R$.",
    },
    {
      prompt: "A load follows the curve $w = w_0(x/L)^2$: zero at O, $w_0$ at $x = L$. Compared with a straight triangle from 0 to $w_0$, its resultant is…",
      options: [
        { text: "Smaller, and nearer the tall end", correct: true },
        { text: "The same as the triangle's", feedback: "The curve sags below the straight line, so there's less area: $\\int_0^L w_0(x/L)^2 dx = \\tfrac{1}{3}w_0L$, not $\\tfrac{1}{2}w_0L$." },
        { text: "Bigger, and nearer O", feedback: "The curve lies BELOW the triangle's straight edge, so it has less area, and what remains is bunched near the tall end." },
        { text: "Smaller, and at the middle", feedback: "Less area, yes — but it's concentrated near the tall end: $\\bar{x} = \\tfrac{3}{4}L$." },
      ],
      explanation: "Integrating gives $F_R = \\tfrac{1}{3}w_0L$ (less than the triangle's $\\tfrac{1}{2}w_0L$) at $\\bar{x} = \\tfrac{3}{4}L$ (beyond the triangle's $\\tfrac{2}{3}L$).",
    },
    {
      prompt: "You've replaced a distributed load with its resultant to find a beam's support reactions. Can you use the same resultant to find the forces INSIDE the beam at a cut?",
      options: [
        { text: "No — at a cut, only the part of the load on one side of it counts", correct: true },
        { text: "Yes — the resultant is equivalent in every way", feedback: "It's equivalent for the beam as a whole (reactions). Inside the beam, how the load is spread matters: each piece of beam carries only its own share." },
        { text: "Yes, if the load is uniform", feedback: "Even then, a cut splits the load: each side carries its own part, with its own resultant." },
        { text: "No — distributed loads can never be replaced", feedback: "They can, for the whole body. At a cut, replace just the part on one side of it." },
      ],
      explanation: "A resultant has the same EXTERNAL effect as the load. For internal forces (Chapter 8) you cut the beam and replace only the load on one side of the cut.",
    },
  ],
  hints: ["Size = area under the load curve. Position = centroid of that area."],
  explanation: "A distributed load is equivalent to one force equal to its area, acting at the centroid of that area — for the beam as a whole.",
};
