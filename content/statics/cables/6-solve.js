// Cables, stage 6 — solve, from FBD to answer, in a different situation each
// version (see `situations` in src/core/content.js): a hanging lamp, a traffic
// light between poles, and a balloon held down by two tethers. Each has its own
// picture and its own tempting wrong forces in the FBD palette.
//
// Hand checks (each situation's default numbers):
//   lamp:          W = 20(9.81) = 196.2 N; AB on a 3-4-5 slope, AC at 45°.
//                  ΣFx: −(4/5)T_AB + T_AC cos45° = 0;  ΣFy: (3/5)T_AB + T_AC sin45° − 196.2 = 0
//                  Adding (cos45° = sin45°): 1.4 T_AB = 196.2 → T_AB = 140.1 N, T_AC = 158.6 N.
//                  (Same numbers as the test in tests/statics/particle.test.js.)
//   traffic light: W = 20(9.81) = 196.2 N; AB on a 5-12-13 slope, AC at 20°.
//                  ΣFx: −(12/13)T_AB + T_AC cos20° = 0 → T_AC = (12/13)T_AB / cos20°
//                  ΣFy: (5/13)T_AB + T_AC sin20° = 196.2 → T_AB (5/13 + (12/13) tan20°) = 196.2
//                  → T_AB = 272.3 N, T_AC = 267.5 N.
//   balloon:       F_L = 700 N up; tether AB on a 3-4-5 slope DOWN to the left, AC 50° below level.
//                  ΣFx: −(3/5)T_AB + T_AC cos50° = 0 → T_AC = 0.6 T_AB / cos50°
//                  ΣFy: 700 − (4/5)T_AB − T_AC sin50° = 0 → T_AB (0.8 + 0.6 tan50°) = 700
//                  → T_AB = 462.0 N, T_AC = 431.3 N.

import { trafficLightSetup, balloonSetup } from "../shared/hanging.js";

export default {
  id: "cables/6-solve",
  challenge: "solve",
  solver: "statics.particle",
  title: "The Whole Problem",
  ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }], // tensions are never negative
  explanation:
    "The full method, whatever the picture: (1) isolate the point where the cables meet and draw every force on it, " +
    "(2) write $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ using components, (3) solve the two equations for the two unknowns. " +
    "A positive tension confirms the cable really is pulling.",
  situations: [
    {
      name: "lamp",
      instructions:
        "A lamp hangs from ring A. Cable AB rises on a 3-4-5 slope; cable AC is at an angle. Work through the full problem: FBD, equations, answers.",
      setup: {
        analysis: "equilibrium",
        point: { at: [0, 0], label: "A" },
        forces: [
          { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { slope: [-4, 3] }, anchor: { label: "B", length: 2.2 } },
          { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: 45, from: "+x", toward: "+y" }, anchor: { label: "C", length: 2 } },
          { id: "W", symbol: "W", kind: "weight", mass: 20, object: "lamp" },
        ],
      },
      vary: [
        { path: "forces.#T_AC.direction.angle", min: 30, max: 60, step: 1 },
        { path: "forces.#W.mass", min: 10, max: 40, step: 1 },
      ],
      solve: {
        steps: ["fbd", "equations", "answer"],
        // Forces offered in the palette. The last two don't act on A.
        candidates: [
          { id: "T_AB" },
          { id: "T_AC" },
          { id: "W", missing: "A force is missing. What does gravity do to the lamp hanging from A?" },
          { id: "N", symbol: "N", feedback: "There's no normal force: nothing is pressed against ring A. Normal forces come from surfaces in contact." },
          { id: "F_ceiling", symbol: "F_{ceiling}", feedback: "The ceiling doesn't touch A. Its effect reaches A only through the cables — that IS the tension." },
        ],
      },
      hints: [
        "Isolate ring A. What is attached to it? Two cables and the lamp.",
        "Cable AB's slope gives its components directly: $-\\tfrac{4}{5}T_{AB}$ in x, $+\\tfrac{3}{5}T_{AB}$ in y.",
        "Solve $\\Sigma F_x = 0$ for $T_{AC}$ in terms of $T_{AB}$, then substitute into $\\Sigma F_y = 0$.",
      ],
    },
    {
      name: "traffic light",
      instructions:
        "A traffic light hangs at A from two wires strung between poles. Wire AB rises on a 5-12-13 slope; wire AC is at an angle. " +
        "Work through the full problem: FBD, equations, answers.",
      setup: (() => {
        const s = trafficLightSetup({ angleAC: 20, mass: 20 });
        s.forces[0].direction = { slope: [-12, 5] }; // wire AB: 12 across for every 5 up
        return s;
      })(),
      vary: [
        { path: "forces.#T_AC.direction.angle", min: 10, max: 30, step: 1 },
        { path: "forces.#W.mass", min: 12, max: 40, step: 1 },
      ],
      solve: {
        steps: ["fbd", "equations", "answer"],
        candidates: [
          { id: "T_AB" },
          { id: "T_AC" },
          { id: "W", missing: "A force is missing. What does gravity do to the traffic light hanging from A?" },
          { id: "F_pole", symbol: "F_{pole}", feedback: "The poles don't touch A. They act on A only through the wires — and that pull IS the tension." },
          { id: "F_wind", symbol: "F_{wind}", feedback: "No wind is mentioned, so there's no wind force. Only draw forces the problem gives you (or that come from contact and gravity)." },
        ],
      },
      hints: [
        "Isolate A, where the wires and the light's cord meet: two wire tensions and the weight $W$.",
        "Wire AB's slope gives its components directly: $-\\tfrac{12}{13}T_{AB}$ in x, $+\\tfrac{5}{13}T_{AB}$ in y.",
        "Solve $\\Sigma F_x = 0$ for $T_{AC}$ in terms of $T_{AB}$, then substitute into $\\Sigma F_y = 0$.",
      ],
    },
    {
      name: "balloon",
      instructions:
        "A balloon pulls up on ring A with a net lift $F_L$ (its buoyancy minus its own weight). Tether AB runs down to the ground on a 3-4-5 slope; " +
        "tether AC is at an angle below the level. Work through the full problem: FBD, equations, answers.",
      setup: (() => {
        const s = balloonSetup({ angleAC: 50, lift: 700 });
        s.forces[0].direction = { slope: [-3, -4] }; // tether AB: 3 across for every 4 DOWN
        return s;
      })(),
      vary: [
        { path: "forces.#T_AC.direction.angle", min: 35, max: 65, step: 1 },
        { path: "forces.#F_L.magnitude", min: 300, max: 900, step: 10 },
      ],
      solve: {
        steps: ["fbd", "equations", "answer"],
        candidates: [
          { id: "T_AB" },
          { id: "T_AC" },
          { id: "F_L", missing: "A force is missing. What is keeping the tethers tight? What does the balloon do to ring A?" },
          { id: "W", symbol: "W", feedback: "The balloon's weight is already inside $F_L$: it's the NET lift (buoyancy minus weight). Adding $W$ would count it twice." },
          { id: "N", symbol: "N", feedback: "Nothing is pressed against ring A, so there's no normal force. The ground acts on A only through the tethers." },
        ],
      },
      hints: [
        "Isolate ring A: the balloon pulls up with $F_L$, and each tether pulls DOWN along itself, toward the ground.",
        "Tether AB's slope gives its components: $-\\tfrac{3}{5}T_{AB}$ in x and $-\\tfrac{4}{5}T_{AB}$ in y (down!).",
        "$\\Sigma F_y = 0$: $F_L - \\tfrac{4}{5}T_{AB} - T_{AC}\\sin\\theta = 0$. Get $T_{AC}$ from $\\Sigma F_x = 0$ first, then substitute.",
      ],
    },
  ],
};
