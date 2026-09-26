// registry.js — where subjects plug in their solvers.
//
// The core never imports statics (or any subject) directly. Instead each
// subject calls registerSolver("statics.particle", solver) when it loads,
// and stages ask for a solver by that name. Adding dynamics later means
// registering new names, not editing the core.
//
// A solver is an object. Only `solve` is required; challenges use the other
// methods when a stage needs them:
//
//   solve(setup)               → result { status, message, values: {name: number}, ... }
//                                status: "determinate" | "indeterminate" | "unstable" | "resultant"
//   equations(setup, result)   → list of equations (see equations.js)
//   summary(setup, result, { mode, reveal }) → extra KaTeX lines under the equations
//   scene(setup, result, opts) → list of drawing shapes for render/diagrams.js
//                                opts: { reveal, hide: [ids], flagged: [ids], fbdSetup,
//                                        guesses: { quantity: number } → "shadow" of a wrong answer }
//   quantities(setup)          → { name: { label, unit } } describing result.values
//   handles(setup)             → draggable points [{ id, at: [x, y] }]
//   drag(setup, id, point)     → changes setup when handle `id` is dragged to point
//   mistakes(setup, name)      → [{ value, message }] — answers a student gets from
//                                common errors (sin/cos swap, wrong sign …)
//   fbd(setup)                 → { forces, directions } for the draw-the-FBD step
//   mutate(setup, mutation)    → a deliberately wrong setup for debug challenges

const solvers = new Map();

export function registerSolver(name, solver) {
  if (typeof solver.solve !== "function") throw new Error(`Solver ${name} needs a solve() method`);
  solvers.set(name, solver);
}

export function getSolver(name) {
  const s = solvers.get(name);
  if (!s) throw new Error(`No solver registered as "${name}". Is its subject loaded?`);
  return s;
}
