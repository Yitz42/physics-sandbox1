// index.js — plugs the statics subject into the core.
//
// Loading this file registers every statics solver by name. Stage files then
// say, for example, solver: "statics.particle", and the core looks it up.
// Later units add more registrations here (statics.rigidBody, statics.truss …).

import { registerSolver } from "../../core/registry.js";
import { solveParticle, particleQuantities } from "./particle.js";
import { particleScene } from "./particle-scene.js";
import { particleSummary } from "./particle-summary.js";
import { particleMistakes } from "./particle-mistakes.js";
import { particleHandles, particleDrag, particleFbd, particleMutate } from "./particle-tools.js";
import { solveMoment, momentQuantities } from "./moment.js";
import { momentScene } from "./moment-scene.js";
import { momentHandles, momentDrag, momentMistakes, momentSummary } from "./moment-tools.js";

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
