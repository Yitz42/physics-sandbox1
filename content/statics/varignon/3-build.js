// Varignon's theorem, stage 3 — build: choose the direction of a 150 N force on
// a wrench so its moment about the bolt is exactly +60 N·m.
// Hand check: A = (0.5, 0.2) m; M_O = 150(0.5 sinθ − 0.2 cosθ) for θ above +x.
//   θ = 70°: 150(0.4698 − 0.0684) = 60.2 N·m ✓.  26° above −x: 150(0.5·0.4384 + 0.2·0.8988) = 59.8 N·m ✓.
//   The largest possible moment is F·OA = 150(0.5385) = 80.8 N·m (F at 90° to OA).

import { angleOptions } from "../shared/angle-options.js";

const TARGET = 60; // N·m, counterclockwise
const TOL = 1; // N·m

export default {
  id: "varignon/3-build",
  challenge: "build",
  solver: "statics.moment",
  title: "Aim the Pull",
  mission: "Aim the pull on the wrench so it turns the bolt with exactly the moment asked for.",
  instructions:
    `You pull on the end A of a wrench with a 150 N force. Choose its direction so that it turns the bolt O with exactly $M_O = +${TARGET}$ N·m (counterclockwise). ` +
    "Nothing is shown until you press **Test**: use Varignon's theorem, $M_O = xF_y - yF_x$, to check your choice first.",
  setup: {
    analysis: "moment",
    varignon: true,
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0.5, 0.2]] }, // the wrench, from the bolt O to its end A
    forces: [{ id: "F", symbol: "F", magnitude: 150, direction: { angle: 30, from: "+x", toward: "+y" }, at: [0.5, 0.2], pointLabel: "A" }],
    dims: [{ force: "F", offset: -0.1 }, { force: "F", axis: "y", offset: 0.75 }],
  },
  view: { xmin: -0.3, xmax: 0.95, ymin: -0.25, ymax: 0.6 },
  editable: [
    { path: "forces.0.direction.angle", label: "Angle θ", min: 0, max: 90, step: 1, unit: "deg" },
    angleOptions("forces.0", "Angle θ measured", "A"),
  ],
  sceneOpts: { components: true },
  goal: {
    text: `Make $M_O = +${TARGET}$ N·m (within ${TOL} N·m) with the 150 N force.`,
    check(result) {
      const v = result.values;
      const f = (x) => x.toFixed(1);
      const parts = `$M_O(F_y) = ${f(v.My_F)}$ N·m and $M_O(F_x) = ${f(v.Mx_F)}$ N·m, so $M_O = ${f(v.M)}$ N·m.`;
      if (Math.abs(v.M - TARGET) <= TOL) return { ok: true, message: `${parts} There are two directions that work — can you find the other one?` };
      return {
        ok: false,
        message: `Your pull gives ${parts} ` +
          (v.M < 0 ? "That turns the wrench clockwise: pull so it turns the other way. " : "") +
          "Write $M_O = 0.5\\,F_y - 0.2\\,F_x$ and try angles until it comes to 60.",
      };
    },
  },
  hints: [
    "With A at (0.5, 0.2) m: $M_O = xF_y - yF_x = 0.5F_y - 0.2F_x$.",
    "Pulling up and to the right: $F_y$ helps (counterclockwise) and $F_x$ works against it (clockwise). A steep pull helps most.",
    "Try θ = 70° above +x: $0.5(150\\sin 70^\\circ) - 0.2(150\\cos 70^\\circ)$.",
  ],
  explanation:
    "With Varignon's theorem you can test any direction quickly: $M_O = 0.5F_y - 0.2F_x$. Two directions give 60 N·m (about 70° above +x, and about 26° above −x). " +
    "The biggest possible moment is when $F$ is perpendicular to OA: $F \\cdot OA = 150(0.539) = 80.8$ N·m.",
};
