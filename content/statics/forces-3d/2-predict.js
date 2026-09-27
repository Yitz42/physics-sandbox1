// Unit 2.3, stage 2 — predict: components from direction angles (γ from α and β), from an
// azimuth and elevation, and along a cable; the size and angles from components.
// Hand checks in library/forces3d.js.

import { use } from "../../../src/core/library.js";
import { eyeboltForce, antennaForce, flagpoleCable, bracketForce } from "../library/forces3d.js";

export default {
  id: "forces-3d/2-predict",
  challenge: "predict",
  solver: "statics.force3d",
  title: "Components in Space",
  mission: "Predict a force's components in 3D, and its size and angles.",
  instructions: "Predict the answers.",
  situations: [
    use(eyeboltForce, "components"),
    use(antennaForce, "components"),
    use(flagpoleCable, "components"),
    use(bracketForce, "size"),
  ],
  hints: [],
  explanation:
    "However a force's direction is given, it comes down to a unit vector $\\mathbf{u}$: $(\\cos\\alpha, \\cos\\beta, \\cos\\gamma)$, " +
    "$(\\cos\\phi\\cos\\theta, \\cos\\phi\\sin\\theta, \\sin\\phi)$, or $\\mathbf{r}_{AB}/r_{AB}$. Then $\\mathbf{F} = F\\,\\mathbf{u}$.",
};
