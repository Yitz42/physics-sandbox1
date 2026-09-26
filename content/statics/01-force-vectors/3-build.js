// Unit 1, stage 3 — build: choose a second force so the resultant hits a target.

import { angleOptions } from "../shared/angle-options.js";

const TARGET = 400; // N, straight up

export default {
  id: "01-force-vectors/3-build",
  challenge: "build",
  solver: "statics.particle",
  title: "Hit the Target",
  instructions:
    "Force $F_1$ is fixed. You control $F_2$ only. Set $F_2$ so that the two forces together — the resultant $F_R$ — match the green **target**: " +
    `${TARGET} N straight up. The resultant stays hidden until you press **Play**, so work it out with components first!`,
  setup: {
    analysis: "resultant",
    point: { at: [0, 0], label: "O" },
    forceScale: 150,
    dragStep: 10,
    dragMax: 500,
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 250, direction: { angle: 20, from: "+x", toward: "+y" } },
      { id: "F2", symbol: "F_2", magnitude: 150, direction: { angle: 45, from: "+x", toward: "+y" } },
    ],
    target: { magnitude: TARGET, direction: "up" },
  },
  view: { xmin: -3.6, xmax: 3.6, ymin: -1.6, ymax: 3.6 },
  editable: [
    { path: "forces.#F2.magnitude", label: "Size F₂", min: 10, max: 500, step: 10, unit: "N" },
    { path: "forces.#F2.direction.angle", label: "Angle of F₂", min: 0, max: 90, step: 1, unit: "deg" },
    angleOptions("forces.#F2", "angle of F₂ measured"),
  ],
  draggable: ["F2"],
  sceneOpts: { resultant: true },
  goal: {
    text: `Make the resultant $F_R = ${TARGET}$ N pointing straight up (within 2% in size and 1.5° in direction).`,
    check(result) {
      const v = result.values;
      const angleFromVertical = (Math.atan2(Math.abs(v["R.x"]), v["R.y"]) * 180) / Math.PI;
      const sizeOk = Math.abs(v.R - TARGET) <= 0.02 * TARGET;
      const dirOk = v["R.y"] > 0 && angleFromVertical <= 1.5;
      if (sizeOk && dirOk) return { ok: true, message: "$F_1 + F_2$ adds up to the target. Notice $F_{2x}$ exactly cancels $F_{1x}$." };
      const rx = v["R.x"].toFixed(0), ry = v["R.y"].toFixed(0);
      return {
        ok: false,
        message: `Your resultant has $F_{Rx} = ${rx}$ N and $F_{Ry} = ${ry}$ N. The target needs $F_{Rx} = 0$ and $F_{Ry} = ${TARGET}$ N. ` +
          "So $F_2$'s x-component must cancel $F_1$'s, and $F_2$'s y-component must make up the rest.",
      };
    },
  },
  hints: [
    "Work backwards: $F_2 = F_R - F_1$, one component at a time.",
    "$F_{2x} = 0 - 250\\cos 20^\\circ$ and $F_{2y} = 400 - 250\\sin 20^\\circ$.",
    "Then $F_2 = \\sqrt{F_{2x}^2 + F_{2y}^2}$ and its angle from the x-axis is $\\tan^{-1}|F_{2y}/F_{2x}|$.",
  ],
  explanation:
    "Forces add component by component: $F_{Rx} = F_{1x} + F_{2x}$ and $F_{Ry} = F_{1y} + F_{2y}$. " +
    "To hit a target, subtract what $F_1$ already provides: $F_{2x} = -234.9$ N and $F_{2y} = 314.5$ N, so $F_2 \\approx 393$ N at about 53° above the −x axis.",
};
