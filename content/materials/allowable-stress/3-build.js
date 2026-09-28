// Allowable stress, stage 3 — build: size the connecting pin to safely support the design load.
// Hand check (default numbers): P = 48 kN, double shear (n = 2).
//   Rod d = 24 mm, σ_allow = 130 MPa → P_tension = 58.8 kN.
//   Plate t = 14 mm, σ_b,allow = 180 MPa → requires d_pin ≥ 48 000 / (14 · 180) = 19.05 mm.
//   Pin double shear τ_allow = 80 MPa → requires d_pin ≥ √(4 · 48 000 / (2 · π · 80)) = 19.54 mm.
//   Smallest safe whole-millimetre pin is d = 20 mm:
//     d = 20 mm → P_shear = 50.3 kN, P_bearing = 50.4 kN, P_allow = 50.3 kN ≥ 48 kN ✓
//     d = 19 mm → P_shear = 45.4 kN < 48 kN ✗ (pin shears off)

function smallestSafe(result) {
  const v = result.values;
  const dShear = Math.ceil(v.d_pin_min - 1e-9);
  const dBearing = Math.ceil((v.P_N / (v.t_plate * v.sigma_b_allow)) - 1e-9);
  return Math.max(dShear, dBearing);
}

export default {
  id: "allowable-stress/3-build",
  challenge: "build",
  solver: "materials.allowableStress",
  title: "Size the Connecting Pin",
  mission: "Size the pin diameter so the connection supports the design load with FS ≥ 1.0.",
  instructions:
    "A tension link connects to a clevis bracket under the design tensile load $P$ shown. " +
    "The tension rod and bracket plates are already sized, but the cylindrical pin must be selected.\n\n" +
    "Choose a pin diameter $d$, **predict the pin shear capacity $P_{\\text{shear}}$ and overall allowable load $P_{\\text{allow}}$ for your choice**, " +
    "then press **Test**. Find the smallest whole-millimetre pin that safely supports the load ($P_{\\text{allow}} \\ge P$, or $FS \\ge 1.0$).",
  setup: {
    rod: { diameter: 28, allowableStress: 130 },
    joint: { planes: 2, pinDiameter: 16, plateThickness: 14, allowableShear: 80, allowableBearing: 180 },
    load: { P: 48 },
  },

  vary: [
    { path: "load.P", min: 40, max: 60, step: 2 },
    { path: "joint.allowableShear", min: 70, max: 95, step: 5 },
  ],
  editable: [
    { path: "joint.pinDiameter", label: "Pin diameter d", min: 14, max: 28, step: 1, unit: "mm" },
  ],
  goal: {
    text: "Overall allowable load $P_{\\text{allow}} \\ge P$ ($FS \\ge 1.0$), with the smallest whole-millimetre pin.",
    predict: [{ quantity: "P_shear", min: 0 }, { quantity: "P_allow", min: 0 }],
    check(result, setup) {
      const v = result.values;
      const d = setup.joint.pinDiameter;
      const P = setup.load.P;
      const msg = `With pin $d = ${d}\\,\\text{mm}$: $P_{\\text{shear}} = ${v.P_shear.toFixed(1)}\\,\\text{kN}$ and $P_{\\text{allow}} = ${v.P_allow.toFixed(1)}\\,\\text{kN}$.`;

      if (v.P_allow < P) {
        return {
          ok: false,
          message:
            `${msg} That's less than the design load $P = ${P}\\,\\text{kN}$ ($FS = ${v.FS.toFixed(2)} < 1.0$), so the joint would fail in ${v.governing}. ` +
            "Increase the pin diameter to satisfy both double-shear and bearing limits.",
        };
      }
      if (d > smallestSafe(result)) {
        return {
          ok: false,
          message:
            `${msg} Safe ($FS = ${v.FS.toFixed(2)}$), but a thinner pin would be safe too, so this one is bigger than it needs to be. ` +
            "Find the smallest whole-millimetre diameter that satisfies both shear and bearing.",
        };
      }

      return {
        ok: true,
        message:
          `${msg} Safe and optimal! $P_{\\text{allow}} = ${v.P_allow.toFixed(1)}\\,\\text{kN} \\ge ${P}\\,\\text{kN}$ ($FS = ${v.FS.toFixed(2)}$), ` +
          "and 1 mm thinner would fail to support the design load.",
      };
    },
  },
  hints: [
    "The pin must satisfy two distinct limits: shear capacity $P_{\\text{shear}} = 2 \\tau_{\\text{allow}} [\\frac{\\pi}{4} d^2]$ and bearing capacity $P_{\\text{bearing}} = \\sigma_{b,\\text{allow}} (t \\cdot d)$.",
    "Calculate the minimum diameter for shear: $d_{\\min,\\text{shear}} = \\sqrt{4 P / (2 \\pi \\tau_{\\text{allow}})}$.",
    "Calculate the minimum diameter for bearing: $d_{\\min,\\text{bearing}} = P / (t \\cdot \\sigma_{b,\\text{allow}})$. The larger of the two governs, rounded UP.",
  ],
  explanation:
    "A connecting pin must be sized against both transverse shear and contact bearing. " +
    "For $P = 48\\,\\text{kN}$, $\\tau_{\\text{allow}} = 80\\,\\text{MPa}$ in double shear requires $d \\ge 19.54\\,\\text{mm}$, " +
    "while $\\sigma_{b,\\text{allow}} = 180\\,\\text{MPa}$ with $t = 14\\,\\text{mm}$ requires $d \\ge 19.05\\,\\text{mm}$. " +
    "Pin shear governs here, requiring $d = 20\\,\\text{mm}$ to provide an allowable capacity of $50.3\\,\\text{kN} \\ge 48\\,\\text{kN}$ ($FS = 1.05$).",
};
