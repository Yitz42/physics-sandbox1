// Unit 3.5, stage 2 — predict: equilibrium with directions from coordinates. A different
// picture each version: a crate on two cables to coordinates, a lamp on a spring between two
// points (its length gives its force), a pulley on a cable to coordinates.
// Hand checks in library/mixed-rings.js.

import { use } from "../../../src/core/library.js";
import { crateByCoordinates, springLampByCoordinates, pulleyByCoordinates } from "../library/mixed-rings.js";

export default {
  id: "particle-challenge/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "Coordinates and Equilibrium",
  mission: "Predict the forces holding the ring when every direction comes from coordinates.",
  instructions: "Predict the answers.",
  situations: [
    use(crateByCoordinates, "tensions"),
    use(springLampByCoordinates, "tensions"),
    use(pulleyByCoordinates, "tensions"),
  ],
  hints: [],
  explanation:
    "Chapter 2 gives each direction — $\\mathbf{u} = \\mathbf{r}/r$ from coordinates — and Chapter 3 balances the forces: $\\Sigma F_x = 0$, $\\Sigma F_y = 0$. " +
    "A spring between two points is special: the distance between them IS its length, so its force is known before you start, $F = k(l - l_0)$.",
};
