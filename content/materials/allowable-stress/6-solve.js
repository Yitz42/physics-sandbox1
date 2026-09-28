// Allowable stress, stage 6 — solve: comprehensive structural connection design problem.
// Hand check (default numbers):
//   Rod d = 26 mm, σ_allow = 140 MPa → A_rod = 530.9 mm² → P_tension = 74.3 kN.
//   Pin d = 20 mm, double shear (n=2), τ_allow = 85 MPa → A_pin = 314.2 mm² → P_shear = 53.4 kN.
//   Plate t = 15 mm, d = 20 mm, σ_b,allow = 190 MPa → A_b = 300 mm² → P_bearing = 57.0 kN.
//   P_allow = min(74.3, 53.4, 57.0) = 53.4 kN (governed by pin shear).

export default {
  id: "allowable-stress/6-solve",
  challenge: "solve",
  solver: "materials.allowableStress",
  title: "Connection Capacity Evaluation",
  mission: "Determine the allowable load and governing failure mode for a structural connection.",
  instructions:
    "A steel clevis connection attaches a cylindrical tension rod to a fixed bracket with a pin in double shear ($n = 2$ shear planes); their diameters are in the picture. " +
    "The bracket plates' thickness is marked on the picture, and the allowable stresses for the rod, the pin and the plate are listed in its corner.\n\n" +
    "Work through the complete solution: evaluate the maximum safe load for each of the three failure modes, then determine the overall allowable load $P_{\\text{allow}}$.",
  setup: {
    rod: { diameter: 26, allowableStress: 140 },
    joint: { planes: 2, pinDiameter: 20, plateThickness: 15, allowableShear: 85, allowableBearing: 190 },
    load: { P: 50 },
  },
  vary: [
    { path: "rod.diameter", values: [22, 24, 25, 26, 28, 30, 32, 34] },
    { path: "joint.pinDiameter", values: [16, 18, 19, 20, 22, 24, 25, 26] },
  ],
  solve: {
    steps: ["choices", "answer"],
    choicesName: "Failure modes and governing equations",
    choices: [
      {
        title: "Because all three stresses act simultaneously under the applied load, the overall safe allowable load is…",
        options: [
          {
            tex: "P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})",
            correct: true,
          },
          {
            tex: "P_{\\text{allow}} = \\max(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})",
            kind: "concept",
            feedback: "The assembly fails at its lowest limit: taking the maximum would cause the weaker modes to fail.",
          },
          {
            tex: "P_{\\text{allow}} = \\tfrac{1}{3}(P_{\\text{tension}} + P_{\\text{shear}} + P_{\\text{bearing}})",
            kind: "concept",
            feedback: "A structure does not average capacities; failure begins at the weakest link.",
          },
        ],
      },
      {
        title: "The allowable load governed by pin shear in double shear is…",
        options: [
          {
            tex: "P_{\\text{shear}} = 2 \\cdot \\tau_{\\text{allow}} \\left(\\tfrac{\\pi}{4} d_{\\text{pin}}^2\\right)",
            correct: true,
          },
          {
            tex: "P_{\\text{shear}} = \\tau_{\\text{allow}} \\left(\\tfrac{\\pi}{4} d_{\\text{pin}}^2\\right)",
            kind: "concept",
            feedback: "In double shear, the pin must slice across TWO planes, which doubles its total shear capacity.",
          },
          {
            tex: "P_{\\text{shear}} = \\tau_{\\text{allow}} (\\pi d_{\\text{pin}})",
            kind: "geometry",
            feedback: "Shear capacity is allowable stress multiplied by cross-sectional area, not circumference.",
          },
        ],
      },
    ],
    choicesDone: "Governing principles confirmed. Now calculate the capacities.",
  },
  ask: [
    { quantity: "P_tension", precision: 0.1 },
    { quantity: "P_shear", precision: 0.1 },
    { quantity: "P_bearing", precision: 0.1 },
    { quantity: "P_allow", precision: 0.1 },
  ],
  hints: [
    "Tensile capacity: $P_{\\text{tension}} = \\sigma_{\\text{allow}} [\\frac{\\pi}{4} d_{\\text{rod}}^2] / 1000$.",
    "Double-shear pin capacity: $P_{\\text{shear}} = 2 \\tau_{\\text{allow}} [\\frac{\\pi}{4} d_{\\text{pin}}^2] / 1000$.",
    "Bearing capacity: $P_{\\text{bearing}} = \\sigma_{b,\\text{allow}} (t \\cdot d_{\\text{pin}}) / 1000$.",
    "Overall allowable load: $P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})$.",
  ],
  explanation:
    "For example, with a 26 mm rod and a 20 mm pin: 1. Rod tension: $P_{\\text{tension}} = (140\\,\\text{MPa})[\\frac{\\pi}{4}(26\\,\\text{mm})^2] = 74.33\\,\\text{kN}$. " +
    "2. Pin shear: $P_{\\text{shear}} = 2(85\\,\\text{MPa})[\\frac{\\pi}{4}(20\\,\\text{mm})^2] = 53.41\\,\\text{kN}$. " +
    "3. Plate bearing: $P_{\\text{bearing}} = (190\\,\\text{MPa})(15\\,\\text{mm})(20\\,\\text{mm}) = 57.00\\,\\text{kN}$. " +
    "The overall allowable load is $P_{\\text{allow}} = \\min(74.33, 53.41, 57.00) = 53.4\\,\\text{kN}$, governed by pin shear.",
};
