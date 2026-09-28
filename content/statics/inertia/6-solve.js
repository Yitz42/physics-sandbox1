// Unit 10.1, stage 6 — solve: a T-beam or an I-beam with unequal flanges — the centroid, then Ī_x
// = Σ(Ī + A d²). Hand checks in library/sections.js: T-beam ȳ = 135.45 mm, 26.18; unequal I ȳ = 98.0 mm, 98.89 ×10⁶ mm⁴.

import { use } from "../../../src/core/library.js";
import { tBeam, unequalI } from "../library/sections.js";

export default {
  id: "inertia/6-solve",
  challenge: "solve",
  solver: "statics.inertia",
  title: "Section Properties",
  mission: "Find a beam section's centroid and its moment of inertia, step by step.",
  situations: [use(tBeam, "tee", { setup: { ...tBeam.setup, showParts: true } }), use(unequalI, "tee", { setup: { ...unequalI.setup, showParts: true } })],
  solve: {
    steps: ["equations", "answer"],
    equationMode: "numeric",
    intros: {
      equations: "Choose the correct equation in each group: the total area, its first moment (for ȳ), and $\\bar{I}_x$ by the parallel-axis theorem.",
    },
  },
  explanation:
    "The centroid first (ȳ = ΣỹA/ΣA), because every d is measured to it. Then each part's own Ī plus its $A d^2$. " +
    "The flanges, far from the centroid, carry most of $\\bar{I}_x$ through their $A d^2$.",
};
