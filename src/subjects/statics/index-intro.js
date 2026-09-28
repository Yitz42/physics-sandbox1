// index-intro.js — plugs Chapter 1's solver (Newton's laws and units) into the core.
// Split from index.js to keep it small; index.js imports this file.

import { registerSolver } from "../../core/registry.js";
import { solveNewton, newtonQuantities, newtonEquations, newtonSummary, newtonMistakes } from "./newton.js";
import { newtonScene } from "./newton-scene.js";
import { newtonSteps } from "./newton-steps.js";

// Unit 1.1: one body — W = mg (on any planet), and ΣF = m a with at most one unknown force
// (a = 0: at rest, the first law); or, with every force known, the net force and a = F/m.
registerSolver("statics.newton", {
  solve: solveNewton,
  equations: (setup) => newtonEquations(setup),
  summary: newtonSummary,
  scene: newtonScene,
  quantities: newtonQuantities,
  mistakes: newtonMistakes,
  debugSteps: newtonSteps, // a student's working for a hanging crate, one line wrong
});
