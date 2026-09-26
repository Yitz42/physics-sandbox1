// Unit 2, stage 5 — concept check, in two parts: what equilibrium does and
// doesn't tell you (3 questions); springs and pulleys (2 questions).
import { crateSetup } from "./crate.js";

export default {
  id: "02-particle-equilibrium/5-concept-check",
  challenge: "concept-check",
  solver: "statics.particle",
  title: "Equilibrium Ideas",
  parts: [
    {
      title: "Equilibrium",
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
    },
    {
      title: "Springs and pulleys",
      instructions: "Answer 2 questions about springs and pulleys. Every wrong choice explains the misconception behind it.",
      required: 2,
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
          prompt: "A small pulley can roll freely along a cable stretched between two hooks, with a crate hanging from it. Nothing else holds it. Where does it come to rest?",
          options: [
            { text: "Where both sides of the cable make the same angle with the horizontal", correct: true },
            { text: "Exactly halfway between the hooks", feedback: "Only if the hooks are at the same height. What matters is the angles: the same $T$ on both sides must have equal sideways parts." },
            { text: "Right under the higher hook", feedback: "Then one side would be vertical and the other slanted: their sideways parts couldn't cancel." },
            { text: "Anywhere: it's in equilibrium everywhere", feedback: "Both sides have the same tension $T$, so $\\Sigma F_x = 0$ needs $T\\cos\\theta_1 = T\\cos\\theta_2$ — only one spot does that." },
          ],
          explanation: "Both sides pull with the same $T$. $\\Sigma F_x = 0$ gives $T\\cos\\theta_1 = T\\cos\\theta_2$, so $\\theta_1 = \\theta_2$: the pulley slides until the angles match.",
        },
      ],
      hints: ["A frictionless pulley keeps the same tension on both sides. A spring pulls with $F = k s$, where $s$ is the stretch beyond its unstretched length."],
      explanation: "Pulleys turn a cable without changing its tension; springs pull in proportion to their stretch, $F = k s$. Equilibrium still decides the forces.",
    },
  ],
  explanation:
    "Equilibrium ($\\Sigma F = 0$) finds up to two unknown forces at a point, whatever makes them: cables, springs or a cable over a pulley.",
};
