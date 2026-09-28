// Unit 9.3, stage 6 — solve: a wedge driven under a machine (or a door), from the four equations to the push.
// Hand checks in library/wedges-belts.js: machine N₁ = 5050.6 N, N₂ = 2369.2 N, P = 3782.5 N;
//   door on a roller guide N₁ = 3239.2 N, N₂ = 1465.6 N, P = 2215.6 N.

import { use } from "../../../src/core/library.js";
import { machineWedge, rollerWall } from "../library/wedges-belts.js";

const fbd = (sc) => use(sc, "push", { setup: { ...sc.setup, showFbd: "always" } });

export default {
  id: "wedges-belts/6-solve",
  challenge: "solve",
  solver: "statics.wedge",
  title: "Drive the Wedge",
  mission: "Write the wedge's and the block's equations, then find the push that drives the wedge in.",
  situations: [fbd(machineWedge), fbd(rollerWall)],
  solve: {
    steps: ["equations", "answer"],
    equationMode: "symbolic",
    intros: {
      equations: "The free-body diagrams are drawn (right): the block lifted off the wedge. Choose the correct equation in each group — two for the block, two for the wedge.",
    },
  },
  explanation:
    "At each rough contact: N square to the surface, $\\mu_s N$ along it, against that surface's sliding (the block rises, the wedge moves left under it). " +
    "The block's two equations give $N_1$ and $N_2$; the wedge's give $N_3$ and then P. The same friction $F_1$ acts on both bodies, equal and opposite.",
};
