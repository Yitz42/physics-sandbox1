// Pulleys, stage 5 — concept check: a frictionless pulley keeps the tension the
// same on both sides. Questions are drawn in random order; 3 correct answers finish it.

export default {
  id: "pulleys/5-concept-check",
  challenge: "concept-check",
  solver: "statics.particle",
  title: "Pulley Sense",
  mission: "Show you know how a cable over a pulley pulls.",
  instructions: "Answer 3 questions about pulleys. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A rope runs over a frictionless pulley. One end holds a 50 kg crate at rest. How hard must you pull on the other end?",
      options: [
        { text: "490.5 N — the same as the crate's weight", correct: true },
        { text: "245.3 N — half the weight", feedback: "A single pulley that is fixed in place only turns the rope. The tension is the same all along the rope, so you pull with the whole weight." },
        { text: "981 N — twice the weight", feedback: "The weight hangs from ONE side of the rope. The pulley's axle feels both sides, but your hand only feels one." },
        { text: "50 N", feedback: "50 is the mass in kg. The weight is $W = mg = 50(9.81) = 490.5$ N." },
      ],
      explanation: "A frictionless pulley changes the rope's DIRECTION, not its tension. The tension is 490.5 N on both sides, so that's what you pull with.",
    },
    {
      prompt: "A small pulley can roll freely along a cable stretched between two hooks, with a crate hanging from it. Nothing else holds it. Where does it come to rest?",
      options: [
        { text: "Where both sides of the cable make the same angle with the horizontal", correct: true },
        { text: "Exactly halfway between the hooks", feedback: "Only if the hooks are at the same height. What matters is the angles: the same $T$ on both sides must have equal sideways parts." },
        { text: "Right under the higher hook", feedback: "Then one side would be vertical and the other slanted: their sideways parts couldn't cancel." },
        { text: "Anywhere: it's in equilibrium everywhere", feedback: "Both sides have the same tension $T$, so $\\Sigma F_x = 0$ needs $T\\cos\\theta_1 = T\\cos\\theta_2$ — only one spot does that." },
      ],
      explanation: "Both sides pull with the same $T$. $\\Sigma F_x = 0$ gives $T\\cos\\theta_1 = T\\cos\\theta_2$, so $\\theta_1 = \\theta_2$: the pulley slides until the angles match.",
    },
    {
      prompt: "You draw the free-body diagram of a pulley with a cable running over it. How many forces does the cable put on the pulley?",
      options: [
        { text: "Two: one along each side of the cable, both with tension $T$", correct: true },
        { text: "One: the cable's tension $T$", feedback: "The cable touches the pulley on both sides, and each side pulls along itself. Leaving one out is the classic pulley mistake." },
        { text: "Two, with tensions $T$ and $T/2$", feedback: "With no friction the tension doesn't change around the pulley: both sides pull with $T$." },
        { text: "None: the cable just passes over it", feedback: "The cable presses on the pulley — that's why the pulley's axle has to hold it up." },
      ],
      explanation: "Cut around the pulley and you cut the cable twice. Each cut end pulls away along the cable with tension $T$: two forces of size $T$.",
    },
    {
      prompt: "A crate of weight $W$ hangs from a pulley. A rope runs down from the ceiling, under the pulley, and back up to your hand; both sides of the rope are vertical. How hard must you pull?",
      options: [
        { text: "$W/2$", correct: true },
        { text: "$W$", feedback: "Two vertical sides of the rope hold the pulley up, each with tension $T$: $2T = W$." },
        { text: "$2W$", feedback: "The two sides SHARE the load: $2T = W$, so each carries half." },
        { text: "It depends on how long the rope is", feedback: "Length doesn't matter; only how many sides of the rope hold the pulley up, and their angles." },
      ],
      explanation: "FBD of the hanging pulley: $T$ up on each side and $W$ down, so $2T = W$ and $T = W/2$. This is why pulleys give a mechanical advantage.",
    },
    {
      prompt: "Why is the tension the same on both sides of a FRICTIONLESS pulley?",
      options: [
        { text: "Taking moments about the axle: $T_1 r - T_2 r = 0$, so $T_1 = T_2$", correct: true },
        { text: "Because the rope is the same colour all the way", feedback: "Being one rope isn't enough — with friction on the axle the two sides CAN differ. It's the moment balance that makes them equal." },
        { text: "Because the pulley doesn't move", feedback: "It's not moving, but that alone (ΣF = 0) involves the axle force too. The key is $\\Sigma M = 0$ about the axle." },
        { text: "It isn't: the side holding the load has more tension", feedback: "With no friction, the moments of the two tensions about the axle must cancel: $T_1 r = T_2 r$." },
      ],
      explanation: "Both sides pull at the same distance $r$ from the axle. With no friction, $\\Sigma M_{axle} = T_1 r - T_2 r = 0$, so $T_1 = T_2$.",
    },
  ],
  hints: ["A frictionless pulley keeps the same tension $T$ on both sides; count how many sides of the cable pull on what you've isolated."],
  explanation: "A frictionless pulley turns a cable without changing its tension. On a free-body diagram, every side of the cable that touches the body pulls with that same $T$.",
};
