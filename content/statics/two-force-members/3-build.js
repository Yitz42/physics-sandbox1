// Unit 4.5, stage 3 — build: prop a shelf with a strut (a two-force member).
// The shelf is pinned to the wall at A (0, 0) and carries a load P at its tip (2.5 m).
// A prop runs from B (b, 0) on the shelf down to D (0, −d) on the wall; it pushes
// along itself (compression, so F_BD < 0 with tension positive).
//   ΣM_A: b·(d/L)·C − 2.5P = 0 → C = 2.5·P·L/(b·d), L = √(b² + d²)   (C = −F_BD)
//   A_x = −C·b/L,  A_y = P − C·d/L,  R_A = √(A_x² + A_y²)
// Limits: prop ≤ 3000 N (compression), pin ≤ 2500 N, prop no longer than 2 m.
// Hand-checked design (P = 800 N): b = 1.5, d = 1.2 → L = 1.921, C = 2134 N, R_A = 1750 N ✓
// Too short a prop fails: b = 0.8, d = 1.2 → C = 3004 N ✗. A long prop fails the 2 m limit.
// Heaviest load (P = 1000 N): b = 1.5, d = 1.2 → C = 2668 N, R_A = 2187 N ✓ (a window exists).

const PROP_MAX = 3000; // N
const PIN_MAX = 2500; // N
const LENGTH_MAX = 2; // m

export default {
  id: "two-force-members/3-build",
  challenge: "build",
  solver: "statics.rigidBody",
  title: "Prop the Shelf",
  mission: "Place a prop under the shelf so nothing is overloaded.",
  instructions:
    "A shelf is pinned to the wall at A and carries a load $P$ at its tip. A prop — a bar pinned at both ends — runs from B on the shelf down to D on the wall. " +
    "Choose where it meets the shelf and the wall, work out the prop's force on paper (positive in tension, so a pushing prop is negative), then press **Test**.",
  setup: {
    body: { points: [[0, 0], [2.5, 0]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0], normal: [1, 0] },
      // Starts steep enough to see clearly, but too long (2.51 m > 2 m): it must be moved.
      { id: "B", type: "link", at: [2.2, 0], anchor: [0, -1.2], anchorLabel: "D", symbol: "F_{BD}" },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 800, direction: "down", at: [2.5, 0], push: true }],
  },
  view: { xmin: -1.3, xmax: 3.3, ymin: -2.6, ymax: 1.5 },
  vary: [{ path: "forces.#P.magnitude", min: 500, max: 1000, step: 10 }],
  editable: [
    { path: "supports.#B.at.0", label: "Prop meets the shelf at x", min: 0.3, max: 2.5, step: 0.1, unit: "m" },
    { path: "supports.#B.anchor.1", label: "D's height on the wall", min: -1.6, max: -0.2, step: 0.1, unit: "m" },
  ],
  goal: {
    text: `The prop pushes with at most **${PROP_MAX} N**, the pin at A carries at most **${PIN_MAX} N**, and the prop is at most **${LENGTH_MAX} m** long.`,
    predict: [{ quantity: "F_BD" }],
    check(result, setup) {
      const B = setup.supports.find((s) => s.id === "B");
      const L = Math.hypot(B.at[0] - B.anchor[0], B.at[1] - B.anchor[1]);
      const v = result.values;
      if (result.status !== "determinate") return { ok: false, message: `It moves! ${result.message}` };
      const problems = [], flagged = [];
      if (v.F_BD > 0) problems.push("The prop would have to pull — a prop under the shelf should push. (Check the geometry.)");
      if (-v.F_BD > PROP_MAX + 1e-6) {
        flagged.push("F_BD");
        problems.push(`The prop pushes with ${(-v.F_BD).toFixed(1)} N — over its ${PROP_MAX} N rating. A steeper prop, or one further out, needs less force.`);
      }
      if (v.R_A > PIN_MAX + 1e-6) {
        flagged.push("A_x", "A_y");
        problems.push(`The pin at A carries ${v.R_A.toFixed(1)} N — over its ${PIN_MAX} N rating.`);
      }
      if (L > LENGTH_MAX + 1e-6) problems.push(`The prop is ${L.toFixed(2)} m long — longer than the ${LENGTH_MAX} m bar you have.`);
      if (problems.length) return { ok: false, flagged, message: problems.join("\n\n") };
      return { ok: true, message: `Prop ${(-v.F_BD).toFixed(1)} N (compression), pin ${v.R_A.toFixed(1)} N, prop ${L.toFixed(2)} m long. The shelf is safe.` };
    },
  },
  hints: [
    "The prop is a two-force member: its push is along BD. Only its vertical part, $F\\,d/L$, has a moment about A (arm $b$).",
    "Moments about A: $b \\cdot \\tfrac{d}{L} \\cdot C = 2.5\\,P$, where $C$ is the prop's push and $L = \\sqrt{b^2 + d^2}$.",
    "A prop close to the wall, or nearly flat, needs a huge force. Far out and steep is better — but it must still fit in 2 m.",
  ],
  explanation:
    "Because the prop is a two-force member, its push lies along it, and only one moment equation about A is needed to find it. " +
    "A steep prop far along the shelf gets a long lever arm and a big vertical part, so it needs the least force — limited by the length of bar you have.",
};
