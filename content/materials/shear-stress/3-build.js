// Direct shear, stage 3 — build: size the bolt in a single-shear lap joint for an
// allowable shear stress, and prove each design on paper before it's load-tested
// (goal.predict: A and τ for the student's own bolt), so it can't be passed by
// sliding until it works.
//
// The goal: τ ≤ τ_allow with the SMALLEST whole-millimetre bolt that does it.
// Single shear (n = 1): the one shear plane carries the whole load, V = P.
// Working backwards: A_min = V / τ_allow, d_min = √(4 A_min / π), rounded UP.
// Hand check (the default numbers): P = 42 kN → V = 42 000 N, τ_allow = 85 MPa.
//   A_min = 42 000 / 85 = 494.1 mm² → d_min = √(4 × 494.1 / π) = 25.08 mm → d = 26 mm.
//   d = 26: A = (π/4)(26)² = 530.9 mm², τ = 42 000 / 530.9 = 79.1 MPa ≤ 85 ✓
//   d = 25: A = 490.9 mm², τ = 85.6 MPa ✗ (just over: rounding down fails);  d = 27: not the smallest.
// Versions: P = 40–54 kN (every 2 kN) and τ_allow = 70–100 MPa (every 5):
// 56 versions. The smallest safe bolt is always 23–32 mm, on the slider, and the
// starting 22 mm is always over the limit (tests/content/stages.test.js checks every version).

// The smallest whole-millimetre bolt that keeps τ ≤ τ_allow (the solver's d_min, rounded up).
function smallestSafe(result) {
  return Math.ceil(result.values.d_min - 1e-9);
}

export default {
  id: "shear-stress/3-build",
  challenge: "build",
  solver: "materials.shearStress",
  title: "Size the Lap Joint Bolt",
  mission: "Choose the smallest safe bolt diameter so shear stress does not exceed the allowable limit.",
  instructions:
    "A lap joint connects two plates with a single bolt, so the bolt is cut by just **one shear plane**. " +
    "The joint carries the tensile load $P$ shown, and the bolt's shear stress must not exceed the " +
    "**allowable shear stress** $\\tau_{\\text{allow}}$ (\"Allowable τ\" in the corner of the picture).\n\n" +
    "Choose a bolt diameter $d$, then **work out** $A$ and $\\tau$ for your bolt and press **Test** to load it. " +
    "Find the smallest whole-millimetre bolt that is safe.",
  setup: {
    joint: { type: "lap", planes: 1, pinDiameter: 22, allowableStress: 85 },
    load: { P: 42 },
  },
  vary: [
    { path: "load.P", min: 40, max: 54, step: 2 },
    { path: "joint.allowableStress", min: 70, max: 100, step: 5 },
  ],
  editable: [
    { path: "joint.pinDiameter", label: "Bolt diameter d", min: 18, max: 36, step: 1, unit: "mm" },
  ],
  goal: {
    text: "Shear stress $\\tau$ at or below $\\tau_{\\text{allow}}$, with the smallest whole-millimetre bolt that does it.",
    // Before each Test: the shear area and stress for the student's own bolt.
    predict: [{ quantity: "A", min: 0 }, { quantity: "tau", min: 0 }],
    check(result, setup) {
      const v = result.values;
      const d = setup.joint.pinDiameter;
      const allow = setup.joint.allowableStress;
      const msg = `With $d = ${d}\\,\\text{mm}$: $A = ${v.A.toFixed(1)}\\,\\text{mm}^2$ and $\\tau = ${v.tau.toFixed(1)}\\,\\text{MPa}$.`;

      if (v.tau > allow) {
        return {
          ok: false,
          message: `${msg} That's over $\\tau_{\\text{allow}} = ${allow}\\,\\text{MPa}$, so the bolt would shear off. ` +
            "Work backwards instead of guessing: in single shear $V = P$, and the smallest area allowed is " +
            "$A_{\\min} = V / \\tau_{\\text{allow}}$ (with $V$ in newtons).",
        };
      }
      if (d > smallestSafe(result)) {
        return {
          ok: false,
          message: `${msg} Safe, but a thinner bolt would be safe too, so this one is bigger than it needs to be. ` +
            "Find $A_{\\min} = V / \\tau_{\\text{allow}}$, then the diameter that gives it, and round UP to the next whole millimetre.",
        };
      }
      return {
        ok: true,
        message: `${msg} Safe ($\\tau \\le ${allow}\\,\\text{MPa}$), and 1 mm thinner would be over the limit. ` +
          `Factor of safety $FS = \\tau_{\\text{allow}} / \\tau = ${v.FS.toFixed(2)}$.`,
      };
    },
  },
  hints: [
    "One shear plane carries the whole load: $V = P$. For your bolt, $A = \\frac{\\pi}{4} d^2$, then $\\tau = V / A$ with $V$ in newtons, which gives MPa.",
    "Instead of trying sizes, work backwards: $\\tau \\le \\tau_{\\text{allow}}$ means $A \\ge A_{\\min} = V / \\tau_{\\text{allow}}$.",
    "From $A_{\\min} = \\frac{\\pi}{4} d^2$: $d_{\\min} = \\sqrt{4 A_{\\min} / \\pi}$. Round it UP to a whole millimetre; rounding down leaves the stress just over the limit.",
  ],
  explanation:
    "To size a fastener for shear, run $\\tau = V / A$ backwards. In single shear the one plane carries the whole load ($V = P$), " +
    "so the bolt needs at least $A_{\\min} = \\dfrac{V}{\\tau_{\\text{allow}}}$, and since $A = \\frac{\\pi}{4} d^2$, " +
    "$d_{\\min} = \\sqrt{\\dfrac{4 A_{\\min}}{\\pi}}$. Round UP to a whole size: rounding down gives a stress just over the limit. " +
    "For example, with $P = 42\\,\\text{kN}$ and $\\tau_{\\text{allow}} = 85\\,\\text{MPa}$: $A_{\\min} = 494.1\\,\\text{mm}^2$ and $d_{\\min} = 25.1\\,\\text{mm}$, " +
    "so $d = 26\\,\\text{mm}$ ($\\tau = 79.1\\,\\text{MPa}$). A double-shear joint would share the load over two planes and need a thinner bolt.",
};
