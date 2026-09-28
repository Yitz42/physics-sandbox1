// Unit 1.1, stage 4 — debug: one wrong line in a student's working for a crate hanging at rest.
// Correct (default 45 kg): W = 45(9.81) = 441.45 N = 0.4415 kN; T = W = 441.45 N; the crate pulls the cable down.

export default {
  id: "newtons-laws/4-debug",
  challenge: "debug",
  solver: "statics.newton",
  title: "Check the Crate",
  mission: "Find and fix the mistake in a student's weight-and-tension working.",
  instructions: "A crate hangs at rest from a cable. A student worked out its weight, the cable's pull, and the third-law pair. One line is wrong.",
  setup: { mass: 45, look: "hanging", forces: [{ id: "T", symbol: "T", magnitude: null, direction: "up" }], showW: true },
  vary: [{ path: "mass", min: 10, max: 120, step: 1 }],
  debug: {
    view: "steps",
    intro: "The student's working:",
    mutations: [{ slip: "noG" }, { slip: "divideG" }, { slip: "kN" }, { slip: "thirdLaw" }],
  },
  hints: [
    "Is the weight a force in newtons? What turns kg into N?",
    "Kilonewtons: is a number of newtons bigger or smaller in kN?",
    "The cable pulls the crate up. Which way does the crate pull the cable?",
  ],
  explanation: "$W = mg$ in newtons; kN = N/1000; at rest $T = W$ (first law); and the crate pulls the cable down just as hard (third law).",
};
