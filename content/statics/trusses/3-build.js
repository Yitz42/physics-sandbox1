// Unit 5.1, stage 3 — build: choose the height of a roof truss.
// Joints A (0, 0) pin, B (8, 0) roller, apex C (4, h); load P at C.
//   Joint C: F_AC = F_BC = −P·L/(2h), L = √(16 + h²)   (compression)
//   Joint A: F_AB = −(4/L)·F_AC = 2P/h                 (tension)
// Limits: every member ≤ 2000 N (either way), and the truss no taller than 3 m.
// Hand-worked windows (h in 0.1 m steps):
//   P = 1800: F_AB ≤ 2000 → h ≥ 1.8;  900·L/h ≤ 2000 → h ≥ 2.02  → h = 2.1 … 3.0 m
//   P = 2200 (the heaviest): h ≥ 2.2 and 1100·L/h ≤ 2000 → h ≥ 2.64 → h = 2.7 … 3.0 m
//   P = 1000 (the lightest): h ≥ 1.0 and h ≥ 1.20 → h = 1.2 … 3.0 m

const RATING = 2000; // N, tension or compression
const MAX_HEIGHT = 3; // m

export default {
  id: "trusses/3-build",
  challenge: "build",
  solver: "statics.truss",
  title: "How Tall a Truss?",
  mission: "Choose the truss height so no member is overloaded and it isn't too tall.",
  instructions:
    "A roof truss spans 8 m and carries a load $P$ at its peak C. Slide the peak up or down, work out the member forces for YOUR height on paper (tension positive), then press **Test**.",
  setup: {
    joints: { A: [0, 0], B: [8, 0], C: [4, 1.2] },
    members: ["AB", "AC", "BC"],
    supports: [{ id: "A", type: "pin" }, { id: "B", type: "roller" }],
    forces: [{ id: "P", symbol: "P", magnitude: 1800, direction: "down", joint: "C", push: true }],
  },
  view: { xmin: -1.4, xmax: 9.4, ymin: -2.4, ymax: 5.6 },
  vary: [{ path: "forces.#P.magnitude", min: 1000, max: 2200, step: 20 }],
  editable: [{ path: "joints.C.1", label: "Height of the peak", min: 0.6, max: 4.5, step: 0.1, unit: "m" }],
  goal: {
    text: `Every member carries at most **${RATING} N** (pulling or pushing), and the truss is at most **${MAX_HEIGHT} m** tall.`,
    predict: [{ quantity: "F_AB" }, { quantity: "F_AC" }],
    check(result, setup) {
      const h = setup.joints.C[1];
      const problems = [], flagged = [];
      for (const id of ["F_AB", "F_AC", "F_BC"]) {
        const v = result.values[id];
        if (Math.abs(v) > RATING + 1e-6) {
          flagged.push(id);
          problems.push(`Member ${id.slice(2)} ${v > 0 ? "pulls" : "pushes"} with ${Math.abs(v).toFixed(1)} N — over its ${RATING} N rating.`);
        }
      }
      if (h > MAX_HEIGHT + 1e-6) problems.push(`At ${h.toFixed(1)} m the truss is too tall — the roof allows ${MAX_HEIGHT} m.`);
      if (problems.length) return { ok: false, flagged, message: problems.join("\n\n") };
      return { ok: true, message: `Tie AB ${result.values.F_AB.toFixed(1)} N (tension), rafters ${Math.abs(result.values.F_AC).toFixed(1)} N (compression), ${h.toFixed(1)} m tall. It holds!` };
    },
  },
  hints: [
    "Joint C first: the two rafters share the load. Their up-down parts, $F\\,h/L$ each, add up to $P$.",
    "Then joint A: the tie AB balances the rafter's sideways part, $F\\,\\tfrac{4}{L}$.",
    "A flat truss needs huge forces (the rafters are nearly level); a tall one hits the height limit.",
  ],
  explanation:
    "The rafters hold the load up only through their vertical parts, so a flat truss must push very hard — and the tie pulls just as hard to stop the feet spreading. " +
    "Raising the peak shrinks both forces, until the height limit stops you. Good design is finding the window where every limit is met.",
};
