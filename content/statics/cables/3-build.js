// Cables, stage 3 — build: choose cable angles so neither cable is overloaded,
// without bolting into the skylight — and prove each design on paper before
// it's load-tested (goal.predict), so it can't be passed by guessing.
//
// The skylight is off-centre: it reaches 1.0 m to one side of A and 1.4 m to
// the other, so the two cables CAN'T simply mirror each other. The ceiling is
// 1 m above A, so an anchor lands 1/tanθ from A sideways:
//   short side: 1/tanθ ≥ 1.0 → θ ≤ 45°;   long side: 1/tanθ ≥ 1.4 → θ ≤ 35.5°.
// Tensions (from ΣFx = 0 and ΣFy = 0), with θ_s the short side and θ_l the long side:
//   T_short = W cosθ_l / sin(θ_s + θ_l),   T_long = W cosθ_s / sin(θ_s + θ_l).
// Hand check, 90 kg (W = 882.9 N), skylight from −1.0 to +1.4 m (AB is the short side):
//   AB 45°, AC 35°: sin 80° = 0.98481 → T_AB = 882.9(0.81915)/0.98481 = 734.4 N,
//                   T_AC = 882.9(0.70711)/0.98481 = 633.9 N          → both ≤ 750 ✓
//   AB 39°, AC 35°: sin 74° = 0.96126 → T_AB = 882.9(0.81915)/0.96126 = 752.4 N ✗ (AB snaps)
//   AB 45°, AC 36°: anchor C only 1/tan36° = 1.376 m from A → in the skylight ✗
// Designs that work (whole degrees): AB 40–45° with AC 35°, or AB 44–45° with AC 34°.
// The flatter cable (forced by the wider side of the skylight) makes the STEEP
// cable carry more — the surprise this stage is built around.
// Versions: the skylight's wide side reaches 1.2, 1.3 or 1.4 m, on either side,
// and the crate is 80–90 kg: 66 versions. Every one has designs that work —
// from 8 (1.4 m, 90 kg) to 169 (1.2 m, 80 kg), out of 3721 angle pairs.
//
// A second situation (see `situations` in src/core/content.js) turns the same
// design problem upside down: a balloon with net lift F_L is held DOWN by two
// tethers, and their ground anchors must miss a pond 1 m below A. The maths is
// the crate's mirrored (F_L in place of W, angles below the level), so the same
// designs work: lift 790–880 N matches crates of 80.5–89.7 kg — 60 versions.
// Hand check: F_L = 880 N, pond −1.0 to +1.4 m, AB 45°, AC 35° below level:
//   T_AB = 880 cos35°/sin80° = 732.0 N, T_AC = 880 cos45°/sin80° = 631.8 N → both ≤ 750 ✓

const LIMIT = 750; // N, cable rating
const HEIGHT = 1.0; // m, ceiling above ring A (or ground below it)
// No-anchor zone (skylight or pond): 1.0 m to one side of A, 1.2–1.4 m to the other.
const SIDES = [1.2, 1.3, 1.4].flatMap((w) => [[-1.0, w], [-w, 1.0]]);

export default {
  id: "cables/3-build",
  challenge: "build",
  solver: "statics.particle",
  title: "Stay Under the Rating",
  situations: [
    {
      name: "skylight",
      instructions:
        `Hang the crate from the ceiling with two cables. Each cable is rated for **${LIMIT} N**. ` +
        "Part of the ceiling is a skylight (red), so no anchors there — and it's wider on one side than the other. " +
        "Pick the two cable angles, **work out both tensions for your design**, then press **Test** to load it. " +
        "Like a real engineer, you only get to load-test a design you've checked on paper.",
      setup: {
        analysis: "equilibrium",
        point: { at: [0, 0], label: "A" },
        ceiling: { y: HEIGHT, from: -3, to: 3, forbidden: [-1.0, 1.4], forbiddenLabel: "skylight — no anchors" },
        forces: [
          { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: 20, from: "-x", toward: "+y" }, anchor: { label: "B" } },
          { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: 25, from: "+x", toward: "+y" }, anchor: { label: "C" } },
          { id: "W", symbol: "W", kind: "weight", mass: 90 },
        ],
      },
      vary: [
        // The skylight's wide side: 1.2, 1.3 or 1.4 m, to the right or to the left.
        { path: "ceiling.forbidden", values: SIDES },
        { path: "forces.#W.mass", min: 80, max: 90, step: 1 },
      ],
      hints: [
        "How steep can each cable be? The ceiling is 1 m up, so an anchor lands $1/\\tan\\theta$ from A. It must clear the skylight on its side.",
        "The tensions: $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ at A give two equations in $T_{AB}$ and $T_{AC}$. Switch the equations to **Numbers** to see them for your angles.",
        "On the wide side of the skylight the cable has to be flatter, and that makes the OTHER cable carry more. Keep that steep one as steep as its side allows.",
      ],
    },
    {
      name: "balloon",
      instructions:
        `A balloon pulls up with a net lift $F_L$, and two tethers hold it down. Each tether is rated for **${LIMIT} N**. ` +
        "There's a pond (red) under the balloon, so the tethers can't be anchored there — and it's wider on one side than the other. " +
        "Pick the two tether angles, **work out both tensions for your design**, then press **Test** to let the balloon pull. " +
        "Like a real engineer, you only get to load-test a design you've checked on paper.",
      setup: {
        analysis: "equilibrium",
        point: { at: [0, 0], label: "A" },
        ground: { y: -HEIGHT, from: -3, to: 3, forbidden: [-1.0, 1.4], forbiddenLabel: "pond — no anchors" },
        forces: [
          { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: 20, from: "-x", toward: "-y" }, anchor: { label: "B" } },
          { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: 25, from: "+x", toward: "-y" }, anchor: { label: "C" } },
          { id: "F_L", symbol: "F_L", magnitude: 880, direction: "up", object: "balloon" },
        ],
      },
      vary: [
        { path: "ground.forbidden", values: SIDES },
        { path: "forces.#F_L.magnitude", min: 790, max: 880, step: 10 },
      ],
      hints: [
        "How steep can each tether be? The ground is 1 m below A, so an anchor lands $1/\\tan\\theta$ from A. It must clear the pond on its side.",
        "At A: $F_L$ up, both tethers pulling down along themselves. $\\Sigma F_y = 0$: $F_L - T_{AB}\\sin\\theta_{AB} - T_{AC}\\sin\\theta_{AC} = 0$.",
        "On the wide side of the pond the tether has to be flatter, and that makes the OTHER tether pull harder. Keep that steep one as steep as its side allows.",
      ],
    },
  ],
  editable: [
    { path: "forces.#T_AB.direction.angle", label: "Angle of AB", min: 20, max: 80, step: 1, unit: "deg" },
    { path: "forces.#T_AC.direction.angle", label: "Angle of AC", min: 20, max: 80, step: 1, unit: "deg" },
  ],
  goal: {
    text: `Both tensions at most ${LIMIT} N, and both anchors outside the red zone.`,
    // Before each Test: the tensions for the student's own design.
    predict: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }],
    check(result, setup) {
      const problems = [];
      const flagged = [];
      const surface = setup.ceiling || setup.ground; // the crate's ceiling, or the balloon's ground
      const [left, right] = surface.forbidden;
      const zone = setup.ceiling ? "skylight" : "pond";
      const line = setup.ceiling ? "Cable" : "Tether";
      for (const id of ["T_AB", "T_AC"]) {
        const f = setup.forces.find((x) => x.id === id);
        const name = id.replace("T_", "");
        const x = HEIGHT / Math.tan((f.direction.angle * Math.PI) / 180); // anchor's sideways distance from A
        const clear = f.direction.from === "-x" ? -left : right; // how far the zone reaches on this side
        if (x < clear - 1e-6) problems.push(`Anchor ${f.anchor.label} lands in the ${zone} (only ${x.toFixed(2)} m from A; the ${zone} reaches ${clear} m on that side). ${line} ${name} is too steep.`);
        if (result.values[id] > LIMIT) {
          flagged.push(id);
          problems.push(`${line} ${name} carries ${result.values[id].toFixed(1)} N — over its ${LIMIT} N rating. It snaps!`);
        }
      }
      if (problems.length) return { ok: false, flagged, message: problems.join("\n\n") };
      return { ok: true, message: `Both ${line.toLowerCase()}s are under ${LIMIT} N and the ${zone} is clear.` };
    },
  },
  explanation:
    "Each tension's vertical part helps carry the load (the crate's weight $W$, or the balloon's lift $F_L$): $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} = W$ (or $F_L$), " +
    "and their horizontal parts cancel: $T_{AB}\\cos\\theta_{AB} = T_{AC}\\cos\\theta_{AC}$. " +
    "The flatter one has the bigger $\\cos\\theta$, so the steeper one must pull harder to match it sideways. " +
    "The wide side of the red zone forces one flat, so the other becomes the one near its rating — engineering is choosing within constraints, and checking the numbers before you load it.",
};
