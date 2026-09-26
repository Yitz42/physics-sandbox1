// Unit 2, stage 3 — build: choose cable angles so neither cable is overloaded,
// without bolting into the skylight.
//
// Design check (hand-worked): the ceiling is 1 m above A, so an anchor is
// 1/tanθ from A sideways. Staying outside the skylight (|x| ≥ 1 m) needs θ ≤ 45°.
// At 45°/45°: T = 981/(2 sin45°) = 694 N ≤ 750 ✓. At 40°/45°: T_AC = 754 N ✗.
// So good designs keep both cables steep (about 42°–45°) and roughly balanced.

const LIMIT = 750; // N, cable rating
const SKYLIGHT = 1.0; // m, half-width of the no-anchor zone
const HEIGHT = 1.0; // m, ceiling above ring A

export default {
  id: "02-particle-equilibrium/3-build",
  challenge: "build",
  solver: "statics.particle",
  title: "Stay Under the Rating",
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
};
