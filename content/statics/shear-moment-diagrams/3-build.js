// Unit 8.2, stage 3 — build: place the roller so the largest bending moment is as small as
// possible (balance the sag in the span against the overhang's hogging over B).
// Pin A (0), roller B (b), beam 6 m, w all along: A_y = 6w(b − 3)/b.
//   In the span: M_max+ = A_y²/(2w);  over B: M_B = −w(6 − b)²/2.
// |M| ≤ 500 N·m everywhere needs  b ≤ 5400/(6w − √(1000w))… i.e. (w = 300) 4.174 ≤ b ≤ 4.311;
//   w = 255: 4.06 … 4.47;  w = 305: 4.19 … 4.30 — the 0.05 m slider always has a spot (4.2, 4.25).
// Start: b = 5 → A_y = 2.4w, M+ = 2.88w ≥ 734 N·m (never already done).

const LIMIT = 500; // N·m

export default {
  id: "shear-moment-diagrams/3-build",
  challenge: "build",
  solver: "statics.internal",
  title: "Balance the Bending",
  mission: "Place the roller so the beam never bends more than it can take.",
  instructions:
    `A beam carries a uniform load along its whole length. It is pinned at A; you choose where the roller B goes. The beam can take a bending moment of ${LIMIT} N·m, either way. ` +
    "Too far out and it sags too much in the span; too far in and the overhang bends it too much over B. Find a spot where both are small enough, work out the moment over B on paper, then press **Test**.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [5, 0] }],
    loads: [{ id: "w", shape: "uniform", from: 0, to: 6, w: 300 }],
    view: "diagrams",
    showDiagrams: true,
    knownReactions: true,
  },
  view: { xmin: -1.4, xmax: 7.2, ymin: -7.9, ymax: 2.4 },
  tallPicture: true,
  vary: [{ path: "loads.#w.w", min: 255, max: 305, step: 1 }],
  editable: [{ path: "supports.1.at.0", label: "Roller B position", min: 3.5, max: 5.5, step: 0.05, unit: "m" }],
  goal: {
    text: `The bending moment is at most **${LIMIT} N·m** everywhere (sagging or hogging).`,
    predict: [{ quantity: "Mneg" }],
    check(result) {
      const v = result.values;
      if (Math.abs(v.Mmax) > LIMIT + 1e-9) {
        const span = v.Mpos >= -v.Mneg;
        return { ok: false, message: span
          ? `The span sags too much: M reaches ${v.Mpos.toFixed(0)} N·m. Move B toward A — a shorter span, a longer overhang.`
          : `The overhang bends the beam too much over B: M = ${v.Mneg.toFixed(0)} N·m there. Move B out toward the end.` };
      }
      return { ok: true, message: `Largest moment ${Math.abs(v.Mmax).toFixed(0)} N·m: the sag in the span (${v.Mpos.toFixed(0)} N·m) and the hogging over B (${v.Mneg.toFixed(0)} N·m) are nearly balanced.` };
    },
  },
  hints: [
    "Watch the M diagram: a hump in the span (positive) and a dip over B (negative). Make both small.",
    "Over B, only the overhang bends the beam: $M_B = -w\\,\\dfrac{c^2}{2}$, with c the overhang's length.",
    "The best spot makes the hump and the dip about the same size.",
  ],
  explanation:
    "Moving the support in shortens the span (less sag) but lengthens the overhang (more hogging). The smallest largest-moment is where the two are about equal — " +
    "near b = 0.7L here. Engineers place supports this way to use the lightest beam.",
};
