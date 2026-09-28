// Unit 1.1, stage 5 — concept check: Newton's laws and units.

export default {
  id: "newtons-laws/5-concept-check",
  challenge: "concept-check",
  title: "Laws and Units",
  mission: "Show you understand Newton's laws, mass and weight.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "An astronaut's mass is 80 kg on Earth. On the Moon, her mass is…",
      options: [
        { text: "80 kg — mass doesn't change", correct: true },
        { text: "about 13 kg", feedback: "Her WEIGHT drops to about a sixth ($g$ is 1.62 there). Mass — how much stuff — stays 80 kg." },
        { text: "zero — there's no gravity", feedback: "The Moon has gravity (g = 1.62 m/s²), and mass doesn't depend on gravity anyway." },
        { text: "130 N", feedback: "That's her weight on the Moon (a force). Mass is in kg." },
      ],
      explanation: "Mass is the amount of matter; weight $W = mg$ depends on where you are.",
    },
    {
      prompt: "A book rests on a table. The third-law partner of the book's WEIGHT (Earth pulling the book down) is…",
      options: [
        { text: "the book pulling the Earth up", correct: true },
        { text: "the table pushing the book up", feedback: "That force balances the weight (first law), but it's not its pair: a third-law pair acts on the TWO bodies involved — Earth and book." },
        { text: "the book pushing the table down", feedback: "That's the partner of the table's push on the book." },
        { text: "there isn't one", feedback: "Every force has a partner: equal, opposite, on the other body." },
      ],
      explanation: "A third-law pair is the same interaction seen from both sides: Earth pulls book, book pulls Earth.",
    },
    {
      prompt: "A crate slides across a floor at a steady speed, pushed by a worker. The net force on it is…",
      options: [
        { text: "zero", correct: true },
        { text: "the worker's push", feedback: "Friction pushes back. At steady speed they balance: nothing speeds up." },
        { text: "forward, or it would stop", feedback: "A net force changes the speed. Steady speed means no net force (the first law)." },
        { text: "its weight", feedback: "The floor's push balances the weight; the push balances friction." },
      ],
      explanation: "The first law: constant velocity (including rest) means ΣF = 0 — the same equations statics uses.",
    },
    {
      prompt: "1 N is the same as…",
      options: [
        { text: "1 kg·m/s²", correct: true },
        { text: "1 kg", feedback: "A kilogram is a mass. A newton is a force: the one that gives 1 kg an acceleration of 1 m/s²." },
        { text: "9.81 kg", feedback: "9.81 N is the WEIGHT of 1 kg on Earth — that doesn't make them the same unit." },
        { text: "1 kg·m/s", feedback: "That's momentum. Force is mass times ACCELERATION, m/s²." },
      ],
      explanation: "From $F = ma$: 1 N = 1 kg × 1 m/s².",
    },
    {
      prompt: "An elevator is speeding up on its way UP. The cable's pull T compared with the car's weight W is…",
      options: [
        { text: "bigger than W", correct: true },
        { text: "equal to W", feedback: "Only at rest or at steady speed. Speeding up needs a net force upward: $T - W = ma > 0$." },
        { text: "smaller than W", feedback: "That's when the acceleration points down — slowing on the way up, or speeding up on the way down." },
        { text: "zero", feedback: "Then only gravity would act: it would fall freely." },
      ],
      explanation: "$\\Sigma F_y = T - W = ma$: an upward acceleration needs $T > W$.",
    },
  ],
};
