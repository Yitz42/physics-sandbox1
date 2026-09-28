// allowable-stress-tools.js — equations, summary, quantities, and debug steps for allowable stress design (Unit 1.4).

import { fixedTex, sigFig } from "../../core/units.js";
import { solveAllowableStress } from "./allowable-stress.js";

// KaTeX equations for allowable stress design and simultaneous failure modes.
export function allowableStressEquations(setup = {}, result) {
  const res = result || solveAllowableStress(setup);
  const v = res.values;
  const kN = (x) => `${sigFig(x, 4)}\\,\\text{kN}`;

  return [
    // 1. Tensile capacity of the rod
    {
      id: "tensile-capacity",
      lhs: "P_{\\text{tension}}",
      form: "define",
      terms: [
        {
          id: "Pt_calc",
          sign: 1,
          symbol: "\\sigma_{\\text{allow}} \\cdot A_{\\text{rod}}",
          value: v.P_tension,
          numTex: `(${sigFig(v.sigma_allow, 4)}\\,\\text{MPa})(${sigFig(v.A_rod, 4)}\\,\\text{mm}^2)`,
        },
      ],
      result: { value: v.P_tension, unit: "kN" },
    },
    // 2. Shear capacity of the pin
    {
      id: "shear-capacity",
      lhs: "P_{\\text{shear}}",
      form: "define",
      terms: [
        {
          id: "Ps_calc",
          sign: 1,
          symbol: v.n === 1 ? "\\tau_{\\text{allow}} \\cdot A_{\\text{pin}}" : `2 \\cdot \\tau_{\\text{allow}} \\cdot A_{\\text{pin}}`,
          value: v.P_shear,
          numTex: v.n === 1
            ? `(${sigFig(v.tau_allow, 4)}\\,\\text{MPa})(${sigFig(v.A_pin, 4)}\\,\\text{mm}^2)`
            : `2(${sigFig(v.tau_allow, 4)}\\,\\text{MPa})(${sigFig(v.A_pin, 4)}\\,\\text{mm}^2)`,
        },
      ],
      result: { value: v.P_shear, unit: "kN" },
    },
    // 3. Bearing capacity of the plate hole
    {
      id: "bearing-capacity",
      lhs: "P_{\\text{bearing}}",
      form: "define",
      terms: [
        {
          id: "Pb_calc",
          sign: 1,
          symbol: "\\sigma_{b,\\text{allow}} \\cdot (t \\cdot d)",
          value: v.P_bearing,
          numTex: `(${sigFig(v.sigma_b_allow, 4)}\\,\\text{MPa})(${sigFig(v.A_b, 4)}\\,\\text{mm}^2)`,
        },
      ],
      result: { value: v.P_bearing, unit: "kN" },
    },
    // 4. Overall allowable load: minimum of the three failure limits
    {
      id: "allowable-load",
      lhs: "P_{\\text{allow}}",
      form: "define",
      terms: [
        {
          id: "Pallow_calc",
          sign: 1,
          symbol: "\\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})",
          value: v.P_allow,
          numTex: `\\min(${kN(v.P_tension)}, ${kN(v.P_shear)}, ${kN(v.P_bearing)})`,
        },
      ],
      result: { value: v.P_allow, unit: "kN" },
    },
  ];
}

// The full working under the equations panel, once the answer is revealed.
export function allowableStressSummary(setup = {}, result, { reveal = true } = {}) {
  if (!reveal) return [];
  const res = result || solveAllowableStress(setup);
  const v = res.values;

  const lines = [
    `P_{\\text{tension}} = \\sigma_{\\text{allow}} A_{\\text{rod}} = (${fixedTex(v.sigma_allow, "", 1)}\\,\\text{MPa})(${fixedTex(v.A_rod, "", 1)}\\,\\text{mm}^2) = ${fixedTex(v.P_tension, "kN", 1)}`,
    v.n === 2
      ? `P_{\\text{shear}} = 2 \\tau_{\\text{allow}} A_{\\text{pin}} = 2 (${fixedTex(v.tau_allow, "", 1)}\\,\\text{MPa})(${fixedTex(v.A_pin, "", 1)}\\,\\text{mm}^2) = ${fixedTex(v.P_shear, "kN", 1)}`
      : `P_{\\text{shear}} = \\tau_{\\text{allow}} A_{\\text{pin}} = (${fixedTex(v.tau_allow, "", 1)}\\,\\text{MPa})(${fixedTex(v.A_pin, "", 1)}\\,\\text{mm}^2) = ${fixedTex(v.P_shear, "kN", 1)}`,
    `P_{\\text{bearing}} = \\sigma_{b,\\text{allow}} (t \\cdot d) = (${fixedTex(v.sigma_b_allow, "", 1)}\\,\\text{MPa})(${fixedTex(v.A_b, "", 1)}\\,\\text{mm}^2) = ${fixedTex(v.P_bearing, "kN", 1)}`,
    `P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}}) = ${fixedTex(v.P_allow, "kN", 1)}\\quad\\text{(governed by ${v.governing})}`,
  ];

  if (v.FS != null) {
    lines.push(`FS = \\dfrac{P_{\\text{allow}}}{P} = \\dfrac{${fixedTex(v.P_allow, "kN", 1)}}{${fixedTex(v.P, "kN", 1)}} = ${fixedTex(v.FS, "", 2)}`);
  }

  return lines;
}

export function allowableStressQuantities() {
  return {
    P: { label: "P", unit: "kN", name: "Applied load" },
    P_allow: { label: "P_{\\text{allow}}", unit: "kN", name: "Allowable load" },
    P_tension: { label: "P_{\\text{tension}}", unit: "kN", name: "Tension limit" },
    P_shear: { label: "P_{\\text{shear}}", unit: "kN", name: "Shear limit" },
    P_bearing: { label: "P_{\\text{bearing}}", unit: "kN", name: "Bearing limit" },
    sigma: { label: "\\sigma", unit: "MPa", name: "Tensile stress" },
    tau: { label: "\\tau", unit: "MPa", name: "Shear stress" },
    sigma_b: { label: "\\sigma_b", unit: "MPa", name: "Bearing stress" },
    FS: { label: "FS", unit: "", name: "Factor of safety" },
  };
}

// Wrong answers common slips give: [{ value, message, kind }].
export function allowableStressMistakes(setup = {}, name) {
  const res = solveAllowableStress(setup);
  const v = res.values;
  const right = v[name];
  if (right == null) return [];

  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };

  if (name === "P_allow") {
    // Slip: took maximum instead of minimum (overdesigning / unsafe!)
    const maxVal = Math.max(v.P_tension, v.P_shear, v.P_bearing);
    add(maxVal, "The allowable load is governed by the WEAKEST link: take the minimum of the capacities, not the maximum.", "concept");

    // Slip: forgot double shear
    if (v.n === 2) {
      const halfShearP = Math.min(v.P_tension, v.P_shear / 2, v.P_bearing);
      add(halfShearP, "Did you treat the pin as single shear instead of double shear? In double shear, $P_{\\text{shear}} = 2 \\tau_{\\text{allow}} A_{\\text{pin}}$.", "concept");
    }

    // Slip: units slip (forgot / 1000)
    add(right * 1000, "Units slip: allowable load is in kN ($1\\text{ kN} = 1000\\text{ N}$).", "units");
  }

  // Each capacity: allowable stress × its area, in kN.
  const PI = Math.PI;
  if (name === "P_tension") {
    add((v.sigma_allow * PI * v.d_rod * v.d_rod) / 1000, "That uses $A = \\pi d^2$. The rod's area is $\\frac{\\pi}{4} d^2$.", "algebra");
    add(right * 1000, "That's in newtons. MPa × mm² gives N: divide by 1000 for kN.", "units");
  }
  if (name === "P_shear") {
    if (v.n === 2) add(right / 2, "In double shear the pin must be cut across TWO planes: $P_{\\text{shear}} = 2\\,\\tau_{\\text{allow}} A_{\\text{pin}}$.", "concept");
    add((v.n * v.tau_allow * PI * v.d_pin * v.d_pin) / 1000, "That uses $A = \\pi d^2$. The pin's area is $\\frac{\\pi}{4} d^2$.", "algebra");
    add(right * 1000, "That's in newtons. MPa × mm² gives N: divide by 1000 for kN.", "units");
  }
  if (name === "P_bearing") {
    add((v.sigma_b_allow * (PI / 2) * v.d_pin * v.t_plate) / 1000, "That uses the curved half-hole area $\\frac{\\pi}{2} d t$. Bearing uses the projected rectangle, $A_b = t \\cdot d$.", "geometry");
    add((v.sigma_b_allow * v.t_plate * v.d_rod) / 1000, "That uses the ROD's diameter. The bearing area is where the PIN presses on the plate: $t \\cdot d_{\\text{pin}}$.", "concept");
    add(right * 1000, "That's in newtons. MPa × mm² gives N: divide by 1000 for kN.", "units");
  }

  if (name === "FS") {
    // Slip: inverted FS (P / P_allow)
    if (v.P_allow > 0) {
      add(v.P / v.P_allow, "Factor of safety is capacity over demand: $FS = P_{\\text{allow}} / P$, not $P / P_{\\text{allow}}$.", "algebra");
    }
  }

  return list;
}
