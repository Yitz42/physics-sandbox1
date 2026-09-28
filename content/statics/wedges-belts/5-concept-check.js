// Unit 9.3, stage 5 — concept check: belt friction and wedges.

export default {
  id: "wedges-belts/5-concept-check",
  challenge: "concept-check",
  title: "Ropes and Wedges",
  mission: "Show you understand belt friction and wedges.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "In $T_2 = T_1 e^{\\mu_s\\beta}$, which end of the rope is $T_2$?",
      options: [
        { text: "the end the rope is about to slip toward — the tighter one", correct: true },
        { text: "always the load's end", feedback: "Only when the rope holds a load back. Hoisting the load, the rope slips toward YOU: your end is $T_2$." },
        { text: "always the hand's end", feedback: "Holding a load back, friction helps you: your end is the slack one, $T_1$." },
        { text: "whichever end is on the right", feedback: "Sides don't matter — the way the rope would slip does. Friction resists that slip, so that end is tighter." },
      ],
      explanation: "Friction resists the slip, so the tension is bigger on the side the rope is pulled toward: that's $T_2$.",
    },
    {
      prompt: "A rope needs a 100 N hand pull with one turn round a post. With two turns, the pull is…",
      options: [
        { text: "100 N divided by the same factor again — much less than 50 N", correct: true },
        { text: "50 N", feedback: "Friction doesn't scale that way: each turn divides by $e^{2\\pi\\mu_s}$ (6.6 for $\\mu_s = 0.3$), so two turns divide by that squared." },
        { text: "100 N minus a fixed amount", feedback: "Each bit of contact grips in proportion to the tension there: the effect multiplies, it doesn't subtract." },
        { text: "the same — the rope just goes round more", feedback: "More contact means more friction: β grows, and $e^{\\mu_s\\beta}$ with it." },
      ],
      explanation: "The ratio is $e^{\\mu_s\\beta}$: doubling β squares it.",
    },
    {
      prompt: "Does the post's radius change how much a rope wrapped round it can hold?",
      options: [
        { text: "No — only $\\mu_s$ and the angle of contact β matter", correct: true },
        { text: "Yes — a bigger post has more rope touching it", feedback: "More rope, but it presses less hard per metre (a gentler curve). The two cancel: only the angle counts." },
        { text: "Yes — a smaller post grips harder", feedback: "Tighter curve, but less rope in contact. They cancel: $T_2/T_1 = e^{\\mu_s\\beta}$ has no radius in it." },
        { text: "Only if the post turns", feedback: "A turning drum is a pulley — then there's no friction slip at all. For a fixed post, only β and $\\mu_s$ matter." },
      ],
      explanation: "The radius cancels out of the derivation: $dT = \\mu_s T\\,d\\theta$.",
    },
    {
      prompt: "A wedge is driven in under a block, lifting it. The friction force on the BLOCK from the wedge points…",
      options: [
        { text: "down along the wedge's face — against the block's sliding up it", correct: true },
        { text: "up along the face", feedback: "The block slides UP the wedge face (relative to the wedge); friction on it resists that, pointing down the face." },
        { text: "the same way as the push P", feedback: "Friction acts along each surface, against the sliding THERE — it doesn't follow the push." },
        { text: "there's no friction between the wedge and the block", feedback: "That face is rough, and it slides as the wedge goes in — it's where most of the friction is." },
      ],
      explanation: "At each contact, find how the two surfaces slide past each other; friction on each body resists its own slide.",
    },
    {
      prompt: "A wedge is \"self-locking\" when…",
      options: [
        { text: "friction holds it in place with no push — it must be pulled to come out", correct: true },
        { text: "it can't be driven in at all", feedback: "That's jamming. A self-locking wedge can be driven in; it just doesn't slip back out by itself." },
        { text: "its angle is more than 45°", feedback: "Steep wedges are the ones that squirt back out. Self-locking needs a flat enough angle for friction to hold it." },
        { text: "there's no friction under it", feedback: "Without friction nothing would hold it: the block's weight would push it straight back out." },
      ],
      explanation: "Remove the push and the block tries to push the wedge out. If friction can resist that, the wedge stays: self-locking. A flatter wedge locks more easily.",
    },
  ],
};
