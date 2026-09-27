// index.js — plugs the statics subject into the core.
//
// Loading this file registers every statics solver by name. Stage files then
// say, for example, solver: "statics.particle", and the core looks it up.
// Later units add more registrations here (statics.truss …).

import { registerSolver } from "../../core/registry.js";
import { registerErrorKinds } from "../../core/diagnosis.js";
import { solveParticle, particleQuantities } from "./particle.js";
import { particleScene } from "./particle-scene.js";
import { particleSummary } from "./particle-summary.js";
import { particleMistakes } from "./particle-mistakes.js";
import { particleHandles, particleDrag, particleFbd, particleMutate } from "./particle-tools.js";
import { solveMoment, momentQuantities } from "./moment.js";
import { momentScene } from "./moment-scene.js";
import { momentHandles, momentDrag, momentMistakes, momentSummary } from "./moment-tools.js";
import { solveCouple, coupleQuantities } from "./couple.js";
import { coupleScene } from "./couple-scene.js";
import { coupleHandles, coupleDrag, coupleMistakes, coupleSummary } from "./couple-tools.js";
import { solveEquivalent, equivalentQuantities } from "./equivalent.js";
import { equivalentScene } from "./equivalent-scene.js";
import { equivalentMistakes, equivalentSummary } from "./equivalent-tools.js";
import { solveDistributed, distributedQuantities } from "./distributed.js";
import { distributedScene } from "./distributed-scene.js";
import { distributedMistakes, distributedSummary } from "./distributed-tools.js";
import { solveRigidBody, rigidBodyEquations, rigidBodyQuantities } from "./rigid-body.js";
import { rigidBodyScene } from "./rigid-body-scene.js";
import { rigidBodyFbd, rigidBodyMutate, rigidBodyMistakes, rigidBodySummary } from "./rigid-body-tools.js";
import { classifySteps } from "./rigid-body-count.js";
import { solveTruss, trussQuantities } from "./truss.js";
import { trussScene, trussFbd, trussMistakes, trussEquations } from "./truss-scene.js";
import { solveTrussZero, trussZeroSummary, zeroSteps, zeroMistakes } from "./truss-zero.js";
import { solveFrame, frameQuantities, frameMistakes } from "./frame.js";
import { frameScene, frameFbd, frameSummary } from "./frame-scene.js";

// Statics' own kinds of mistake (on top of the general ones in core/diagnosis.js:
// sign, trig, algebra, rounding, calculator, vector, missing, extra, direction, concept).
// Every likely-slip a statics solver recognises names one of these, so the
// comprehension page can say where a student is failing.
registerErrorKinds({
  weight: { area: "physics", label: "Using the mass instead of the weight (W = mg)" },
  momentArm: { area: "physics", label: "Wrong moment arm (not the perpendicular distance)" },
  springLength: { area: "physics", label: "Spring stretch vs. length (F = ks, l = l₀ + s)" },
  cablePull: { area: "physics", label: "Cables and springs only pull" },
  pulleyTension: { area: "physics", label: "A cable over a pulley pulls on both sides, with the same tension" },
  loadArea: { area: "physics", label: "A distributed load's size is its area (½ for a triangle, ∫w dx for a curve)" },
  centroid: { area: "physics", label: "A distributed load acts at its centroid" },
  supports: { area: "physics", label: "Which reactions each kind of support gives" },
});

// Units 1–2: forces through one point.
registerSolver("statics.particle", {
  solve: solveParticle,
  // Equations come from a solved result so "define" lines can show their values.
  equations: (setup, result) => (result || solveParticle(setup)).equations,
  summary: particleSummary,
  scene: particleScene,
  quantities: particleQuantities,
  handles: particleHandles,
  drag: particleDrag,
  mistakes: particleMistakes,
  fbd: particleFbd,
  mutate: particleMutate,
});

// Unit 3: moments of forces about a point.
registerSolver("statics.moment", {
  solve: solveMoment,
  equations: (setup, result) => (result || solveMoment(setup)).equations,
  summary: momentSummary,
  scene: momentScene,
  quantities: momentQuantities,
  handles: momentHandles,
  drag: momentDrag,
  mistakes: momentMistakes,
});

// Unit 4: couples — equal, opposite, offset forces that only turn.
registerSolver("statics.couple", {
  solve: solveCouple,
  equations: (setup, result) => (result || solveCouple(setup)).equations,
  summary: coupleSummary,
  scene: coupleScene,
  quantities: coupleQuantities,
  handles: coupleHandles,
  drag: coupleDrag,
  mistakes: coupleMistakes,
});

// Unit 5: equivalent force systems — replace everything with F_R and (M_R)_O,
// or with one force at the right spot.
registerSolver("statics.equivalent", {
  solve: solveEquivalent,
  equations: (setup, result) => (result || solveEquivalent(setup)).equations,
  summary: equivalentSummary,
  scene: equivalentScene,
  quantities: (setup) => equivalentQuantities(setup, coupleQuantities(setup)),
  mistakes: equivalentMistakes,
});

// Unit 6: distributed loads — each replaced by its area, acting at its centroid.
registerSolver("statics.distributed", {
  solve: solveDistributed,
  equations: (setup, result) => (result || solveDistributed(setup)).equations,
  summary: distributedSummary,
  scene: distributedScene,
  quantities: distributedQuantities,
  mistakes: distributedMistakes,
});

// Unit 7 on: a rigid body on supports — reactions, ΣF_x = ΣF_y = ΣM = 0,
// and whether the supports hold it (stable, determinate) or not.
registerSolver("statics.rigidBody", {
  solve: solveRigidBody,
  // Equations of the setup given (a debug stage's wrong FBD has its own).
  equations: (setup, result) => (result && result.equations) || rigidBodyEquations(setup),
  summary: rigidBodySummary,
  scene: rigidBodyScene,
  quantities: rigidBodyQuantities,
  mistakes: rigidBodyMistakes,
  fbd: rigidBodyFbd,
  mutate: rigidBodyMutate,
  debugSteps: classifySteps, // a student's working when classifying a structure (Unit 4.4)
});

// Unit 5.1 on: plane trusses, joint by joint (tension positive); Unit 5.2 adds
// zero-force members found by inspection (values.zeroCount, setup.showZero);
// Unit 5.3 the method of sections (setup.section: cut, keep one part, three equations).
registerSolver("statics.truss", {
  solve: solveTrussZero,
  // (A section's equations are those of the part kept — Unit 5.3, truss-section.js.)
  equations: (setup, result) => (setup.section ? (result && result.sectionEquations) || solveTrussZero(setup).sectionEquations : trussEquations(setup, result || solveTruss(setup))),
  summary: trussZeroSummary,
  scene: trussScene,
  quantities: (setup) => ({ ...trussQuantities(setup), zeroCount: { label: "\\text{zero-force members}", unit: "" } }),
  mistakes: (setup, name) => (name === "zeroCount" ? zeroMistakes(setup) : trussMistakes(setup, name)),
  fbd: trussFbd,
  debugSteps: zeroSteps, // a student's inspection for zero-force members, one line wrong (Unit 5.2)
});

// Unit 5.4: frames and machines — several bodies pinned together, taken apart:
// three equations per body, equal and opposite pin forces, two-force links.
registerSolver("statics.frame", {
  solve: solveFrame,
  equations: (setup, result) => (result || solveFrame(setup)).equations,
  summary: frameSummary,
  scene: frameScene,
  quantities: frameQuantities,
  mistakes: frameMistakes,
  fbd: frameFbd,
});
