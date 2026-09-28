// Unit 3.4, stage 6 — solve: a lamp hanging on three cables in a hall — choose the three
// equilibrium equations, then solve them (library/particles3d.js, hallLamp; hand check there).

import { use } from "../../../src/core/library.js";
import { hallLamp } from "../library/particles3d.js";

export default {
  id: "particles-3d/6-solve",
  challenge: "solve",
  solver: "statics.force3d",
  title: "The Hall Lamp",
  mission: "Find the tensions in three cables holding a lamp in space: equations, then answers.",
  ...use(hallLamp, "solve"),
  explanation:
    "Four steps, always the same: (1) each cable's $\\mathbf{r}$ = anchor − A and its length; (2) $\\mathbf{T} = T\\,\\mathbf{r}/r$; (3) add the $\\mathbf{i}$, $\\mathbf{j}$ and $\\mathbf{k}$ parts of every force, weight included, and set each sum to zero; " +
    "(4) solve the three equations together.",
};
