// Unit 2.4, stage 3 — build: a mast's top A (0, 0, 6) is held by a guy wire to B (fixed tension).
// The student places a second anchor C and sets its tension so the two wires' pulls on A have
// NO sideways part: the resultant points straight down the mast (it only squeezes it), and
// works out that squeeze, F_Rz, for their own design before each Test.
// Default: B (−2, 3, 0), r_AB = {−2 i + 3 j − 6 k} m (7 m), T_AB = 700 N → {−200 i + 300 j − 600 k} N.
// Designs that work (C straight across the mast from B, seen from above):
//   C (2, −3, 0), T_AC = 700 N → F_R = {0 i + 0 j − 1200 k} N;
//   C (4, −6, 0) (r = 9.381 m), T_AC = 470 N → sideways part 0.7 N, F_Rz = −900.6 N.
// Every version (B from the 7 m anchors, T_AB 500–900 N) works with C = −B and T_AC = T_AB.
// Start: C (4, 4, 0), T_AC = 500 N — pulls sideways.

const SIDEWAYS = 5; // N: the most sideways pull allowed, in x and in y

export default {
  id: "vector-challenge/3-build",
  challenge: "build",
  solver: "statics.force3d",
  title: "Straighten the Mast",
  mission: "Anchor a second guy wire so the two wires pull the mast straight down its length.",
  instructions:
    "A guy wire from the mast top A to the anchor B pulls with a fixed tension $T_{AB}$. Add a second wire from A to an anchor C that you place, with a tension $T_{AC}$ you set. " +
    `The two wires together must pull A with **no sideways part** — $|F_{Rx}|$ and $|F_{Ry}|$ at most ${SIDEWAYS} N — so they only push the mast down its length. ` +
    "Then work out that push, $F_{Rz}$, for your design and press **Test**.",
  setup: {
    points: { O: [0, 0, 0], A: [0, 0, 6], B: [-2, 3, 0], C: [4, 4, 0] },
    pole: ["O", "A"],
    cables: [["A", "B"], ["A", "C"]],
    groundCentre: [0, 0], // (the ground stays put while the anchor moves)
    // Everywhere the sliders can put C stays in view, so the picture never rescales.
    keepInView: [[-6, -6, 0], [6, -6, 0], [6, 6, 0], [-6, 6, 0]],
    axisLength: 7,
    forces: [
      { id: "T_AB", symbol: "T_{AB}", magnitude: 700, dir: { from: "A", to: "B" } },
      { id: "T_AC", symbol: "T_{AC}", magnitude: 500, dir: { from: "A", to: "C" } },
    ],
    resultant: true,
    resultantAt: "A",
  },
  vary: [
    { path: "forces.0.magnitude", min: 500, max: 900, step: 50 },
    { path: "points.B", values: [[-2, 3, 0], [2, 3, 0], [3, -2, 0], [-3, -2, 0], [2, -3, 0], [-2, -3, 0]] },
  ],
  editable: [
    { path: "points.C.0", label: "Anchor C: x", min: -6, max: 6, step: 0.5, unit: "m" },
    { path: "points.C.1", label: "Anchor C: y", min: -6, max: 6, step: 0.5, unit: "m" },
    { path: "forces.1.magnitude", label: "Tension T_AC", min: 100, max: 1500, step: 10, unit: "N" },
  ],
  goal: {
    text: `$|F_{Rx}| \\le ${SIDEWAYS}$ N and $|F_{Ry}| \\le ${SIDEWAYS}$ N: the wires only push the mast down.`,
    predict: [{ quantity: "R.z" }],
    check(result) {
      const v = result.values;
      const x = v["R.x"], y = v["R.y"];
      if (Math.abs(x) <= SIDEWAYS && Math.abs(y) <= SIDEWAYS) {
        return { ok: true, message: `The sideways parts cancel: the wires push the mast straight down with ${Math.abs(v["R.z"]).toFixed(1)} N.` };
      }
      // Seen from above, are the two wires' sideways pulls exactly opposite?
      const hB = [v["T_AB.x"], v["T_AB.y"]], hC = [v["T_AC.x"], v["T_AC.y"]];
      const cross = hB[0] * hC[1] - hB[1] * hC[0], dot = hB[0] * hC[0] + hB[1] * hC[1];
      const lineUp = Math.abs(cross) <= 1e-6 * Math.max(1, Math.hypot(...hB) * Math.hypot(...hC)) && dot < 0;
      const left = `$F_{Rx}$ = ${x.toFixed(1)} N and $F_{Ry}$ = ${y.toFixed(1)} N are left over.`;
      if (!lineUp) return { ok: false, message: `${left} Seen from above, wire AC must pull exactly OPPOSITE to wire AB: put C on the line from B through the foot of the mast, on the other side.` };
      const more = Math.hypot(...hC) < Math.hypot(...hB);
      return { ok: false, message: `${left} The wires pull opposite ways, but AC's sideways part is too ${more ? "small: pull harder (or anchor C further out)" : "big: pull less hard (or anchor C closer in)"}.` };
    },
  },
  hints: [
    "Seen from above, the two sideways pulls must be opposite: C lies on the line from B through the mast's foot O, on the other side.",
    "Each wire's sideways part is $T\\,\\dfrac{\\sqrt{x^2 + y^2}}{r}$, with $r$ its length. They must be equal.",
    "Then $F_{Rz} = T_{AB}\\,\\dfrac{-6}{r_{AB}} + T_{AC}\\,\\dfrac{-6}{r_{AC}}$ — both wires pull A down.",
  ],
  explanation:
    "Two forces in space cancel sideways only if their horizontal parts are equal and opposite — the same idea as in the plane, with the vertical parts left over. " +
    "An anchor further out needs less tension for the same sideways pull, but then it pushes the mast down less. Real masts are guyed from three or four sides so the wires' sideways pulls always cancel.",
};
