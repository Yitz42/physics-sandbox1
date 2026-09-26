// Unit 1, stage 3 — build, in two parts:
//   1. choose a second force so the resultant hits a target;
//   2. choose where to anchor a cable so it pulls with a given Cartesian force.

import { angleOptions } from "../shared/angle-options.js";

const TARGET = 400; // N, straight up

const WANT = [-120, 160]; // N: the cable force wanted in part 2, {−120 i + 160 j} N (size 200 N)

export default {
  id: "01-force-vectors/3-build",
  challenge: "build",
  solver: "statics.particle",
  title: "Hit the Target",
  parts: [
    {
      title: "Hit the target",
      instructions:
        "Force $F_1$ is fixed. You control $F_2$ only. Set $F_2$ so that the two forces together — the resultant $F_R$ — match the green **target**: " +
        `${TARGET} N straight up. The resultant stays hidden until you press **Test**, so work it out with components first!`,
      setup: {
        analysis: "resultant",
        point: { at: [0, 0], label: "O" }, // named because the direction dropdown says "From O to …"
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
        angleOptions("forces.#F2", "Angle of F₂ measured"),
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
    },
    {
      title: "Anchor the cable",
      instructions:
        "A cable will hold the ring at A. Its tension is $T = 200$ N, and it must pull on the ring with exactly " +
        `$\\mathbf{T} = \\{${WANT[0]}\\,\\mathbf{i} + ${WANT[1]}\\,\\mathbf{j}\\}$ N. ` +
        "You choose where to anchor its other end, B: move B with the sliders, then press **Test**. The numbers stay hidden until you do.",
      setup: {
        analysis: "components",
        cartesian: true,
        point: { at: [3, 0], label: "A" },
        forces: [{ id: "T", symbol: "T", magnitude: 200, kind: "cable", direction: { points: [[3, 0], [4.5, 4]], names: ["A", "B"] } }],
      },
      editable: [
        { path: "forces.0.direction.points.1.0", label: "x of B", min: -3, max: 5, step: 0.5, unit: "m" },
        { path: "forces.0.direction.points.1.1", label: "y of B", min: 0.5, max: 8, step: 0.5, unit: "m" },
      ],
      goal: {
        text: `Make the cable pull with $\\mathbf{T} = \\{${WANT[0]}\\,\\mathbf{i} + ${WANT[1]}\\,\\mathbf{j}\\}$ N (each part within 2 N).`,
        check(result) {
          const v = result.values;
          const tx = v["T.x"].toFixed(1), ty = v["T.y"].toFixed(1);
          if (Math.abs(v["T.x"] - WANT[0]) <= 2 && Math.abs(v["T.y"] - WANT[1]) <= 2) {
            return { ok: true, message: `$\\mathbf{r}_{AB} = \\{${v["T.rx"]}\\,\\mathbf{i} + ${v["T.ry"]}\\,\\mathbf{j}\\}$ m points the same way as $\\{-3\\,\\mathbf{i} + 4\\,\\mathbf{j}\\}$, so $\\mathbf{u}_{AB} = -0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$. Any B on that line from A works: the force depends only on the direction.` };
          }
          return {
            ok: false,
            message: `With B there, $\\mathbf{r}_{AB} = \\{${v["T.rx"]}\\,\\mathbf{i} + ${v["T.ry"]}\\,\\mathbf{j}\\}$ m and the cable pulls with $\\{${tx}\\,\\mathbf{i} + ${ty}\\,\\mathbf{j}\\}$ N. ` +
              "Work out the unit vector you need first: $\\mathbf{u} = \\mathbf{T}/T$. Then B must lie in that direction from A.",
          };
        },
      },
      hints: [
        "The direction you need is $\\mathbf{u} = \\mathbf{T}/T = (-120\\,\\mathbf{i} + 160\\,\\mathbf{j})/200$.",
        "That is $-0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$: 3 to the left for every 4 up.",
        "A is at (3, 0). Going 3 m left and 4 m up from A lands on (0, 4). Halfway, (1.5, 2), works too.",
      ],
      explanation:
        "Working backwards: the unit vector is the force divided by its size, $\\mathbf{u} = \\mathbf{T}/T = -0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$. " +
        "B must be in that direction from A: $\\mathbf{r}_{AB} = k(-3\\,\\mathbf{i} + 4\\,\\mathbf{j})$ for any length $k$. The cable's length doesn't change the force; only its direction does.",
    },
  ],
  explanation:
    "Forces add component by component, and a force's direction can be set by an angle or by where a cable is anchored. " +
    "Working backwards from the force you want — components, then the unit vector — tells you what to build.",
};
