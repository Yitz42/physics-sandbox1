// index.js — plugs the automatic controls subject into the core.
//
// Loading this file registers every controls solver by name, the same way
// statics does (src/subjects/statics/index.js). Stage files then say, for
// example, solver: "controls.blockDiagram", and the core looks it up.
//
// Built so far (Nise chapter 5):
//   controls.blockDiagram   block diagram reduction (series, parallel, feedback loops)
//   controls.signalFlow     signal-flow graphs and Mason's rule
// Planned, as their units are built (see docs/CURRICULUM.md, "Automatic controls"):
//   controls.firstOrder / secondOrder (time response), controls.stability (Routh–Hurwitz),
//   controls.steadyState, controls.rootLocus, controls.frequency (Bode, Nyquist),
//   controls.pid (compensators), controls.stateSpace.
// Their pictures will need plots (step responses, pole-zero maps, Bode plots),
// added to src/render/ as general drawing tools, not controls code.

import { registerSolver } from "../../core/registry.js";
import { solveBlocks, blockQuantities, blockMistakes, blockSummary, blockChoices, blockDebug } from "./block-tools.js";
import { blockScene } from "./block-layout.js";
import { solveSignalFlow, signalQuantities, signalMistakes, signalSummary, signalChoices, signalDebug } from "./signal-flow-tools.js";
import { signalScene } from "./signal-flow-scene.js";

// Wording for the challenges (their defaults talk about force arrows).
const texts = {
  wrong: "Read the note under each red box — it names the likely slip — fix it, and press Test again.",
  correct: "The equations panel now shows the working, step by step.",
  // After a wrong number that matches no known slip:
  otherwise: "That doesn't match. Work it out in symbols first, then put in the numbers — and write T(s) with the bottom's first coefficient equal to 1.",
};

// Chapter 5: block diagrams, reduced step by step.
registerSolver("controls.blockDiagram", {
  solve: (setup) => solveBlocks(setup),
  equations: () => [], // everything is in the summary lines
  summary: blockSummary,
  scene: blockScene,
  quantities: blockQuantities,
  mistakes: blockMistakes,
  choices: blockChoices,
  debugSteps: blockDebug,
  texts,
});

// Chapter 5: signal-flow graphs and Mason's rule.
registerSolver("controls.signalFlow", {
  solve: (setup) => solveSignalFlow(setup),
  equations: () => [],
  summary: signalSummary,
  scene: signalScene,
  quantities: signalQuantities,
  mistakes: signalMistakes,
  choices: signalChoices,
  debugSteps: signalDebug,
  texts: {
    ...texts,
    otherwise: "That doesn't match. List every forward path, every loop and every non-touching pair first, then build Δ and each Δ_k.",
  },
});
