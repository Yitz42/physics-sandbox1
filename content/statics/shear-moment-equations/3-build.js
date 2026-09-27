// Unit 8.3, stage 3 — build: place the second load so the middle segment is in "pure bending":
// V(x) = 0 there, so M(x) is constant (as in a four-point bending test).
// Pin A (0), roller B (6), P₁ at a, P₂ at b (> a). Segment 2 (a < x < b): V = A_y − P₁.
//   V = 0 ⇔ A_y = P₁ ⇔ P₂(6 − b) = P₁ a ⇔ b = 6 − P₁a/P₂  (P₁ = 800, a = 1.5, P₂ = 1200 → b = 5 m).
// Versions: P₁ 600…1000, a 1…2, P₂ 900…1500 → b from 3.78 to 5.6 m, on the slider (2.5…5.9).
// |V| ≤ 10 N: dV/db = P₂/6 ≥ 150 N/m, so a 0.05 m slider step always lands within 7.5 N.
// Start: b = 3 → V = P₂(3/6) − P₁a/6·… ≥ 150 N off (never already done).

const TOL = 10; // N

export default {
  id: "shear-moment-equations/3-build",
  challenge: "build",
  solver: "statics.internal",
  title: "Pure Bending",
  mission: "Place the second load so the middle of the beam carries no shear at all.",
  instructions:
    "A test rig loads a beam with two point loads. Between them (segment 2) the shear is $V(x) = A_y - P_1$. Engineers want that part in **pure bending**: no shear, so M(x) is the same all along it. " +
    "Slide the second load $P_2$ until $V(x) = 0$ in segment 2 — work out where on paper first! Then work out the reaction $A_y$ for your position and press **Test**.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [6, 0] }],
    forces: [
      { id: "P_1", symbol: "P_1", magnitude: 800, direction: "down", at: [1.5, 0], push: true },
      { id: "P_2", symbol: "P_2", magnitude: 1200, direction: "down", at: [3, 0], push: true },
    ],
    view: "diagrams",
    showDiagrams: true,
    showSegments: true,
    knownReactions: true,
  },
  view: { xmin: -1.4, xmax: 7.2, ymin: -7.9, ymax: 2.4 },
  tallPicture: true,
  vary: [
    { path: "forces.#P_1.magnitude", min: 600, max: 1000, step: 100 },
    { path: "forces.#P_1.at.0", values: [1, 1.5, 2] },
    { path: "forces.#P_2.magnitude", min: 900, max: 1500, step: 100 },
  ],
  editable: [{ path: "forces.1.at.0", label: "Second load position", min: 2.5, max: 5.9, step: 0.05, unit: "m" }],
  goal: {
    text: `In segment 2, between the loads, $V(x) = 0$ (within ${TOL} N): pure bending.`,
    predict: [{ quantity: "A_y" }],
    check(result, setup) {
      const r = result;
      const [P1, P2] = setup.forces;
      const seg = r.segments.find((s) => s.a >= P1.at[0] - 1e-9 && s.b <= P2.at[0] + 1e-9);
      if (!seg || P2.at[0] <= P1.at[0]) return { ok: false, message: "Keep the second load to the right of the first." };
      const V = seg.V[0];
      if (Math.abs(V) > TOL) return { ok: false, message: `V = ${V.toFixed(0)} N between the loads. ${V > 0 ? "$A_y$ is bigger than $P_1$: move $P_2$ right, toward B." : "$A_y$ is smaller than $P_1$: move $P_2$ left, toward the middle."}` };
      return { ok: true, message: `V = ${V.toFixed(1)} N: the middle is in pure bending, with M = ${r.values.Mmax.toFixed(0)} N·m all along it.` };
    },
  },
  hints: [
    "Segment 2's shear is $V = A_y - P_1$, so you need $A_y = P_1$.",
    "Moments about B: $A_y \\cdot 6 = P_1 (6 - a) + P_2 (6 - b)$. Put in $A_y = P_1$ and solve for b.",
    "Then M in segment 2 is constant: $M = A_y x - P_1 (x - a) = P_1 a$.",
  ],
  explanation:
    "With $V(x) = 0$ on a segment, $dM/dx = V = 0$: M is constant there — pure bending, with no shear. Test rigs use this to measure how a beam bends without shear getting in the way.",
};
