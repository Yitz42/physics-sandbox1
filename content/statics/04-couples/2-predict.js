// Unit 4, stage 2 — predict: the force of an equivalent couple.
// Hand check (default numbers): M = Fd = 120(0.5) = 60 N·m counterclockwise.
//   The new forces are 0.3 m apart: F'(0.3) = 60  →  F' = 200 N.

export default {
  id: "04-couples/2-predict",
  challenge: "predict",
  solver: "statics.couple",
  title: "Replace the Couple",
  instructions:
    "The couple on the left (forces $F$ at A and B) must be replaced by a couple of forces $F'$ at C and D that has **exactly the same effect** on the plate. " +
    "How big must $F'$ be? Predict it, then press **Test**.",
  setup: {
    analysis: "couple",
    plates: [{ from: [0, 0], to: [0.5, 0.3] }, { from: [1, 0], to: [1.5, 0.3] }],
    texts: [{ at: [0.75, 0.02], text: "same effect as" }],
    forceScale: 800, // arrows drawn 1 m per 800 N, so F and F' can be compared by eye
    couples: [
      // F up at B and down at A: vertical lines 0.5 m apart (A to B diagonally is 0.583 m).
      { id: "C1", symbol: "F", magnitude: 120, direction: "up", at: [0.5, 0.3], opposite: [0, 0], pointLabels: ["B", "A"], dimShift: 0.16 },
      // F' left at C and right at D: horizontal lines 0.3 m apart.
      { id: "C2", symbol: "F'", dSymbol: "d'", magnitude: null, equivalentTo: "C1", direction: "left", at: [1, 0.3], opposite: [1.5, 0], pointLabels: ["C", "D"], dimShift: 0.72 },
    ],
    showSeparation: true, // d and d' are given, so they're drawn from the start
    momentAt: [0.25, 0.15], // the original couple's moment is drawn on its own plate
  },
  view: { xmin: -0.2, xmax: 1.95, ymin: -0.3, ymax: 0.72 },
  vary: [{ path: "couples.#C1.magnitude", values: [60, 90, 120, 150, 180, 240] }],
  ask: [{ quantity: "C2" }],
  hints: [
    "Two couples have the same effect when they have the same moment, turning the same way.",
    "First find the moment of the given couple: $M = Fd$.",
    "Then $F'd' = M$, so $F' = M / d'$. Forces that are closer together must be bigger.",
  ],
  explanation:
    "A couple's whole effect is its moment $M = Fd$. Any couple with the same moment and the same turning sense is **equivalent**, " +
    "wherever its forces act and whichever way they point. Here the new forces are closer together than the old ones, so each has to be bigger: $F' = M / d'$.",
};
