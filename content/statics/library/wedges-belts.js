// library/wedges-belts.js — the lesson library's belt-friction and wedge situations (Unit 9.3;
// see src/subjects/statics/belt.js and wedge.js).
// Belt: T₂ = T₁ e^{μs β}, β in radians; T₂ the tight side (the way the rope would slip).
// Wedge: a block against a wall on a wedge's slope (α); friction μN at every contact.
// Questions:
//   hand     the hand pull that holds (or hoists) a load
//   load     the biggest load a hand pull can hold
//   turns    how many turns of rope are needed
//   push     the push that drives a wedge in (and the forces on the block)
//   out      the pull that gets a wedge back out (is it self-locking?)
// Hand checks (default numbers):
//   boat at a bollard: 6000 N, β = 900° = 15.708 rad, μs = 0.3: e^{4.712} = 111.32 → hand 53.9 N.
//   crate hoisted over a pipe: 500 N, β = 180° = π, μs = 0.25, the HAND is tight:
//            hand = 500 e^{0.7854} = 500(2.1933) = 1096.6 N.
//   turns needed: 2000 N held with 100 N, μs = 0.35: β = ln 20 / 0.35 = 8.559 rad = 1.362 turns.
//   load held: 200 N hand, 1.5 turns (540° = 9.425 rad), μs = 0.3: 200 e^{2.827} = 3380.3 N.
//   machine on a wedge: W = 4000 N, α = 10°, μs = 0.3 everywhere, driven in:
//            N₁ = 4000 / (cos 10° − 0.3 sin 10° − 0.3(sin 10° + 0.3 cos 10°)) = 4000/0.79199 = 5050.6 N,
//            N₂ = 0.46909 N₁ = 2369.2 N, N₃ = 0.93272 N₁ = 4710.8 N, P = N₂ + 0.3 N₃ = 3782.5 N.
//   a steeper wedge pulled out: W = 4000 N, α = 18°, μs = 0.3, every friction reversed (block sliding
//            DOWN): N₁ = 4000 / (cos 18° + 0.3 sin 18° + 0.3(sin 18° − 0.3 cos 18°)) = 4000/1.05088 = 3806.3 N,
//            N₃ = 1.04377 N₁ = 3972.9 N, P = 0.02370 N₁ − 0.3 N₃ = −1101.7 N: it must be PULLED out
//            with 1101.7 N — self-locking. (Flatter than tan α = μs, the block would ride out with it.)
//   door wedge on rollers (no wall friction): W = 3000 N, α = 12°, μs = 0.25 on the wedge's faces:
//            N₁ = 3000 / (cos 12° − 0.25 sin 12°) = 3239.2 N, N₃ = 3000 N, P = 0.45245 N₁ + 0.25(3000) = 2215.6 N.

import { scenario } from "../../../src/core/library.js";

const post = { r: 0.3 };

export const boatBollard = scenario({
  name: "boat at a bollard",
  story: "A sailor holds a boat against the wind with a rope wrapped round a bollard on the dock. The boat pulls on its end of the rope; the sailor holds the other end.",
  setup: { drum: post, beta: 900, mus: 0.3, load: 6000, hand: 50, tight: "load", find: "hand" },
  vary: [
    { path: "load", min: 4000, max: 8000, step: 500 },
    { path: "beta", values: [450, 540, 810, 900] },
    { path: "mus", values: [0.25, 0.3, 0.35] },
  ],
  questions: {
    hand: {
      instruction: "The rope is just about to slip. How hard must the sailor pull?",
      ask: [{ quantity: "hand" }],
      hints: [
        "The rope would slip toward the boat, so the boat's end is the tight side, $T_2$; the sailor's is $T_1$.",
        "$T_2 = T_1 e^{\\mu_s\\beta}$, with β in RADIANS: one turn is $2\\pi$ rad.",
        "So $T_1 = T_2 / e^{\\mu_s\\beta}$.",
      ],
    },
  },
});

export const pipeHoist = scenario({
  name: "crate hoisted over a pipe",
  story: "A worker hoists a crate by pulling a rope that runs over a fixed, rough pipe. The pipe can't turn.",
  setup: { drum: { r: 0.25 }, beta: 180, mus: 0.25, load: 500, hand: 500, tight: "hand", find: "hand" },
  vary: [
    { path: "load", min: 300, max: 800, step: 50 },
    { path: "beta", values: [120, 150, 180] },
    { path: "mus", values: [0.2, 0.25, 0.3] },
  ],
  questions: {
    hand: {
      instruction: "How hard must the worker pull to just start the crate moving UP?",
      ask: [{ quantity: "hand" }],
      hints: [
        "The rope is about to slip toward the WORKER: now the worker's end is the tight side, $T_2$.",
        "$T_2 = T_1 e^{\\mu_s\\beta}$ with the crate's weight as $T_1$ and β in radians.",
        "Friction on the pipe now works against the worker: the pull is MORE than the crate's weight.",
      ],
    },
  },
});

export const turnsNeeded = scenario({
  name: "turns needed on a post",
  story: "A load hangs from a rope wrapped round a rough post. A person can hold the other end with only a modest pull.",
  setup: { drum: post, beta: 180, mus: 0.35, load: 2000, hand: 100, tight: "load", find: "beta" },
  vary: [
    { path: "load", min: 1500, max: 3000, step: 250 },
    { path: "hand", values: [80, 100, 120] },
    { path: "mus", values: [0.3, 0.35, 0.4] },
  ],
  questions: {
    turns: {
      instruction: "How many turns of rope round the post are needed, at least, to hold the load?",
      ask: [{ quantity: "turns", precision: 0.01 }],
      hints: [
        "The load's end is the tight side: $T_2$ = the load, $T_1$ = the hand.",
        "$\\beta = \\dfrac{\\ln(T_2/T_1)}{\\mu_s}$ — in radians (natural log, ln).",
        "One turn is $2\\pi$ rad: turns $= \\beta / 2\\pi$.",
      ],
    },
  },
});

export const mooringHold = scenario({
  name: "mooring line held by hand",
  story: "A deckhand holds a mooring line wrapped round a capstan (a rough drum that isn't turning).",
  setup: { drum: post, beta: 540, mus: 0.3, load: 3000, hand: 200, tight: "load", find: "load" },
  vary: [
    { path: "hand", values: [150, 200, 250] },
    { path: "beta", values: [450, 540, 900] },
    { path: "mus", values: [0.25, 0.3] },
  ],
  questions: {
    load: {
      instruction: "What is the biggest pull on the ship's end that the deckhand can hold?",
      ask: [{ quantity: "load" }],
      hints: [
        "The ship's end is the tight side $T_2$; the deckhand's pull is $T_1$.",
        "$T_2 = T_1 e^{\\mu_s\\beta}$, β in radians.",
        "Count the whole angle of contact — every turn and the part of a turn.",
      ],
    },
  },
});

// ---- Wedges ---------------------------------------------------------------------------

const machineSetup = { wedge: { angle: 10, length: 1.6, tip: -0.3 }, block: { w: 1, h: 0.7, label: "" }, weight: 4000, mus: 0.3, motion: "in", showFbd: "reveal" };
const WEDGE_HINTS = [
  "Take the two bodies apart. On each contact: a normal force N (a push, square to the surface) and friction $\\mu_s N$ along it, AGAINST that surface's sliding.",
  "Driving the wedge in, the block rises: friction on the block points DOWN its contacts; on the wedge it points the other way (and to the right, under it).",
  "The block's two equations give $N_1$ and $N_2$; then the wedge's ΣF_y gives $N_3$ and its ΣF_x gives P.",
];

export const machineWedge = scenario({
  name: "machine levelled with a wedge",
  story: "A machine rests on a wedge, its side against a wall. Driving the wedge in lifts the machine to level it. Every surface is rough (the wedge's weight is small).",
  setup: machineSetup,
  vary: [
    { path: "weight", min: 2000, max: 6000, step: 500 },
    { path: "wedge.angle", values: [8, 10, 12, 15] },
    { path: "mus", values: [0.2, 0.25, 0.3] },
  ],
  questions: {
    push: {
      instruction: "Find the forces on the machine from the wedge ($N_1$) and the wall ($N_2$), and the push P that just starts the wedge moving in.",
      ask: [{ quantity: "N1" }, { quantity: "N2" }, { quantity: "P" }],
      hints: WEDGE_HINTS,
    },
  },
});

export const wedgeOut = scenario({
  name: "wedge pulled back out",
  story: "A machine rests on a wedge, its side against a wall. Now the wedge is to be pulled back OUT, lowering the machine. Every surface is rough.",
  setup: { ...machineSetup, wedge: { ...machineSetup.wedge, angle: 18 }, motion: "out" },
  // (Steeper than tan α = μs, so the block slides down the face as the wedge comes out.)
  vary: [
    { path: "weight", min: 2000, max: 6000, step: 500 },
    { path: "wedge.angle", values: [17, 18, 20] },
    { path: "mus", values: [0.25, 0.3] },
  ],
  questions: {
    out: {
      instruction: "What pull $P_{\\text{out}}$ (to the right) just starts the wedge moving out? (If the answer is positive, the wedge is self-locking: it stays put with no push.)",
      ask: [{ quantity: "Pout" }],
      hints: [
        "Pulling it out, everything slides the other way: the block comes DOWN. Every friction force reverses.",
        "Write the same four equations with the friction terms' signs flipped, and solve for the force on the wedge.",
        "A positive pull means friction holds the wedge in: it is self-locking.",
      ],
    },
  },
});

export const rollerWall = scenario({
  name: "wedge with a roller guide",
  story: "A heavy door is lifted by a wedge. Its side runs against a guide on rollers (no friction there); the wedge's two faces are rough.",
  setup: { wedge: { angle: 12, length: 1.6, tip: -0.3 }, block: { w: 1, h: 0.7, label: "" }, weight: 3000, mu: { wedge: 0.25, wall: 0, floor: 0.25 }, motion: "in", showFbd: "reveal" },
  vary: [
    { path: "weight", min: 2000, max: 5000, step: 500 },
    { path: "wedge.angle", values: [10, 12, 14] },
  ],
  questions: {
    push: {
      instruction: "Find the forces on the door from the wedge ($N_1$) and the guide ($N_2$), and the push P that just starts the wedge moving in.",
      ask: [{ quantity: "N1" }, { quantity: "N2" }, { quantity: "P" }],
      hints: WEDGE_HINTS,
    },
  },
});
