// Bearing stress, stage 3 — build: size the plate thickness for an allowable bearing stress.
// The goal: σ_b ≤ σ_allow with the smallest whole-millimetre plate thickness.
// Hand check (default numbers): P = 45 kN, d = 20 mm, σ_allow = 150 MPa.
//   A_b,min = 45 000 / 150 = 300 mm² → t_min = 300 / 20 = 15.0 mm → t = 15 mm.
//   t = 15: A_b = 300 mm², σ_b = 45 000 / 300 = 150.0 MPa ≤ 150 ✓
//   t = 14: A_b = 280 mm², σ_b = 160.7 MPa ✗ (over limit)
//   t = 16: safe, but not the thinnest / lightest.

function smallestSafe(result) {
  return Math.ceil(result.values.t_min - 1e-9);
}

export default {
  id: "bearing-stress/3-build",
  challenge: "build",
  solver: "materials.bearingStress",
  title: "Size the Pinned Plate",
  mission: "Size the plate thickness to keep the bearing stress below the allowable limit.",
  instructions:
    "A tension link connects to a pinned joint using a pin of diameter $d = 20\\,\\text{mm}$. " +
    "The connection carries the tensile load $P$ shown, and the contact pressure must not exceed the " +
    "**allowable bearing stress** $\\sigma_{b,\\text{allow}}$ (shown in the corner of the picture).\n\n" +
    "Choose a plate thickness $t$, **predict the projected area $A_b$ and bearing stress $\\sigma_b$ for your choice**, then press **Test**. " +
    "Find the smallest whole-millimetre thickness that is safe.",
  setup: {
    joint: { plateThickness: 10, pinDiameter: 20, allowableStress: 150 },
    load: { P: 45 },
  },
  vary: [
    { path: "load.P", min: 36, max: 56, step: 2 },
    { path: "joint.allowableStress", min: 120, max: 160, step: 5 },
  ],
  editable: [
    { path: "joint.plateThickness", label: "Plate thickness t", min: 8, max: 28, step: 1, unit: "mm" },
  ],
  goal: {
    text: "Bearing stress $\\sigma_b$ at or below $\\sigma_{b,\\text{allow}}$, with the smallest whole-millimetre thickness.",
    predict: [{ quantity: "A_b", min: 0 }, { quantity: "sigma_b", min: 0 }],
    check(result, setup) {
      const v = result.values;
      const t = setup.joint.plateThickness;
      const allow = setup.joint.allowableStress;
      const msg = `With $t = ${t}\\,\\text{mm}$: $A_b = ${v.A_b.toFixed(0)}\\,\\text{mm}^2$ and $\\sigma_b = ${v.sigma_b.toFixed(1)}\\,\\text{MPa}$.`;

      if (v.sigma_b > allow) {
        return {
          ok: false,
          message:
            `${msg} That's over $\\sigma_{b,\\text{allow}} = ${allow}\\,\\text{MPa}$, so the plate would crush around the hole. ` +
            "Work backwards: the minimum bearing area is $A_{b,\\min} = P / \\sigma_{b,\\text{allow}}$, so $t_{\\min} = A_{b,\\min} / d$.",
        };
      }
      if (t > smallestSafe(result)) {
        return {
          ok: false,
          message:
            `${msg} Safe, but a thinner plate would be safe too, adding unnecessary weight. ` +
            "Find $t_{\\min} = P / (d \\cdot \\sigma_{b,\\text{allow}})$ and round UP to the next whole millimetre.",
        };
      }
      return {
        ok: true,
        message:
          `${msg} Safe ($\\sigma_b \\le ${allow}\\,\\text{MPa}$), and 1 mm thinner would exceed the allowable stress. ` +
          `Factor of safety $FS = \\sigma_{b,\\text{allow}} / \\sigma_b = ${v.FS.toFixed(2)}$.`,
      };
    },
  },
  hints: [
    "Projected bearing area is $A_b = t \\cdot d$. For your choice of $t$, compute $A_b$, then $\\sigma_b = P / A_b$ with $P$ in newtons.",
    "To solve directly: $\\sigma_b \\le \\sigma_{b,\\text{allow}} \\implies t \\cdot d \\ge P / \\sigma_{b,\\text{allow}}$.",
    "Rearrange for thickness: $t_{\\min} = \\frac{P}{d \\cdot \\sigma_{b,\\text{allow}}}$. Round UP to the next whole millimetre.",
  ],
  explanation:
    "To size a plate against bearing failure, we solve $\\sigma_b = \\frac{P}{t \\cdot d} \\le \\sigma_{b,\\text{allow}}$ for thickness: " +
    "$t_{\\min} = \\frac{P}{d \\cdot \\sigma_{b,\\text{allow}}}$. " +
    "For $P = 45\\,\\text{kN}$, $d = 20\\,\\text{mm}$, and $\\sigma_{b,\\text{allow}} = 150\\,\\text{MPa}$: " +
    "$t_{\\min} = \\frac{45\\,000\\,\\text{N}}{(20\\,\\text{mm})(150\\,\\text{MPa})} = 15.0\\,\\text{mm}$. " +
    "A thickness of $15\\,\\text{mm}$ provides exactly the required contact area ($A_b = 300\\,\\text{mm}^2$) without excess weight.",
};
