// Springs, stage 5 — concept check: the spring law F = k s, and what sets the
// spring's force. Questions are drawn in random order; 3 correct answers finish it.

export default {
  id: "springs/5-concept-check",
  challenge: "concept-check",
  solver: "statics.particle",
  title: "Spring Sense",
  instructions: "Answer 3 questions about springs. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A spring with stiffness $k = 500$ N/m pulls with a force of 100 N. How far is it stretched?",
      options: [
        { text: "0.2 m", correct: true },
        { text: "50 000 m", feedback: "That's $k \\times F$. The spring law is $F = k s$, so $s = F/k$." },
        { text: "5 m", feedback: "That's $k/F$ — upside down. $s = F/k = 100/500$." },
        { text: "100 m", feedback: "The force isn't the stretch. Divide by the stiffness: $s = F/k$." },
      ],
      explanation: "$F = k s$, so $s = F/k = 100/500 = 0.2$ m. Units: N ÷ (N/m) = m.",
    },
    {
      prompt: "A spring holding a crate is swapped for one twice as stiff. The setup is otherwise the same. What happens?",
      options: [
        { text: "The spring force stays the same, and it stretches half as much", correct: true },
        { text: "The spring force doubles", feedback: "The force is set by equilibrium — it must still balance the same loads. Only the stretch changes." },
        { text: "It stretches twice as much", feedback: "A stiffer spring is harder to stretch: for the same force, $s = F/k$ gets smaller." },
        { text: "Nothing changes", feedback: "The force is the same, but $s = F/k$: doubling $k$ halves the stretch." },
      ],
      explanation: "Equilibrium fixes the force $F$ (it must balance the load); the spring then stretches $s = F/k$. Double $k$ → half the stretch.",
    },
    {
      prompt: "A spring's unstretched length is 0.4 m. Holding a load, it is 0.55 m long. Its stiffness is 1000 N/m. What force does it pull with?",
      options: [
        { text: "150 N", correct: true },
        { text: "550 N", feedback: "Use the STRETCH, not the whole length: $s = 0.55 - 0.4 = 0.15$ m." },
        { text: "400 N", feedback: "That uses the unstretched length. A spring only pulls because of the extra length, $s = l - l_0$." },
        { text: "950 N", feedback: "The lengths are subtracted, not added: $s = l - l_0$." },
      ],
      explanation: "The stretch is $s = l - l_0 = 0.15$ m, so $F = k s = 1000(0.15) = 150$ N.",
    },
    {
      prompt: "What are the units of a spring's stiffness $k$?",
      options: [
        { text: "N/m", correct: true },
        { text: "N", feedback: "N is a force. $k$ tells you how many newtons you get PER metre of stretch." },
        { text: "N·m", feedback: "N·m is the unit of a moment. From $F = k s$: $k = F/s$, newtons divided by metres." },
        { text: "m/N", feedback: "Upside down: $k = F/s$ has newtons on top." },
      ],
      explanation: "$k = F/s$, so its unit is newtons per metre, N/m. A 500 N/m spring pulls 500 N for every metre it is stretched.",
    },
    {
      prompt: "A spring is SQUASHED shorter than its unstretched length. What does it do to the things at its ends?",
      options: [
        { text: "It pushes them apart", correct: true },
        { text: "It pulls them together", feedback: "That's a STRETCHED spring. A squashed spring wants to get longer again, so it pushes." },
        { text: "Nothing, until it's stretched", feedback: "Any change of length makes a force: $F = k s$ works for squashing too (with $s$ negative)." },
        { text: "It pulls with $F = k\\,l_0$", feedback: "The force depends on the change of length, $s = l - l_0$, not on $l_0$ itself." },
      ],
      explanation: "A spring always tries to get back to its unstretched length: stretched, it pulls; squashed, it pushes. Unlike a cable, a spring can push.",
    },
  ],
  hints: ["The spring law is $F = k s$: force = stiffness × stretch, with the stretch $s = l - l_0$ measured from the unstretched length."],
  explanation: "A spring's force is set by equilibrium; its stiffness then decides how far it stretches: $s = F/k$, and its length is $l = l_0 + s$.",
};
