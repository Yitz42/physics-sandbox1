// Unit 8.2, stage 2 — predict the largest bending moment (and where it is) on five beams.
// The beams and their hand checks are in the lesson library (library/internal.js):
//   shelf M_max = 1600 N·m (at the load);  uniform span wL²/8 = 1250 N·m;  half-loaded 1012.5 N·m at 2.25 m;
//   overhang −600 N·m (over B, bigger than the +337.5 in the span);  cantilever −1800 N·m (at the wall).

import { use, edit } from "../../../src/core/library.js";
import { shelf, cantileverCut, overhangAll, halfLoaded, uniformSpan } from "../library/internal.js";

// The "cut" beams, drawn with their diagrams instead of cut apart.
const whole = (sc) => edit(sc, { set: { view: "diagrams" }, remove: ["cut", ...(sc.setup.keep ? ["keep"] : [])] });

export default {
  id: "shear-moment-diagrams/2-predict",
  challenge: "predict",
  solver: "statics.internal",
  title: "Where Does It Bend Most?",
  mission: "Predict the largest bending moment in a beam — and where it is.",
  instructions: "Predict the largest bending moment.",
  tallPicture: true,
  situations: [
    use(whole(shelf), "diagram", { tallPicture: true }),
    use(uniformSpan, "diagram", { tallPicture: true }),
    use(halfLoaded, "diagram", { tallPicture: true }),
    use(whole(overhangAll), "diagram", { tallPicture: true }),
    use(whole(cantileverCut), "diagram", { tallPicture: true }),
  ],
  hints: [],
  explanation:
    "M changes by the area under the V diagram, so it peaks where V passes through zero — at a point load where V jumps through zero, or under a distributed load where V's slope crosses zero. " +
    "Check the supports too: an overhang or a cantilever bends into a frown there, and that negative moment can be the biggest.",
};
