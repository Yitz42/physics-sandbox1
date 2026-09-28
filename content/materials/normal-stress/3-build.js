// Normal stress, stage 3 — build: size a tie rod for an allowable stress limit,
// and prove each design on paper before it's load-tested (goal.predict: A and σ
// for the student's own diameter), so it can't be passed by sliding until it works.
//
// The goal: σ ≤ σ_allow with the SMALLEST whole-millimetre diameter that does it.
// Working backwards: A_min = P / σ_allow, d_min = √(4 A_min / π), rounded UP
// (rounding down would leave the stress just over the limit).
// Hand check (the default numbers): P = 48 kN = 48 000 N, σ_allow = 120 MPa.
//   A_min = 48 000 / 120 = 400 mm² → d_min = √(4 × 400 / π) = 22.57 mm → d = 23 mm.
//   d = 23: A = (π/4)(23)² = 415.5 mm², σ = 48 000 / 415.5 = 115.5 MPa ≤ 120 ✓
//   d = 22: A = 380.1 mm², σ = 126.3 MPa ✗ (too high);  d = 24: safe but not the smallest.
// Versions: P = 40–68 kN (every 2 kN) and σ_allow = 100–140 MPa (every 10):
// 75 versions. The smallest safe diameter is always 20–30 mm, on the slider, and
// the starting 18 mm is always over the limit (tests/content/stages.test.js checks every version).

// The smallest whole-millimetre diameter that keeps σ ≤ σ_allow (1 N/mm² = 1 MPa).
function smallestSafe(setup) {
  const dMin = Math.sqrt((4 * setup.load.P * 1000) / (Math.PI * setup.bar.allowableStress));
  return Math.ceil(dMin - 1e-9);
}

export default {
  id: "normal-stress/3-build",
  challenge: "build",
  solver: "materials.axialStress",
  title: "Size the Tie Rod",
  mission: "Pick the smallest safe rod diameter so the stress stays within the allowable limit.",
  instructions:
    "A steel tie rod carries the axial tensile load $P$ shown. The design code says its normal stress must not exceed the " +
    "**allowable stress** $\\sigma_{\\text{allow}}$ (\"Allowable σ\" in the corner of the picture).\n\n" +
    "Choose a diameter $d$, then **work out** $A$ and $\\sigma$ for your rod and press **Test** to load it. " +
    "A thicker rod is safer but wastes steel, so find the smallest whole-millimetre size that is safe.",
  setup: {
    bar: { shape: "circle", diameter: 18, length: 2.0, allowableStress: 120, material: "A36 Steel" },
    load: { P: 48 },
    view3d: { yaw: 34, pitch: 20 },
  },
  vary: [
    { path: "load.P", min: 40, max: 68, step: 2 },
    { path: "bar.allowableStress", min: 100, max: 140, step: 10 },
  ],
  toggles: [
    {
      key: "viewMode",
      default: "2d",
      options: [
        { label: "2D View", value: "2d" },
        { label: "3D View", value: "3d" },
      ],
    },
  ],
  editable: [
    { path: "bar.diameter", label: "Rod diameter d", min: 14, max: 40, step: 1, unit: "mm" },
  ],
  goal: {
    text: "Normal stress $\\sigma$ at or below $\\sigma_{\\text{allow}}$, with the smallest whole-millimetre diameter that does it.",
    // Before each Test: the area and stress for the student's own rod.
    predict: [{ quantity: "A", min: 0 }, { quantity: "sigma" }],
    check(result, setup) {
      const v = result.values;
      const d = setup.bar.diameter;
      const allow = setup.bar.allowableStress;
      const msg = `With $d = ${d}\\,\\text{mm}$: $A = ${v.A.toFixed(1)}\\,\\text{mm}^2$ and $\\sigma = ${v.sigma.toFixed(1)}\\,\\text{MPa}$.`;

      if (v.sigma > allow) {
        return {
          ok: false,
          message: `${msg} That's over $\\sigma_{\\text{allow}} = ${allow}\\,\\text{MPa}$, so the rod is too thin. ` +
            "Work backwards instead of guessing: the smallest area allowed is $A_{\\min} = P / \\sigma_{\\text{allow}}$ (with $P$ in newtons), " +
            "and a thicker rod spreads the load over more area.",
        };
      }
      if (d > smallestSafe(setup)) {
        return {
          ok: false,
          message: `${msg} Safe, but a thinner rod would be safe too, so this one wastes steel. ` +
            "Find $A_{\\min} = P / \\sigma_{\\text{allow}}$, then the diameter that gives it, and round UP to the next whole millimetre.",
        };
      }
      return {
        ok: true,
        message: `${msg} Safe ($\\sigma \\le ${allow}\\,\\text{MPa}$), and 1 mm thinner would be over the limit. ` +
          `Factor of safety $FS = \\sigma_{\\text{allow}} / \\sigma = ${v.FS.toFixed(2)}$.`,
      };
    },
  },
  hints: [
    "For your rod: $A = \\frac{\\pi}{4} d^2$ (in $\\text{mm}^2$ with $d$ in mm), then $\\sigma = P / A$ with $P$ in newtons, which gives MPa.",
    "Instead of trying sizes, work backwards: $\\sigma \\le \\sigma_{\\text{allow}}$ means $A \\ge A_{\\min} = P / \\sigma_{\\text{allow}}$.",
    "From $A_{\\min} = \\frac{\\pi}{4} d^2$: $d_{\\min} = \\sqrt{4 A_{\\min} / \\pi}$. Round it UP to a whole millimetre; rounding down leaves the stress just over the limit.",
  ],
  explanation:
    "Design problems run the stress formula backwards. Stress is load over area, so the rod needs at least " +
    "$A_{\\min} = \\dfrac{P}{\\sigma_{\\text{allow}}}$, and since $A = \\frac{\\pi}{4} d^2$, the diameter must be at least " +
    "$d_{\\min} = \\sqrt{\\dfrac{4 A_{\\min}}{\\pi}}$. Real rods come in whole sizes, so you round UP: rounding down gives a " +
    "slightly smaller area and a stress just over the limit. For example, with $P = 48\\,\\text{kN}$ and $\\sigma_{\\text{allow}} = 120\\,\\text{MPa}$, " +
    "$A_{\\min} = 400\\,\\text{mm}^2$ and $d_{\\min} = 22.6\\,\\text{mm}$, so $d = 23\\,\\text{mm}$ ($\\sigma = 115.5\\,\\text{MPa}$).",
};
