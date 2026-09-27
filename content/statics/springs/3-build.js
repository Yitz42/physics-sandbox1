// Springs, stage 3 — build: choose a spring's stiffness so it stretches exactly to its hook.
// Hand check: at 45°, F_AC = W = 20(9.81) = 196.2 N; s = 0.8 − 0.6 = 0.2 m;
// k = 196.2 / 0.2 = 981 N/m (980 N/m gives l = 0.8002 m ✓).

import { springSetup } from "../shared/crate.js";

const SPRING = { mass: 20, angle: 45, l0: 0.6, gap: 0.8 };

export default {
  id: "springs/3-build",
  challenge: "build",
  solver: "statics.particle",
  title: "Pick the Spring",
  instructions:
    `A ${SPRING.mass} kg crate hangs from ring A, held by cable AB at ${SPRING.angle}° and a spring AC hooked to the wall at C. ` +
    `The spring is ${SPRING.l0} m long before it is stretched, and C is ${SPRING.gap} m from A, so it must stretch to exactly that length. ` +
    "Choose the spring's stiffness $k$, then press **Test** to hang the crate.",
  setup: springSetup({ angleAB: SPRING.angle, k: 500, unstretched: SPRING.l0, mass: SPRING.mass, springLength: SPRING.gap }),
  editable: [
    { path: "forces.#F_AC.k", label: "Stiffness k", min: 200, max: 3000, step: 10, unit: "N/m" },
  ],
  goal: {
    text: `The stretched spring must be ${SPRING.gap} m long, to reach C (within 5 mm).`,
    check(result, setup) {
      const v = result.values;
      const k = setup.forces.find((f) => f.id === "F_AC").k;
      const l = v["F_AC.l"];
      const says = `With $k = ${k}$ N/m the spring force $F_{AC} = ${v.F_AC.toFixed(1)}$ N stretches it $s = F/k = ${v["F_AC.s"].toFixed(3)}$ m, so it is $${l.toFixed(3)}$ m long.`;
      if (Math.abs(l - SPRING.gap) <= 0.005) return { ok: true, message: `${says} It reaches C.` };
      return {
        ok: false,
        message: `${says} ${l > SPRING.gap ? "Too long: the spring is too soft (k too small)." : "Too short: the spring is too stiff (k too big)."} ` +
          `First find $F_{AC}$ from equilibrium; then the stretch you need is $s = ${SPRING.gap} - ${SPRING.l0}$ m, and $k = F_{AC}/s$.`,
      };
    },
  },
  hints: [
    "The spring's force doesn't depend on $k$: equilibrium sets it. Find $F_{AC}$ first, from $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$.",
    `At ${SPRING.angle}°, the cable's horizontal and vertical parts are equal, so $F_{AC} = W = mg$.`,
    `The stretch needed is $s = ${SPRING.gap} - ${SPRING.l0} = ${(SPRING.gap - SPRING.l0).toFixed(1)}$ m. Then $k = F_{AC}/s$.`,
  ],
  explanation:
    "Design runs the spring law backwards: equilibrium gives the force the spring must supply, the geometry gives the stretch it must have, and $k = F/s$. " +
    `Here $F_{AC} = W = ${SPRING.mass}(9.81) = ${(SPRING.mass * 9.81).toFixed(1)}$ N and $s = ${(SPRING.gap - SPRING.l0).toFixed(1)}$ m, so $k \\approx ${(SPRING.mass * 9.81 / (SPRING.gap - SPRING.l0)).toFixed(0)}$ N/m.`,
};
