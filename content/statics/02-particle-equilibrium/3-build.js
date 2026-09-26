// Unit 2, stage 3 — build, in two parts:
//   1. choose cable angles so neither cable is overloaded, without bolting into
//      the skylight;
//   2. choose a spring's stiffness so it stretches exactly to its hook.
//
// Design check (hand-worked): the ceiling is 1 m above A, so an anchor is
// 1/tanθ from A sideways. Staying outside the skylight (|x| ≥ 1 m) needs θ ≤ 45°.
// At 45°/45°: T = 981/(2 sin45°) = 694 N ≤ 750 ✓. At 40°/45°: T_AC = 754 N ✗.
// So good designs keep both cables steep (about 42°–45°) and roughly balanced.

import { springSetup } from "./crate.js";

const LIMIT = 750; // N, cable rating
const SKYLIGHT = 1.0; // m, half-width of the no-anchor zone
const HEIGHT = 1.0; // m, ceiling above ring A

// Part 2: the spring must stretch from l0 to the wall at `gap`.
// Hand check: at 45°, F_AC = W = 20(9.81) = 196.2 N; s = 0.8 − 0.6 = 0.2 m;
// k = 196.2 / 0.2 = 981 N/m (980 N/m gives l = 0.8002 m ✓).
const SPRING = { mass: 20, angle: 45, l0: 0.6, gap: 0.8 };

export default {
  id: "02-particle-equilibrium/3-build",
  challenge: "build",
  solver: "statics.particle",
  title: "Design the Hanger",
  parts: [
    {
      title: "Two cables",
      instructions:
        `Hang the 100 kg crate from the ceiling with two cables. Each cable is rated for **${LIMIT} N**. ` +
        "The middle of the ceiling is a skylight (red), so no anchors there. Pick the two cable angles, then press **Test** to load it.",
      setup: {
        analysis: "equilibrium",
        point: { at: [0, 0], label: "A" },
        ceiling: { y: HEIGHT, from: -3, to: 3, forbidden: [-SKYLIGHT, SKYLIGHT], forbiddenLabel: "skylight — no anchors" },
        forces: [
          { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: 20, from: "-x", toward: "+y" }, anchor: { label: "B" } },
          { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: 25, from: "+x", toward: "+y" }, anchor: { label: "C" } },
          { id: "W", symbol: "W", kind: "weight", mass: 100 },
        ],
      },
      editable: [
        { path: "forces.#T_AB.direction.angle", label: "Angle of AB", min: 20, max: 80, step: 1, unit: "deg" },
        { path: "forces.#T_AC.direction.angle", label: "Angle of AC", min: 20, max: 80, step: 1, unit: "deg" },
      ],
      goal: {
        text: `Both tensions at most ${LIMIT} N, and both anchors outside the skylight.`,
        check(result, setup) {
          const problems = [];
          const flagged = [];
          for (const id of ["T_AB", "T_AC"]) {
            const f = setup.forces.find((x) => x.id === id);
            const name = id.replace("T_", "");
            const x = HEIGHT / Math.tan((f.direction.angle * Math.PI) / 180); // anchor's sideways distance
            if (x < SKYLIGHT - 1e-6) problems.push(`Anchor ${f.anchor.label} lands in the skylight (only ${x.toFixed(2)} m from A). Cable ${name} is too steep.`);
            if (result.values[id] > LIMIT) {
              flagged.push(id);
              problems.push(`Cable ${name} carries ${result.values[id].toFixed(0)} N — over its ${LIMIT} N rating. It snaps!`);
            }
          }
          if (problems.length) return { ok: false, flagged, message: problems.join("\n\n") };
          return { ok: true, message: `Both cables are under ${LIMIT} N and the skylight is clear.` };
        },
      },
      hints: [
        "Steeper cables share the weight with less tension. Which angles make the cables steeper?",
        "The skylight stops you going steeper than 45°: at 45° the anchor is exactly 1 m to the side.",
        "If one cable is much flatter than the other, the steeper one ends up carrying more. Try keeping them similar.",
      ],
      explanation:
        "Each tension's vertical part helps hold the crate: $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} = W$. Steep cables (big $\\sin\\theta$) need less tension. " +
        "The skylight limits how steep you can go, so the best design is as steep as allowed and balanced — engineering is choosing within constraints.",
    },
    {
      title: "Pick the spring",
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
    },
  ],
  explanation:
    "Design works backwards from the goal: equilibrium tells you the forces the parts must carry, and then you choose the parts — cable angles within a rating, or a spring stiff enough to stretch just the right amount.",
};
