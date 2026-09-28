// Unit 3.4, stage 3 — build: anchors B and C are fixed; the student places D on the ceiling so all
// three cables pull and none carries more than 45% of the crate's weight, and works out T_AD for
// their own design before each Test. The shares depend only on where D is, so the same places work
// for any crate (hand-worked on the 0.5 m grid: 10 of the 625 places, e.g. (1, 5, 9): T_AB = T_AC = 0.389 W,
// T_AD = 0.437 W; (1.5, 5, 9): 0.428, 0.354, 0.436 W). Start D (2, 3, 9): T_AD = 0.506 W — too much.

import { roomSetup } from "../library/particles3d.js";

const LIMIT = 0.45;

export default {
  id: "particles-3d/3-build",
  challenge: "build",
  solver: "statics.force3d",
  title: "Place the Third Anchor",
  mission: "Place anchor D so all three cables pull and none carries more than 45% of the weight.",
  instructions:
    "Cables AB and AC are fixed. Place the third anchor D on the ceiling (z = 9 m) with the sliders. The cables are thin: " +
    `**all three must pull, and none may carry more than ${LIMIT * 100}% of the crate's weight $W$**. Work out $T_{AD}$ for your design, then press **Test**.`,
  setup: { ...roomSetup(), groundCentre: [0, 0], keepInView: [[-6, -6, 9], [6, -6, 9], [6, 6, 9], [-6, 6, 9]] },
  vary: [{ path: "forces.#W.mass", min: 20, max: 80, step: 1 }],
  editable: [
    { path: "points.D.0", label: "Anchor D: x", min: -6, max: 6, step: 0.5, unit: "m" },
    { path: "points.D.1", label: "Anchor D: y", min: -6, max: 6, step: 0.5, unit: "m" },
  ],
  goal: {
    text: `All three tensions positive and at most ${LIMIT}\\,W.`,
    predict: [{ quantity: "T_AD" }],
    check(result) {
      const v = result.values;
      const ids = ["T_AB", "T_AC", "T_AD"];
      const name = (id) => id.replace("T_", "");
      const push = ids.filter((id) => !(v[id] > 0));
      if (push.length) return { ok: false, flagged: push, message: `Cable ${name(push[0])} would have to PUSH. Seen from above, ring A must be INSIDE the triangle B, C, D, so the three cables surround it.` };
      const limit = LIMIT * v.W;
      const over = ids.filter((id) => v[id] > limit);
      const share = (id) => `${(100 * v[id] / v.W).toFixed(1)}%`;
      if (over.length) return { ok: false, flagged: over, message: `${over.map((id) => `${name(id)} carries ${share(id)} of W`).join(" and ")} — over the ${(LIMIT * 100).toFixed(0)}% limit. A cable carries more when the others pull against it from nearly the same side: spread the anchors more evenly round A.` };
      return { ok: true, message: `All three pull, and none carries more than ${(LIMIT * 100).toFixed(0)}% of W: AB ${share("T_AB")}, AC ${share("T_AC")}, AD ${share("T_AD")}.` };
    },
  },
  hints: [
    "Seen from above, A must be inside the triangle B, C, D — otherwise a cable would have to push.",
    "For each place you try: $\\mathbf{u}_{AD} = \\mathbf{r}_{AD}/r_{AD}$, then solve the three equations. The shares of W don't depend on the crate's mass.",
    "The load shares most evenly when the three anchors are spread round A: B and C are both on the −y side, so D goes well out on the +y side.",
  ],
  explanation:
    "The tensions are proportional to the weight, so the SHARE each cable carries depends only on where the anchors are. Spread evenly round the ring, the cables share the load; " +
    "bunch them up and one cable carries most of it — or one would have to push and goes slack.",
};
