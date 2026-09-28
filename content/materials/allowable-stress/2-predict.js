// Allowable stress, stage 2 — predict: predict allowable loads for tension, shear, and overall limit.
// Hand check (default numbers):
//   Rod d = 22 mm, σ_allow = 120 MPa: A_rod = 380.1 mm² → P_tension = 45.6 kN.
//   Pin d = 18 mm, double shear (n=2), τ_allow = 75 MPa: A_pin = 254.5 mm² → P_shear = 38.2 kN.
//   Bearing t = 12 mm, d = 18 mm, σ_b,allow = 180 MPa: A_b = 216 mm² → P_bearing = 38.9 kN.
//   P_allow = min(45.6, 38.2, 38.9) = 38.2 kN (governed by pin shear).

export default {
  id: "allowable-stress/2-predict",
  challenge: "predict",
  solver: "materials.allowableStress",
  title: "Predicting the Weakest Link",
  mission: "Predict the allowable load for each failure mode and identify which mode governs.",
  instructions:
    "A structural tension rod is pinned into a clevis bracket (the pin is in double shear). The rod, the pin and the plate each have an " +
    "allowable stress, listed in the corner of the picture, and their sizes are marked on it.\n\n" +
    "Predict the maximum allowable tension force $P_{\\text{tension}}$ (in kN), the pin shear capacity $P_{\\text{shear}}$ (in kN), " +
    "and the overall safe allowable load $P_{\\text{allow}}$ (in kN), then press **Test**.",
  setup: {
    rod: { diameter: 22, allowableStress: 120 },
    joint: { planes: 2, pinDiameter: 18, plateThickness: 12, allowableShear: 75, allowableBearing: 180 },
    load: { P: 35 },
  },
  vary: [
    { path: "rod.diameter", values: [18, 20, 22, 24, 25, 26, 28, 30] },
    { path: "joint.pinDiameter", values: [14, 15, 16, 17, 18, 19, 20, 22] },
  ],
  ask: [
    { quantity: "P_tension", precision: 0.1 },
    { quantity: "P_shear", precision: 0.1 },
    { quantity: "P_allow", precision: 0.1 },
  ],
  hints: [
    "Tensile capacity: $P_{\\text{tension}} = \\sigma_{\\text{allow}} \\cdot [\\frac{\\pi}{4} d_{\\text{rod}}^2] / 1000$ in kN.",
    "Pin shear capacity: in double shear, two planes resist the force, so $P_{\\text{shear}} = 2 \\cdot \\tau_{\\text{allow}} \\cdot [\\frac{\\pi}{4} d_{\\text{pin}}^2] / 1000$ in kN.",
    "Overall allowable load is the minimum of the three failure mode capacities: $P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})$.",
  ],
  // (The diameters change between versions: the working itself is under the equations after Test.)
  explanation:
    "For example, with a 22 mm rod and an 18 mm pin. First, calculate the tensile capacity of the rod: " +
    "$P_{\\text{tension}} = (120\\,\\text{MPa})[\\frac{\\pi}{4}(22\\,\\text{mm})^2] = 45.62\\,\\text{kN}$. " +
    "Next, compute the pin shear capacity in double shear: " +
    "$P_{\\text{shear}} = 2(75\\,\\text{MPa})[\\frac{\\pi}{4}(18\\,\\text{mm})^2] = 38.17\\,\\text{kN}$. " +
    "The bearing capacity is $P_{\\text{bearing}} = (180\\,\\text{MPa})(12\\,\\text{mm})(18\\,\\text{mm}) = 38.88\\,\\text{kN}$. " +
    "Because the connection fails at its weakest limit, $P_{\\text{allow}} = \\min(45.62, 38.17, 38.88) = 38.2\\,\\text{kN}$, governed by pin shear.",
};
