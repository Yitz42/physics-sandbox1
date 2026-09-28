// index-friction.js — plugs Chapter 9's solvers (friction) and Chapter 10's (moments of inertia) into the core. Split from index.js
// to keep it small; index.js imports this file, so loading the statics subject loads these too.

import { registerSolver } from "../../core/registry.js";
import { rigidBodySummary, rigidBodyFbd } from "./rigid-body-tools.js";
import { rigidBodyQuantities } from "./rigid-body.js";
import { solveFriction, frictionQuantities, isBody, placeAlong } from "./friction.js";
import { frictionScene, bodyPicture } from "./friction-scene.js";
import { frictionEquations, frictionSummary, frictionMistakes } from "./friction-tools.js";
import { frictionSteps } from "./friction-steps.js";
import { tipSteps } from "./friction-tip-tools.js";
import { solveBelt, beltQuantities, beltEquations, beltSummary, beltMistakes } from "./belt.js";
import { beltScene } from "./belt-scene.js";
import { beltSteps } from "./belt-steps.js";
import { solveWedge, wedgeQuantities, wedgeEquations, wedgeSummary, wedgeMistakes } from "./wedge.js";
import { wedgeScene } from "./wedge-scene.js";
import { solveInertia, inertiaQuantities } from "./inertia.js";
import { inertiaEquations, inertiaSummary, inertiaMistakes, inertiaSteps } from "./inertia-tools.js";
import { inertiaScene } from "./inertia-scene.js";

// Unit 9.1: dry friction — a crate on a ramp or floor (N, the friction needed, and the
// limit μ_s N: holds, impending, slides), or a body with rough contacts (a ladder: the
// rigid-body reactions, each rough contact checked). setup.find: where motion starts.
// Unit 9.2: setup.tipping — the crate may tip about a corner instead (friction-tip.js).
registerSolver("statics.friction", {
  solve: solveFriction,
  equations: (setup) => frictionEquations(setup),
  summary: (setup, result, opts) => (isBody(setup)
    ? [...rigidBodySummary(placeAlong(setup), result, opts), ...frictionSummary(setup, result, opts)]
    : frictionSummary(setup, result, opts)),
  scene: frictionScene,
  quantities: (setup) => frictionQuantities(setup, isBody(setup) ? rigidBodyQuantities(placeAlong(setup)) : {}),
  mistakes: frictionMistakes,
  // (A ladder's FBD, drawn by the student; a crate's is drawn for them.)
  fbd: (setup, sceneOpts) => (isBody(setup) ? rigidBodyFbd(bodyPicture(setup), sceneOpts) : { forces: [], directions: [], origin: [0, 0] }),
  // A student's working for a crate, one line wrong (tipping or slipping: Unit 9.2).
  debugSteps: (setup, mutation) => (setup.tipping ? tipSteps(setup, mutation) : frictionSteps(setup, mutation)),
});

// Unit 9.3: belt friction — a rope round a rough post, T₂ = T₁ e^{μβ} (β in radians):
// the hand pull, the load held, or the wrap needed.
registerSolver("statics.belt", {
  solve: solveBelt,
  equations: (setup, result) => beltEquations(setup, result),
  summary: beltSummary,
  scene: beltScene,
  quantities: beltQuantities,
  mistakes: beltMistakes,
  debugSteps: beltSteps, // a student's working for the hand pull, one line wrong
});

// Unit 9.3: wedges — a wedge driven under a block against a wall; friction μN at all three
// contacts, against each surface's sliding; the push to drive it in, or the pull to get it out.
registerSolver("statics.wedge", {
  solve: solveWedge,
  equations: (setup) => wedgeEquations(setup),
  summary: wedgeSummary,
  scene: wedgeScene,
  quantities: wedgeQuantities,
  mistakes: wedgeMistakes,
});

// Unit 10.1: area moments of inertia of beam sections — Ī of each part, moved to the section's
// centroid by the parallel-axis theorem, Ī_x = Σ(Ī + A d²); about another axis too (setup.axis).
registerSolver("statics.inertia", {
  solve: solveInertia,
  equations: (setup) => inertiaEquations(setup),
  summary: inertiaSummary,
  scene: inertiaScene,
  quantities: inertiaQuantities,
  mistakes: inertiaMistakes,
  debugSteps: inertiaSteps, // a student's working for a two-part section, one line wrong
});
