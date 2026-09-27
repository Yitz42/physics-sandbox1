// Unit 9.1, stage 1 — explore: tilt a ramp, change μ_s and push the crate; watch N, the friction
// it needs, and the most friction can give (μ_s N).
// W = 400 N, start θ = 10°, μs = 0.5, P = 0: N = 393.9 N, F = 69.5 N < μs N = 197.0 N — it holds.
// Checks: the steepest ramp that holds (1° steps) — tan θ ≤ μs < tan(θ + 1°);
//   a push that holds a crate that would slide — tan θ > μs, 0 < P, |F| ≤ μs N;
//   friction DOWN the slope — P > W sin θ (and it still holds);  no friction — |W sin θ − P| < 5 N (P in 10 N steps).

const holds = (r) => r.state === "holds" || r.state === "impending";
const tan = (a) => Math.tan((a * Math.PI) / 180);

export default {
  id: "dry-friction/1-explore",
  challenge: "explore",
  solver: "statics.friction",
  title: "Tilt the Ramp",
  mission: "Tilt a ramp and push a crate; watch the friction it needs and the most it can get.",
  instructions:
    "A 400 N crate rests on a ramp. On its free-body diagram (right), friction **F** is what equilibrium needs along the slope, and the ramp's push **N** is across it. " +
    "Friction can't be bigger than $\\mu_s N$: if the crate would need more, it slides. Tilt the ramp, change $\\mu_s$ and push the crate up the slope, and watch the numbers under the picture.",
  setup: {
    ramp: { angle: 10, length: 6, maxAngle: 45 },
    block: { w: 1.5, h: 1, at: 3.2 },
    weight: 400,
    mus: 0.5,
    forces: [{ id: "P", symbol: "P", magnitude: 0, along: "up" }],
    showFbd: "always",
  },
  editable: [
    { path: "ramp.angle", label: "Ramp angle θ", min: 0, max: 45, step: 1, unit: "deg" },
    { path: "mus", label: "μs", min: 0.1, max: 0.9, step: 0.05, unit: "" },
    { path: "forces.#P.magnitude", label: "Push P", min: 0, max: 400, step: 10, unit: "N" },
  ],
  tasks: [
    { text: "With no push, find the **steepest** ramp (whole degrees) the crate stays on.", check: (v, s, r) => s.forces[0].magnitude === 0 && holds(r) && tan(s.ramp.angle + 1) > s.mus },
    { text: "Make the ramp steep enough that the crate slides — then hold it with a push **P** (without pushing it up).", check: (v, s, r) => tan(s.ramp.angle) > s.mus && s.forces[0].magnitude > 0 && holds(r) },
    { text: "Push hard enough that friction has to act **down** the slope, while the crate still holds.", check: (v, s, r) => v.F < -1e-6 && holds(r) },
    { text: "Find a push where the crate needs **no friction** at all (within 5 N).", check: (v, s) => s.ramp.angle > 0 && Math.abs(v.Fneed) < 5 },
  ],
  hints: [
    "The crate stays while the friction it needs, $W\\sin\\theta$, is at most $\\mu_s N = \\mu_s W\\cos\\theta$ — that is, while $\\tan\\theta \\le \\mu_s$.",
    "A push up the slope takes over part of friction's job: then $F = W\\sin\\theta - P$.",
    "Push more than $W\\sin\\theta$ and friction must pull back, down the slope. Push exactly $W\\sin\\theta$ and it has nothing to do.",
  ],
  explanation:
    "Friction is a reaction, like a support's: it is whatever equilibrium needs, $F = W\\sin\\theta - P$ here, pointing either way along the surface. " +
    "Only its SIZE is limited, by $\\mu_s N$. With no push the crate slips once $\\tan\\theta > \\mu_s$ — whatever it weighs.",
};
