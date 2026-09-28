// Unit 10.1, stage 5 — concept check: what the area moment of inertia means.

export default {
  id: "inertia/5-concept-check",
  challenge: "concept-check",
  title: "Inertia Insights",
  mission: "Show you understand what makes a section stiff.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "An I-beam and a solid rectangle have the same area (the same steel). For bending about the horizontal axis…",
      options: [
        { text: "the I-beam has the bigger I: its area is further from the axis", correct: true },
        { text: "they have the same I — same area", feedback: "I depends on where the area is, squared: $\\int y^2 dA$. The same area further out gives much more." },
        { text: "the rectangle has the bigger I: it's solid", feedback: "Being solid puts lots of area near the axis, where it adds almost nothing to I." },
        { text: "it depends only on the beam's length", feedback: "I is a property of the cross-section alone; the length doesn't come into it." },
      ],
      explanation: "The flanges sit far from the centroid, so their $A d^2$ is huge. That's why beams are I-shaped.",
    },
    {
      prompt: "About which of a set of parallel axes is a shape's moment of inertia smallest?",
      options: [
        { text: "the one through its centroid", correct: true },
        { text: "the one along its bottom edge", feedback: "About the base, $I = \\bar{I} + A d^2$ with d = h/2 — bigger than $\\bar{I}$." },
        { text: "they're all equal", feedback: "Only if $A d^2$ were zero for all of them — it's zero only through the centroid." },
        { text: "the one furthest away", feedback: "That's the BIGGEST: $A d^2$ grows with distance squared." },
      ],
      explanation: "$I = \\bar{I} + A d^2$, and $A d^2 \\ge 0$: the centroidal axis gives the least.",
    },
    {
      prompt: "In the parallel-axis theorem $I = \\bar{I} + A d^2$, d is the distance…",
      options: [
        { text: "between the shape's centroid and the new axis", correct: true },
        { text: "from the new axis to the far edge of the shape", feedback: "d runs between two parallel axes: the one through the centroid (where Ī is) and the new one." },
        { text: "from the bottom of the whole section", feedback: "Only if the new axis happens to be the bottom. For Ī_x of a section, d goes to the section's centroid." },
        { text: "across the shape (its height)", feedback: "The height is already in Ī. d is how far the shape's centroid is from the axis." },
      ],
      explanation: "Ī must be about the shape's OWN centroid; d is how far that is from the axis you want.",
    },
    {
      prompt: "A rectangle's $\\bar{I} = bh^3/12$ about its horizontal centroidal axis. Doubling its WIDTH b…",
      options: [
        { text: "doubles I", correct: true },
        { text: "multiplies I by 8", feedback: "That's what doubling the HEIGHT does (h is cubed). The width is only to the first power." },
        { text: "multiplies I by 4", feedback: "b isn't squared. Twice as wide is just twice as much area at the same distances: 2×." },
        { text: "doesn't change I", feedback: "More area at every height still adds to $\\int y^2 dA$: I doubles." },
      ],
      explanation: "b appears to the first power: twice the width, twice the area at each height, twice I.",
    },
    {
      prompt: "A small round hole is drilled in a beam's web, right at the section's centroid. Its effect on $\\bar{I}_x$ is…",
      options: [
        { text: "small — the area removed is near the axis", correct: true },
        { text: "large — any hole weakens a beam a lot", feedback: "Near the axis, y is small, so y² dA is tiny. Holes near the centroid barely change I." },
        { text: "zero — holes don't count", feedback: "The hole's own Ī is still taken away; it's just small." },
        { text: "it increases I", feedback: "Removing material can only lower I (every y² dA is positive)." },
      ],
      explanation: "The hole takes away its own small Ī and no $A d^2$ (d = 0). Holes far from the centroid, in the flanges, would cost much more.",
    },
  ],
};
