// Unit 1.2, stage 4 — debug: a student's FBD of a plank (with a person on it) has one mistake.
// Correct FBD: A_x, A_y (pin), B_y (roller, up), W (at the middle), P.
// Hand check (default 30 kg, 700 N at 3.5 m): A_y = 357.15 N, B_y = 637.15 N (library/method.js).

import { plank } from "../library/method.js";

export default {
  id: "solving-problems/4-debug",
  challenge: "debug",
  solver: "statics.rigidBody",
  title: "Check the FBD",
  mission: "Find the mistake in a student's free-body diagram of a plank.",
  instructions: "A student drew the plank's free-body diagram and wrote the equations from it. The faded symbols show the real supports. One thing on their FBD is wrong.",
  setup: plank.setup,
  view: plank.view,
  vary: plank.vary,
  debug: {
    view: "fbd",
    intro: "The student's equations (from their FBD):",
    mutations: [
      { kind: "remove", force: "W" },
      { kind: "reverse", force: "B_y", explain: "$B_y$ points the wrong way: a roller can only PUSH on the plank, up." },
      { kind: "extra", force: "B_x", extra: { support: "B", direction: "right" }, explain: "$B_x$ doesn't belong: a roller can't push sideways — it rolls. It gives only $B_y$." },
      { kind: "remove", force: "A_x" },
      { kind: "extra", force: "M_A", extra: { support: "A", moment: true }, explain: "$M_A$ doesn't belong: a pin lets the plank turn, so it gives no moment." },
    ],
    missingChoices: [
      { id: "W", label: "The plank's weight W" },
      { id: "A_x", label: "A sideways reaction A_x at the pin" },
      { id: "B_x", label: "A sideways reaction at the roller", feedback: "A roller can't push sideways — it just rolls." },
      { id: "N", label: "A normal force from the person", feedback: "The person's push on the plank IS P — it's already on the FBD." },
    ],
    notes: {
      A_x: "$A_x$ is right: a pin stops sliding either way (either direction is fine on an FBD).",
      A_y: "$A_y$ is right: the pin stops the plank moving up or down.",
      B_y: "$B_y$ is right: the roller pushes up on the plank.",
      W: "$W$ is right: the plank's weight acts down at its middle.",
      P: "$P$ is right: the person pushes down where they stand.",
    },
  },
  hints: [
    "Go support by support: what can a pin give? A roller?",
    "Does the plank have mass?",
    "Can a roller pull, or push sideways?",
  ],
  explanation:
    "Step 2 decides everything after it: every force on the plank, and only those. The pin gives $A_x$ and $A_y$; the roller pushes up, $B_y$; " +
    "the weight acts at the middle; the person pushes down. Miss one, or add one, and every equation after it is wrong.",
};
