// index.js — plugs the automatic controls subject into the core.
//
// Loading this file registers every controls solver by name, the same way
// statics does (src/subjects/statics/index.js). Stage files then say, for
// example, solver: "controls.firstOrder", and the core looks it up.
//
// No units are built yet, so nothing is registered. Planned solvers, added as
// their units are built (see docs/CURRICULUM.md, "Automatic controls"):
//   controls.blockDiagram   block diagram reduction (series, parallel, feedback loops)
//   controls.firstOrder     first-order step response: time constant τ, final value
//   controls.secondOrder    ζ and ω_n; overshoot, peak, rise and settling times
//   controls.stability      pole locations and the Routh–Hurwitz table
//   controls.steadyState    final value theorem, system type, error constants
//   controls.rootLocus      the root locus, and choosing a gain on it
//   controls.frequency      Bode plots, gain and phase margins, Nyquist
//   controls.pid            P, PI, PD and PID controllers; lead and lag compensators
//   controls.stateSpace     state-space models and state feedback
// Their pictures will need plots (step responses, pole-zero maps, Bode plots),
// which will be added to src/render/ as general drawing tools, not controls code.

export {};
