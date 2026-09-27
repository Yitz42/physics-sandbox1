// Unit 6.2, stage 5 — concept check: holes and negative areas.

export default {
  id: "holes/5-concept-check",
  challenge: "concept-check",
  title: "Negative Area",
  mission: "Show you understand how holes change a shape's centroid.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A hole is drilled in the RIGHT half of a uniform rectangular plate. Its centroid moves…",
      options: [
        { text: "left — away from the hole", correct: true },
        { text: "right — toward the hole", feedback: "The hole removes material on the right, so more of the plate is on the left: the balance point moves left, away from the hole." },
        { text: "nowhere — a hole has no weight", feedback: "The hole has no weight, but the material that used to be there did. Taking it away changes where the rest balances." },
        { text: "down", feedback: "A hole on the plate's middle line (top to bottom) takes equal material above and below it — only the side-to-side position changes." },
      ],
      explanation: "Removing material from one side leaves more on the other, so the centroid moves away from the hole.",
    },
    {
      prompt: "In the centroid table, a hole's area is…",
      options: [
        { text: "negative, and so is its first moment $\\tilde{x}A$", correct: true },
        { text: "negative, but its first moment $\\tilde{x}A$ is added", feedback: "Its first moment is its (negative) area times its position — so that's subtracted too." },
        { text: "left out: it isn't material", feedback: "Leaving it out treats the plate as if the hole weren't there. Include it with a NEGATIVE area to take it away." },
        { text: "positive, like any other part", feedback: "Adding it would put extra material where there's none. A hole takes area away: negative." },
      ],
      explanation: "A hole is a part with negative area: $-A_h$ in $\\Sigma A$, and $-\\tilde{x}_h A_h$ in $\\Sigma \\tilde{x} A$.",
    },
    {
      prompt: "An L-shape can be found as a big square minus a small square. Compared with splitting it into two rectangles, this gives…",
      options: [
        { text: "the same centroid", correct: true },
        { text: "a different centroid — subtracting is only an estimate", feedback: "Both are exact: the square minus the cut-out IS the L, so the area and first moments are the same." },
        { text: "the same area but a different centroid", feedback: "The first moments match too — it's the same shape, just split a different way." },
        { text: "a centroid inside the cut-out, which is wrong", feedback: "The centroid of an L may well lie in its empty corner — and both methods put it in the same spot." },
      ],
      explanation: "Any split that makes up the same shape gives the same centroid. Pick the one with the easiest parts — often a simple shape minus another.",
    },
    {
      prompt: "A round hole is drilled right at the centre of a uniform square plate. The centroid…",
      options: [
        { text: "stays at the centre", correct: true },
        { text: "moves toward a corner", feedback: "The hole takes equal material from every side, so nothing pulls the centroid any way: by symmetry it stays put." },
        { text: "disappears — it's inside the hole", feedback: "It's still the plate's centroid; it just sits in empty space, like a ring's." },
        { text: "moves down", feedback: "Nothing in the plate's shape favours down: it's still symmetric in every direction it was." },
      ],
      explanation: "The shape is still symmetric about both centre lines, so the centroid is where they cross — in the middle of the hole, off the material.",
    },
    {
      prompt: "A plate has a half-circle notch of radius r cut into its top edge. Where is the notch's centroid?",
      options: [
        { text: "$\\tfrac{4r}{3\\pi}$ below the top edge", correct: true },
        { text: "$\\tfrac{4r}{3\\pi}$ above the top edge", feedback: "The notch is cut INTO the plate, so its half circle bulges down from the top edge: its centroid is below it." },
        { text: "$\\tfrac{r}{2}$ below the top edge", feedback: "A half circle's centroid is $\\tfrac{4r}{3\\pi} \\approx 0.42r$ from its flat edge, not halfway out." },
        { text: "on the top edge", feedback: "That's the centre of the full circle. The half circle's area is all below the edge, so its centroid is too." },
      ],
      explanation: "A notch is a hole on the edge. Its centroid is where it would be as a solid half circle: $\\tfrac{4r}{3\\pi}$ from the flat edge, inside the plate.",
    },
  ],
  explanation: "Holes have negative area: subtract their area and first moments. The centroid moves away from a hole — or stays put if the hole is on a line of symmetry.",
};
