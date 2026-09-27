// Unit 7.2, stage 4 — debug: a student walks along the beam building its diagrams; one step is wrong.
// Pin A (0), roller B (6), P at 2 m, a triangular load from 2 to 6 m (zero at 2, w₀ at 6).
// P = 1200, w₀ = 600: load area 1200 N at 4.667 m → B_y = 1333.3 N, A_y = 1066.7 N.
// The walk: V up 1066.7 at A; M rises by 1066.7 × 2 = 2133.3 to x = 2; V down 1200 → −133.3;
// V falls by the load's area, 1200 → −1333.3; M falls by 2133.3 back to 0; V up 1333.3 at B → 0.

export default {
  id: "shear-moment-diagrams/4-debug",
  challenge: "debug",
  solver: "statics.internal",
  title: "Walk the Beam",
  mission: "Find the wrong step in a student's walk along the beam.",
  instructions:
    "A beam on a pin at A and a roller at B carries a point load P and a triangular load. A student built its shear and moment diagrams by walking along it from A: " +
    "V jumps at each point force and falls by each load's area; M changes by the area under V. One step is wrong. Click it, then choose the fix.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [6, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 1200, direction: "down", at: [2, 0], push: true }],
    loads: [{ id: "w", shape: "triangle", from: 2, to: 6, w: 600, peak: "right" }],
    view: "diagrams",
    noPlots: true,
    knownReactions: true,
  },
  vary: [
    { path: "forces.#P.magnitude", min: 800, max: 1600, step: 100 },
    { path: "loads.#w.w", min: 400, max: 800, step: 50 },
  ],
  debug: {
    view: "steps",
    intro: "The student's walk along the beam, from A (reactions already found):",
    mutations: [
      { walk: true, step: "jump", at: 1 },
      { walk: true, step: "load", at: 1 },
      { walk: true, step: "area", at: 0 },
      { walk: true, step: "area", at: 1 },
    ],
  },
  hints: [
    "A point force makes V jump the same way it points: down for a load, up for a support pushing up.",
    "Under a distributed load V falls by the load's AREA — ½ × base × height for a triangle.",
    "M rises by the area under V where V is positive, and falls where it's negative. It must come back to 0 at B.",
  ],
  explanation:
    "Walking along a beam: V jumps by each point force (in its direction) and falls by the area of each distributed load; M changes by the area under V. " +
    "A good check at the end: V and M both come back to zero past the last support.",
};
