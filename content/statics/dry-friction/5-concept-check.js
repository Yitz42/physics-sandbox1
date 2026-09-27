// Unit 9.1, stage 5 — concept check: what friction is, and what it isn't.

export default {
  id: "dry-friction/5-concept-check",
  challenge: "concept-check",
  title: "Friction Facts",
  mission: "Show you understand how dry friction works.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A crate rests on a ramp and doesn't move. The friction force on it is…",
      options: [
        { text: "whatever keeps it in equilibrium, up to $\\mu_s N$", correct: true },
        { text: "always $\\mu_s N$", feedback: "$\\mu_s N$ is the LIMIT, reached only when the crate is about to slip. On a gentle slope it needs much less." },
        { text: "$\\mu_k N$", feedback: "Kinetic friction is for a body that's sliding. This crate isn't moving." },
        { text: "zero, because nothing moves", feedback: "Without friction the crate would slide down. Friction is what's holding it." },
      ],
      explanation: "Static friction is a reaction: it's as big as equilibrium needs, and can't exceed $\\mu_s N$.",
    },
    {
      prompt: "A crate sits on a ramp at angle θ. The normal force on it is…",
      options: [
        { text: "$W\\cos\\theta$", correct: true },
        { text: "$W$", feedback: "Only on level ground. On a ramp, part of the weight pulls along the slope, and only the part across it presses into the ramp." },
        { text: "$W\\sin\\theta$", feedback: "That's the part of W ALONG the slope (θ is between the slope and the level)." },
        { text: "$\\mu_s W$", feedback: "That mixes up N with friction's limit. N comes from equilibrium across the slope." },
      ],
      explanation: "Across the slope, $N - W\\cos\\theta = 0$.",
    },
    {
      prompt: "It's easier to start a sled moving by pulling a rope angled UP than by pushing down at the same angle, because…",
      options: [
        { text: "pulling up lowers N, and so the friction limit $\\mu_s N$", correct: true },
        { text: "pulling up lowers $\\mu_s$", feedback: "$\\mu_s$ depends on the two surfaces, not on how you pull." },
        { text: "friction doesn't depend on N", feedback: "It does: the limit is $\\mu_s N$. Pressing the surfaces together harder lets them grip harder." },
        { text: "pulling up reduces the sled's weight", feedback: "The weight stays the same; what changes is how hard the sled presses on the snow, N." },
      ],
      explanation: "An upward pull carries part of the weight, so $N = W - P\\sin\\alpha$ — less grip to overcome. A downward push adds to N.",
    },
    {
      prompt: "A crate on a ramp just starts to slide when the ramp reaches angle θ. Then $\\mu_s$ is…",
      options: [
        { text: "$\\tan\\theta$", correct: true },
        { text: "$\\sin\\theta$", feedback: "At the slip angle $W\\sin\\theta = \\mu_s W\\cos\\theta$: divide by $W\\cos\\theta$." },
        { text: "$1/\\tan\\theta$", feedback: "Upside down: $\\mu_s = F/N = W\\sin\\theta / W\\cos\\theta$." },
        { text: "it depends on the crate's weight", feedback: "W appears on both sides of $W\\sin\\theta = \\mu_s W\\cos\\theta$ and cancels." },
      ],
      explanation: "At impending slip $F = \\mu_s N$: $W\\sin\\theta = \\mu_s W\\cos\\theta$, so $\\mu_s = \\tan\\theta$ — a simple way to measure it.",
    },
    {
      prompt: "On a free-body diagram, which way should friction point?",
      options: [
        { text: "against the motion — or the motion that's about to happen", correct: true },
        { text: "always opposite the push", feedback: "Not always: push a crate up a steep ramp gently and it still tends to slide DOWN — friction then points up, the same way as the push." },
        { text: "always up the slope", feedback: "Only when the crate tends to slide down. Push it up hard and friction points down the slope." },
        { text: "it doesn't matter, ever", feedback: "While it holds you may guess (a negative F means the other way). But at impending motion, $F = \\mu_s N$ must point against the motion." },
      ],
      explanation: "Friction resists slipping. When unsure, draw it either way along the surface: a negative answer means the other way.",
    },
  ],
};
