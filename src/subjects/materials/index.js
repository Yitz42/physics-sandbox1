// index.js — plugs the Mechanics of Materials subject into the core.
//
// Registers every materials solver by name (Chapter 1: Stress):
//   materials.axialStress     normal stress in axially loaded members (σ = P / A), Unit 1.1
//   materials.shearStress     direct shear (τ = V / A, V = P / n), Unit 1.2
//   materials.bearingStress   bearing stress (σ_b = P / A_b, A_b = t d), Unit 1.3
//   materials.allowableStress allowable load: the weakest of tension, shear and bearing, Unit 1.4
// Planned for later units (see docs/CURRICULUM.md):
//   materials.torsion       torsional shear (τ = T ρ / J) and twist angle
//   materials.bending       beam flexure (σ = −M y / I)
//   materials.transverse    transverse shear (τ = V Q / I t)
//   materials.mohr          Mohr's circle and stress transformation

import { registerSolver } from "../../core/registry.js";
import { registerErrorKinds } from "../../core/diagnosis.js";
import { solveAxialStress } from "./axial-stress.js";
import { axialStressEquations, axialStressSummary, axialStressQuantities, axialStressMistakes } from "./axial-stress-tools.js";
import { axialStressDebug } from "./axial-stress-steps.js";
import { axialStressScene } from "./axial-stress-scene.js";

import { solveShearStress } from "./shear-stress.js";
import { shearStressEquations, shearStressSummary, shearStressQuantities, shearStressMistakes, shearStressDebug } from "./shear-stress-tools.js";
import { shearStressScene } from "./shear-stress-scene.js";

import { solveBearingStress } from "./bearing-stress.js";
import { bearingStressEquations, bearingStressSummary, bearingStressQuantities, bearingStressMistakes, bearingStressDebug } from "./bearing-stress-tools.js";
import { bearingStressScene } from "./bearing-stress-scene.js";

import { solveAllowableStress } from "./allowable-stress.js";
import { allowableStressEquations, allowableStressSummary, allowableStressQuantities, allowableStressMistakes } from "./allowable-stress-tools.js";
import { allowableStressDebug } from "./allowable-stress-steps.js";
import { allowableStressScene } from "./allowable-stress-scene.js";


// Error kinds specific to Mechanics of Materials.
registerErrorKinds({
  units: { area: "math", label: "Unit conversions (kN to N, MPa = N/mm²)" },
  geometry: { area: "math", label: "Geometry and area formulas (circle vs rectangle)" },
  stressArea: { area: "physics", label: "Cross-sectional area formulas (π d² / 4 vs π d²)" },
  stressSign: { area: "physics", label: "Tension (+) vs compression (−)" },
});

const texts = {
  wrong: "Read the note under your answer — it explains the likely slip — fix it, and press Test again.",
  correct: "The equations panel now shows the calculation steps.",
  otherwise: "That doesn't match. Work it out using the governing stress formula, keeping units in N and mm².",
};

// Unit 1.1: Normal stress in axially loaded members.
registerSolver("materials.axialStress", {
  solve: (setup) => solveAxialStress(setup),
  equations: axialStressEquations,
  summary: axialStressSummary,
  scene: axialStressScene,
  quantities: axialStressQuantities,
  mistakes: axialStressMistakes,
  debugSteps: axialStressDebug,
  texts,
});

// Unit 1.2: Direct shear stress in pins, bolts, and lap joints.
registerSolver("materials.shearStress", {
  solve: (setup) => solveShearStress(setup),
  equations: shearStressEquations,
  summary: shearStressSummary,
  scene: shearStressScene,
  quantities: shearStressQuantities,
  mistakes: shearStressMistakes,
  debugSteps: shearStressDebug,
  texts,
});

// Unit 1.3: Bearing stress in pinned connections.
registerSolver("materials.bearingStress", {
  solve: (setup) => solveBearingStress(setup),
  equations: bearingStressEquations,
  summary: bearingStressSummary,
  scene: bearingStressScene,
  quantities: bearingStressQuantities,
  mistakes: bearingStressMistakes,
  debugSteps: bearingStressDebug,
  texts,
});

// Unit 1.4: Allowable stress design and factor of safety.
registerSolver("materials.allowableStress", {
  solve: (setup) => solveAllowableStress(setup),
  equations: allowableStressEquations,
  summary: allowableStressSummary,
  scene: allowableStressScene,
  quantities: allowableStressQuantities,
  mistakes: allowableStressMistakes,
  debugSteps: allowableStressDebug,
  texts,
});




