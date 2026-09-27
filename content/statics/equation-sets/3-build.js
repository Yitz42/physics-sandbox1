// Unit 4.3, stage 3 — build: choose three equations for a beam on a ramp roller
// so that each holds just ONE unknown, then work out what they give.
// The beam and its hand checks are in the lesson library (beams.js, rampBeam):
// pin A (0, 0), roller B (4, 0) pushing 60° from vertical (up-left), P down at x.
// The only set with one unknown in every equation uses E, where the roller's line
// crosses the vertical through A — E = (0, 2.309):
//   ΣM_A → N_B = xP/2,  ΣM_B → A_y = (4 − x)P/4,  ΣM_E → A_x = xP/2.309
//   (x = 2, P = 1000: N_B = 1000 N, A_y = 500 N, A_x = 866.0 N)
// Every other set has a slot with two or more unknowns, or fails:
//   ΣF_x: A_x and N_B;  ΣF_y: A_y and N_B;  ΣM_C (C on AB): A_y and N_B;  ΣM_D (0, 2): A_x and N_B;
//   ΣM_A, ΣM_B, ΣM_C: A, B, C in line — fails.

import { use } from "../../../src/core/library.js";
import { rampBeam, withSet } from "../library/beams.js";

const beam = use(withSet(rampBeam, [{ F: "x" }, { F: "y" }, { M: "A" }], { showMomentPoint: true }));
const CHOICES = [
  ["ΣF_x", { F: "x" }], ["ΣF_y", { F: "y" }],
  ["ΣM_A — the pin", { M: "A" }], ["ΣM_B — the roller", { M: "B" }],
  ["ΣM_C — under the load", { M: "C" }], ["ΣM_D — 2 m above A", { M: "D" }],
  ["ΣM_E — where the roller's line meets the wall line", { M: "E" }],
];
const slot = (i) => ({ label: `Equation ${i + 1}`, options: CHOICES.map(([label, q]) => ({ label, set: { [`sums.${i}`]: q } })) });

export default {
  id: "equation-sets/3-build",
  challenge: "build",
  solver: "statics.rigidBody",
  title: "Three Equations, Three Answers",
  mission: "Choose three equations that each hold just one unknown.",
  instructions:
    `${beam.instructions} Choose three equations so that EACH holds only one unknown (the rings mark the moment points; E is where the roller's line of action ` +
    "crosses the vertical line through A). Then work out the reactions your equations give, and press **Test**. ($A_x$, $A_y$ positive right and up.)",
  setup: beam.setup,
  view: beam.view,
  vary: beam.vary,
  editable: [slot(0), slot(1), slot(2)],
  goal: {
    text: "Every one of your three equations holds **exactly one** unknown, and together they find all three reactions.",
    predict: [{ quantity: "N_B", min: 0 }, { quantity: "A_y" }, { quantity: "A_x" }],
    check(result) {
      const names = { A_x: "A_x", A_y: "A_y", N_B: "N_B" };
      if (!result.values.setOk) return { ok: false, message: result.setCheck.message };
      const crowded = result.equations.map((e, i) => ({ e, u: result.setUnknowns[i] })).filter((x) => x.u.length > 1);
      if (crowded.length) {
        return {
          ok: false,
          message: crowded.map(({ e, u }) => `$${e.lhs}$ holds ${u.length} unknowns (${u.map((id) => `$${names[id]}$`).join(", ")}): you'd have to solve it together with another equation.`).join("\n\n") +
            "\n\nLook for a point where the lines of action of two unknowns cross.",
        };
      }
      return { ok: true, message: "One unknown per equation: each answer drops straight out, and no equation depends on another's result." };
    },
  },
  hints: [
    "About A, both of the pin's reactions drop out: $\\Sigma M_A$ holds only $N_B$. About B, $N_B$ drops out — and so does $A_x$, whose line runs along the beam through B.",
    "The third unknown is $A_x$. Its equation must leave out both $A_y$ (the vertical line through A) and $N_B$ (the roller's slanted line). Where do those two lines cross?",
    "At E the vertical through A meets the roller's line: $\\Sigma M_E$ holds only $A_x$, with arm $AE = 4\\tan 30° = 2.31$ m.",
  ],
  explanation:
    "An unknown drops out of a moment equation when its line of action passes through the moment point. So the smart points are where two unknowns' lines CROSS: " +
    "A (both pin reactions), B ($N_B$ and $A_x$, along the beam), and E ($A_y$ and $N_B$). Moments about those three give one unknown each — and since A, B and E aren't on one line, the three are independent.",
};
