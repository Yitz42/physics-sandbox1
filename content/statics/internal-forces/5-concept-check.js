// Unit 8.1, stage 5 — concept check: internal forces and their signs.

export default {
  id: "internal-forces/5-concept-check",
  challenge: "concept-check",
  title: "Forces Inside",
  mission: "Show you understand the forces inside a beam.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "You cut a beam at C. The forces on the two cut faces are…",
      options: [
        { text: "equal and opposite (Newton's third law)", correct: true },
        { text: "the same on both faces, same direction", feedback: "Each face pushes on the other: the forces on the two faces are equal and OPPOSITE, like at a pin between two bodies." },
        { text: "zero — they're inside the beam", feedback: "They cancel for the beam as a whole, but each piece on its own needs them to stay in equilibrium." },
        { text: "only on the piece with the load", feedback: "Both pieces feel them — equal and opposite." },
      ],
      explanation: "Internal forces come in equal and opposite pairs, which is why the same N, V and M describe both faces — with the sign convention flipping their drawn directions.",
    },
    {
      prompt: "A simply supported beam sags under its load. Its bending moment in the middle is…",
      options: [
        { text: "positive — it bends into a smile (concave up)", correct: true },
        { text: "negative — the load pushes down", feedback: "The sign comes from the SHAPE, not the load's direction: sagging (a smile) is positive." },
        { text: "zero — the supports hold it", feedback: "M is zero at the pinned ends, not in the middle, where the beam bends most." },
        { text: "it depends on which piece you keep", feedback: "The sign convention is set up so both pieces give the SAME M — that's the point of it." },
      ],
      explanation: "Positive M bends a beam concave up (sagging), negative concave down (hogging, like a cantilever). Both pieces give the same M.",
    },
    {
      prompt: "Which piece is usually easier to keep?",
      options: [
        { text: "the one with fewer forces — often the one without a support", correct: true },
        { text: "always the left one", feedback: "Either works. A piece with no support on it (a cantilever's free end) needs no reactions at all." },
        { text: "the longer one", feedback: "Length doesn't matter — the number of forces (and unknown reactions) on it does." },
        { text: "the one with the distributed load", feedback: "More load on a piece means more terms to write. Pick the simpler piece." },
      ],
      explanation: "Both pieces give the same answer. Keep the one with fewer forces on it — a cantilever's free piece needs no reactions.",
    },
    {
      prompt: "A uniform load covers the whole beam, and you cut at C. In the left piece's equations, the load counts as…",
      options: [
        { text: "w times the piece's length, at the piece's middle", correct: true },
        { text: "the whole load wL, at the beam's middle", feedback: "Only the part of the load ON the piece acts on it. Cut the load at C too." },
        { text: "w times the piece's length, at C", feedback: "The resultant acts at the centroid of the load on the piece — its middle, not the cut." },
        { text: "nothing — only point loads count", feedback: "A distributed load on the piece acts on it: replace that part by its resultant." },
      ],
      explanation: "Cut the distributed load where you cut the beam: the part on the piece is replaced by its own resultant at its own centroid.",
    },
    {
      prompt: "You solve and find V = −300 N. This means…",
      options: [
        { text: "V really acts opposite to the way it was drawn (the positive direction)", correct: true },
        { text: "you made a mistake — V can't be negative", feedback: "A negative answer is fine: you drew V in its positive direction, and it turned out to act the other way." },
        { text: "the beam is in compression", feedback: "Compression is about N (along the beam). V is the shear, across it." },
        { text: "the cut is in the wrong place", feedback: "Any cut works. The sign just tells you which way the shear acts there." },
      ],
      explanation: "Draw N, V and M in their positive directions; the signs of the answers then tell you how they really act.",
    },
  ],
  explanation: "Internal forces: equal and opposite on the two faces. N + tension, V + down on a left face, M + sagging. Keep the easier piece and count only the loads on it.",
};
