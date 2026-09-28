// Unit 9.3, stage 4 — debug: one wrong line in a student's working for the pull that holds a boat at a
// bollard. Correct (default 6000 N, β = 900° = 15.708 rad, μs = 0.3): e^{4.712} = 111.3 → T_hand = 53.9 N.
// Every β here has part of a turn (1.5, 2.25, 2.5 turns), so "only the whole turns" is a real slip.

import { use } from "../../../src/core/library.js";
import { boatBollard } from "../library/wedges-belts.js";

const boat = use(boatBollard, "hand");

export default {
  id: "wedges-belts/4-debug",
  challenge: "debug",
  solver: "statics.belt",
  title: "Check the Bollard",
  mission: "Find and fix the mistake in a student's belt-friction working.",
  instructions: `${boat.instructions.replace(" The rope is just about to slip. How hard must the sailor pull?", "")} A student worked out how hard the sailor must pull, with the rope about to slip. One line is wrong.`,
  setup: boat.setup,
  vary: [
    { path: "load", min: 4000, max: 8000, step: 500 },
    { path: "beta", values: [540, 810, 900] },
    { path: "mus", values: [0.25, 0.3, 0.35] },
  ],
  debug: {
    view: "steps",
    intro: "The student's working:",
    mutations: [{ slip: "degrees" }, { slip: "linear" }, { slip: "swap" }, { slip: "turns" }],
  },
  hints: [
    "In $e^{\\mu_s\\beta}$, what unit must β be in?",
    "Which way would the rope slip — so which end is tight?",
    "Does friction add up (1 + μβ) or multiply ($e^{\\mu_s\\beta}$)? And is every bit of contact counted?",
  ],
  explanation:
    "The boat's end is tight ($T_2$); the sailor's is $T_1 = T_2/e^{\\mu_s\\beta}$, with β the WHOLE angle of contact in radians. " +
    "Each slip here — degrees, the wrong tight side, adding instead of multiplying, a lost part-turn — changes the answer a lot, because it's in an exponent.",
};
