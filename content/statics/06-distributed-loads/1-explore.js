// Unit 6, stage 1 — explore: shape a distributed load and watch its resultant.
// Hand check (default numbers), load 200 → 600 N/m over 6 m:
//   rectangle 200(6) = 1200 N at 3 m;  triangle ½(400)(6) = 1200 N at 4 m
//   F_R = 2400 N,  x̄ = (1200·3 + 1200·4) / 2400 = 3.5 m.

export default {
  id: "06-distributed-loads/1-explore",
  challenge: "explore",
  solver: "statics.distributed",
  title: "Shape the Load",
  mission: "Shape the load on the beam and watch its single resultant force move.",
  instructions:
    "Sand is piled along a 6 m beam. Its **intensity** $w$ (newtons per metre of beam) changes steadily from the left end to the right end. " +
    "The dashed purple arrow is the single force with the same effect: $F_R$ equals the **area** of the load, acting at its **centroid**. " +
    "The grey arrows are the rectangle and triangle it splits into. Change the ends and watch.",
  setup: {
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [6, 0]] },
    loadScale: 1000, // drawn 1 m tall per 1000 N/m, so the picture shows the real sizes
    showParts: true,
    showResultant: true,
    resultantDimOffset: -0.45,
    loads: [{ id: "w", shape: "linear", from: 0, to: 6, w: [200, 600] }],
  },
  view: { xmin: -0.7, xmax: 6.7, ymin: -0.9, ymax: 2.6 },
  editable: [
    { path: "loads.#w.w.0", label: "w at the left end", min: 0, max: 1200, step: 100, unit: "N/m" },
    { path: "loads.#w.w.1", label: "w at the right end", min: 0, max: 1200, step: 100, unit: "N/m" },
  ],
  tasks: [
    { text: "Make the load **uniform** (the same all along). Where does $F_R$ act?", check: (v, s) => s.loads[0].w[0] === s.loads[0].w[1] && s.loads[0].w[0] > 0 },
    { text: "Make a **triangle**, tallest at the right end. Where does $F_R$ act now?", check: (v, s) => s.loads[0].w[0] === 0 && s.loads[0].w[1] > 0 },
    { text: "Make $F_R = 3600$ N.", check: (v) => Math.abs(v.R - 3600) <= 0.1 },
    { text: "Make the resultant act at $\\bar{x} = 2.5$ m.", check: (v) => v.pos != null && Math.abs(v.pos - 2.5) <= 0.01 },
  ],
  hints: [
    "$F_R$ is the area under the load: for a straight-topped load, the average height times the length, $\\tfrac{1}{2}(w_A + w_B)L$.",
    "A uniform load's resultant is at the middle; a triangle's is $\\tfrac{1}{3}$ of the length from its tall end.",
    "To move the resultant left, pile more on the left.",
  ],
  explanation:
    "A distributed load acts like one force equal to its area, placed at the centroid of that area: the middle of a rectangle, " +
    "$\\tfrac{1}{3}$ of the base from a triangle's tall end. A trapezoid is a rectangle plus a triangle, and their two resultants combine like any two loads: " +
    "$\\bar{x} = \\Sigma F\\tilde{x} / F_R$.",
};
