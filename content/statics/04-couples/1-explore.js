// Unit 4, stage 1 — explore: move the reference point P; the couple's moment doesn't change.
// Hand check (default numbers): F = 100 N, A and B 0.5 m apart → M = Fd = 50 N·m.
//   P = (0.25, 0.3), between the forces: M_P = 100(0.25) + 100(0.25) = 50 N·m
//   P = (−0.4, 0), left of both:        M_P = 100(0.9) − 100(0.4)  = 50 N·m

// Where the two forces act (x-coordinates of B and A).
const forceXs = (s) => [s.couples[0].at[0], s.couples[0].opposite[0]];

export default {
  id: "04-couples/1-explore",
  challenge: "explore",
  solver: "statics.couple",
  title: "Move the Point",
  instructions:
    "Two equal and opposite forces $F$ act on the bar at A and B. Together they make a **couple**. " +
    "**Drag point P** anywhere, or use the sliders, and watch $M_P$: the couple's moment about P.\n\n" +
    "The orange lines are the moment arms from P to each force's line of action. The distance between the two lines is $d$.",
  setup: {
    analysis: "couple",
    about: { at: [0.25, 0.3], label: "P", bounds: { xmin: -0.45, xmax: 1.2, ymin: -0.35, ymax: 0.45 } },
    body: { points: [[-0.05, 0], [0.85, 0]] }, // a light bar
    forceScale: 600, // arrows drawn 1 m per 600 N
    couples: [{
      id: "C", symbol: "F", magnitude: 100, direction: "up",
      at: [0.5, 0], opposite: [0, 0], pointLabels: ["B", "A"],
      dimShift: -0.5, // draw d below the bar (whichever way the couple turns), clear of P
    }],
  },
  view: { xmin: -0.6, xmax: 1.3, ymin: -0.62, ymax: 0.55 },
  editable: [
    { path: "couples.0.magnitude", label: "Size F", min: 10, max: 200, step: 10, unit: "N" },
    { path: "couples.0.at.0", label: "Distance AB", min: 0.1, max: 0.8, step: 0.05, unit: "m" },
    { label: "Couple turns", options: [
      { label: "Counterclockwise (B up)", set: { "couples.0.direction": "up" } },
      { label: "Clockwise (B down)", set: { "couples.0.direction": "down" } },
    ] },
    { path: "about.at.0", label: "P: x", min: -0.45, max: 1.2, step: 0.05, unit: "m" },
    { path: "about.at.1", label: "P: y", min: -0.35, max: 0.45, step: 0.05, unit: "m" },
  ],
  draggable: ["P"],
  sceneOpts: { arms: true },
  tasks: [
    { text: "Move P to the **left of both forces**. Did $M_P$ change?", check: (v, s) => s.about.at[0] < Math.min(...forceXs(s)) - 1e-9 },
    { text: "Put P **on the line of action** of one force, so that force has no moment about P.", check: (v) => Math.min(v["d_C.a"], v["d_C.b"]) < 1e-9 },
    { text: "Make the couple moment $M = 60$ N·m.", check: (v) => Math.abs(v.M - 60) <= 0.1 },
    { text: "Make the couple turn **clockwise**.", check: (v) => v.M < -1e-9 },
  ],
  hints: [
    "Outside the two forces, one force turns the bar one way about P and the other turns it the opposite way. Watch the two terms in $M_P$.",
    "$M = Fd$: with the forces 0.5 m apart you need $F = 60 / 0.5 = 120$ N. Or keep $F$ and change the distance.",
    "Use the **Couple turns** menu to flip both forces at once.",
  ],
  explanation:
    "As P moves, each force's own moment about P changes — but the two forces are equal and opposite, so whatever one gains, the other loses. " +
    "The total is always $M = Fd$, where $d$ is the distance between the two lines of action. " +
    "That's why a couple is described by its moment alone: you don't need to say which point it's about.",
};
