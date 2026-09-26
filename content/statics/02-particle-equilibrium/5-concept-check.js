// Unit 2, stage 5 — concept check: what equilibrium does and doesn't tell you.
import { crateSetup } from "./crate.js";

export default {
  id: "02-particle-equilibrium/5-concept-check",
  challenge: "concept-check",
  solver: "statics.particle",
  title: "Equilibrium Ideas",
  mission: "Show you know what it means for a point to be in equilibrium.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "The crate hangs from two cables at equal angles. If both cables are made **flatter** (closer to horizontal), the tensions…",
      setup: crateSetup({ angleAB: 40, angleAC: 40, mass: 50 }),
      options: [
        { text: "increase", correct: true },
        { text: "decrease", feedback: "Flatter cables have smaller vertical components. To still hold up $W$, the tensions must grow." },
        { text: "stay the same", feedback: "The weight is the same, but each cable's vertical part $T\\sin\\theta$ gets smaller as $\\theta$ drops, so $T$ must change." },
        { text: "become zero", feedback: "Something still has to hold the crate up — the tensions can't vanish." },
      ],
      explanation: "$2T\\sin\\theta = W$, so $T = \\dfrac{W}{2\\sin\\theta}$. As $\\theta \\to 0$, $\\sin\\theta \\to 0$ and $T$ grows without limit.",
    },
    {
      prompt: "For forces acting through a single point in 2D, how many unknown forces can equilibrium ($\\Sigma F = 0$) find?",
      options: [
        { text: "2", correct: true },
        { text: "1", feedback: "There are two independent equations, $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$, so two unknowns can be found." },
        { text: "3", feedback: "A third equation, $\\Sigma M = 0$, is automatic here: every force passes through the same point, so it adds no information." },
        { text: "As many as there are forces", feedback: "The number of equations limits it, not the number of forces." },
      ],
      explanation: "A particle in 2D gives exactly two equations, $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$, so at most two unknowns.",
    },
    {
      prompt: "A weight hangs from **one** cable that is tilted 30° from vertical, with nothing else attached. What happens?",
      options: [
        { text: "It swings until the cable hangs straight down.", correct: true },
        { text: "It stays put, with $T = W/\\cos 30^\\circ$.", feedback: "Then the tension would have a sideways component, $T\\sin 30^\\circ$, with nothing to balance it: $\\Sigma F_x \\neq 0$." },
        { text: "It stays put, with $T = W$.", feedback: "A tilted cable pulls partly sideways. With no other horizontal force, $\\Sigma F_x = 0$ can't be satisfied." },
        { text: "The cable breaks.", feedback: "Nothing says the cable is overloaded — the problem is balance, not strength." },
      ],
      explanation: "With one cable, $\\Sigma F_x = 0$ needs the cable's horizontal component to be zero, so the cable must be vertical. Otherwise the point accelerates until it is.",
    },
    {
      prompt: "Why do we draw a cable's tension pointing **away** from the ring on the FBD?",
      options: [
        { text: "A cable can only pull, so it pulls the ring toward the anchor.", correct: true },
        { text: "It's only a convention; either way works.", feedback: "For a cable it's physics, not convention: a cable can't push. Drawing it pulling means a negative answer warns you the setup can't work." },
        { text: "Because tension is always positive in y.", feedback: "Tension can point any direction — along its cable. It's the pulling, not the y-direction, that matters." },
        { text: "Because the anchor pushes on the ring.", feedback: "The anchor holds the cable; the cable pulls the ring. Nothing pushes." },
      ],
      explanation: "Cables, ropes and chains carry tension only: they pull along their own length, away from the body they're attached to.",
    },
    {
      prompt: "A 50 kg crate hangs at rest from ring A. What is the **net** force on ring A?",
      setup: crateSetup({ angleAB: 30, angleAC: 45, mass: 50 }),
      options: [
        { text: "0 N", correct: true },
        { text: "490.5 N downward", feedback: "That's the weight alone. The cables pull up and sideways just enough to cancel it." },
        { text: "50 N", feedback: "50 is the mass in kg — and anyway the forces cancel." },
        { text: "It depends on the cable angles", feedback: "The angles change the individual tensions, but at rest the forces always add to zero." },
      ],
      explanation: "\"At rest\" means equilibrium: $\\Sigma F = 0$. The individual forces can be large; their sum is zero.",
    },
    {
      prompt: "**Three** cables hold a ring that carries a weight. Using only $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$, you can…",
      options: [
        { text: "not find all three tensions — it's statically indeterminate.", correct: true },
        { text: "find all three tensions.", feedback: "Three unknowns but only two equations: infinitely many sets of tensions balance the weight." },
        { text: "find them only if the angles are equal.", feedback: "Symmetry might suggest an answer, but the equations alone still can't decide how the load is shared." },
        { text: "find them by also using $\\Sigma M = 0$.", feedback: "All the forces pass through the ring, so their moments about it are zero automatically — no new information." },
      ],
      explanation: "More unknowns than equations means statically indeterminate. Finding the real tensions needs how the cables stretch — that's mechanics of materials, a later course.",
    },
  ],
  hints: ["Think about the two equations, $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$, and what each one controls."],
  explanation: "Equilibrium means the forces on the point add to zero in every direction.",
};
