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
import { solveCentroid, centroidQuantities, centroidMistakes } from "./centroid.js";
import { centroidScene, centroidSummary } from "./centroid-scene.js";
import { solveInternal, internalQuantities } from "./internal.js";
import { internalScene } from "./internal-scene.js";
import { internalSummary, internalMistakes, internalChoices, internalSteps } from "./internal-tools.js";
import { solveForce3d, force3dQuantities } from "./force3d.js";
import { force3dScene } from "./force3d-scene.js";
import { force3dEquations, force3dSummary, force3dMistakes } from "./force3d-tools.js";
import { force3dSteps } from "./force3d-steps.js";
import { force3dChoices } from "./force3d-choices.js";

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
  centroid: { area: "physics", label: "Where a centroid is (a load's resultant, a triangle's ⅓, a half circle's 4r/3π)" },
  supports: { area: "physics", label: "Which reactions each kind of support gives" },
  friction: { area: "physics", label: "Friction: only as much as equilibrium needs, at most μ_s N, against the motion" },
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

// Unit 2.3: forces in 3D — components from direction angles, an azimuth and elevation,
// or a line between two points (F = F u_AB); size and direction angles; resultants.
registerSolver("statics.force3d", {
  solve: solveForce3d,
  equations: force3dEquations,
  summary: force3dSummary,
  scene: force3dScene,
  quantities: force3dQuantities,
  mistakes: force3dMistakes,
  debugSteps: force3dSteps, // a student's working for a force along a line, one line wrong
  choices: force3dChoices, // a solve stage's lines: r_AB, F_AB, …, F_R
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
  debugSteps: classifySteps, // a student's working when classifying a structure (Unit 5.4)
});

// Unit 6.1 on: plane trusses, joint by joint (tension positive); Unit 6.2 adds
// zero-force members found by inspection (values.zeroCount, setup.showZero);
// Unit 6.3 the method of sections (setup.section: cut, keep one part, three equations).
registerSolver("statics.truss", {
  solve: solveTrussZero,
  // (A section's equations are those of the part kept — Unit 6.3, truss-section.js.)
  equations: (setup, result) => (setup.section ? (result && result.sectionEquations) || solveTrussZero(setup).sectionEquations : trussEquations(setup, result || solveTruss(setup))),
  summary: trussZeroSummary,
  scene: trussScene,
  quantities: (setup) => ({ ...trussQuantities(setup), zeroCount: { label: "\\text{zero-force members}", unit: "" } }),
  mistakes: (setup, name) => (name === "zeroCount" ? zeroMistakes(setup) : trussMistakes(setup, name)),
  fbd: trussFbd,
  debugSteps: zeroSteps, // a student's inspection for zero-force members, one line wrong (Unit 6.2)
});

// Unit 6.4: frames and machines — several bodies pinned together, taken apart:
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

// Unit 7.1: centroids of composite areas, and centres of gravity of composite bodies.
registerSolver("statics.centroid", {
  solve: solveCentroid,
  equations: (setup, result) => (result || solveCentroid(setup)).equations,
  summary: centroidSummary,
  scene: centroidScene,
  quantities: centroidQuantities,
  mistakes: centroidMistakes,
});

// Units 8.1–8.3: internal forces — cut a beam: N, V, M at the cut (the kept piece's
// three equations); V and M along the beam (diagrams); V(x), M(x) segment by segment.
registerSolver("statics.internal", {
  solve: solveInternal,
  equations: (setup, result) => (result || solveInternal(setup)).equations,
  summary: internalSummary,
  scene: internalScene,
  quantities: (setup) => internalQuantities(setup, rigidBodyQuantities(setup)),
  mistakes: internalMistakes,
  choices: internalChoices, // a solve stage's V(x), M(x) lines, segment by segment (7.3)
  debugSteps: internalSteps, // a student's working with one wrong line (7.2, 7.3)
});

// Chapters 9–10 (friction: dry friction, tipping, belts, wedges; moments of inertia) register
// their solvers in their own file.
import "./index-friction.js";
import "./index-intro.js"; // Chapter 1: Newton's laws and units
