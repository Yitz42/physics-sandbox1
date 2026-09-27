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
import { registerErrorKinds } from "../../core/diagnosis.js";
import { solveBlocks, blockQuantities, blockMistakes, blockSummary, blockChoices, blockDebug } from "./block-tools.js";
import { blockScene } from "./block-layout.js";
import { blockTargets } from "./block-targets.js";
import { CONNECTIONS, makeBlock, nextName, insertBlock, leafNames } from "./block-edit.js";
import { RULES, checkRule, checkFormula, groupNode, combineGroup, formulaTex, tfTex, groupFormula } from "./block-combine.js";
import { reduce, blockTex } from "./block-diagram.js";
import { parseExpr, exprTex } from "../../core/expr.js";

// The block diagram workbench (build a diagram, then combine its blocks by
// hand): everything the page needs, so challenges/workbench.js stays free of
// controls code. See block-edit.js and block-combine.js.
const workbench = {
  connections: CONNECTIONS,
  rules: RULES,
  makeBlock, nextName, leafNames, blockTex, tfTex,
  insert: insertBlock,
  targets: blockTargets,
  checkRule, checkFormula, groupNode, formulaTex,
  combine: combineGroup,
  // The group's correct formula as KaTeX, in its parts' names (for "Show answer").
  answerTex: (node, texOf) => exprTex(groupFormula(node), texOf),
  // A formula being typed, drawn as it will read (null while it doesn't parse yet).
  previewTex(text, names, texOf) {
    try {
      return exprTex(parseExpr(text, names), texOf);
    } catch {
      return null;
    }
  },
  // The whole diagram's transfer function (numbers, when every block has them).
  total: (tree) => (tree ? reduce({ diagram: tree }).T : null),
};
import { solveSignalFlow, signalQuantities, signalMistakes, signalSummary, signalChoices, signalDebug } from "./signal-flow-tools.js";
import { signalScene } from "./signal-flow-scene.js";

// Controls' own kinds of mistake (on top of the general ones in core/diagnosis.js).
registerErrorKinds({
  blockRule: { area: "physics", label: "Block rules (series multiply, parallel add, loop G/(1 ± GH))" },
  touching: { area: "physics", label: "Which loops touch (Δ and Δₖ in Mason's rule)" },
});

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
  workbench,
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
