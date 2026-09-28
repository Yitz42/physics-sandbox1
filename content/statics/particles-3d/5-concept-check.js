// Unit 3.4, stage 5 — concept check: a particle in equilibrium in space.

export default {
  id: "particles-3d/5-concept-check",
  challenge: "concept-check",
  title: "Balance in Space",
  mission: "Show you understand why three equations hold a point in space — and when they can't.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A ring in space is held by FOUR cables, all with unknown tensions. What can equilibrium tell you?",
      options: [
        { text: "Not all four: three equations can't fix four unknowns (statically indeterminate).", correct: true },
        { text: "All four tensions.", feedback: "A point in space gives only three equations: $\\Sigma F_x$, $\\Sigma F_y$, $\\Sigma F_z$. Four unknowns leave one free." },
        { text: "All four, if you also take moments.", feedback: "Every force passes through the ring, so their moments about it are all zero: no new equation." },
        { text: "Nothing at all.", feedback: "The three equations still hold; they just can't decide how four cables share the load without knowing how the cables stretch." },
      ],
      explanation: "Three equations, four unknowns: statically indeterminate. How four cables share a load depends on how stiff they are — a question for Mechanics of Materials.",
    },
    {
      prompt: "Three cables hold a crate from anchors on the ceiling. Seen from above, the ring is OUTSIDE the triangle made by the three anchors. What happens?",
      options: [
        { text: "One cable would have to push, so it goes slack and the crate swings.", correct: true },
        { text: "Nothing: the three tensions just come out different.", feedback: "The sideways pulls can only cancel if they point out on every side of the ring. Outside the triangle, they all lean one way — one tension comes out negative." },
        { text: "The cables carry exactly the weight between them.", feedback: "The vertical parts must add to $W$, but that's not enough: the sideways parts must cancel too, and here they can't." },
        { text: "It's statically indeterminate.", feedback: "There are still three unknowns and three equations. The solution just asks one cable to push — impossible for a cable." },
      ],
      explanation: "A negative tension in the answer means a cable would have to push. For cables to hold a point, their pulls must surround it: seen from above, it must sit inside their anchors' triangle.",
    },
    {
      prompt: "A crate of weight W hangs from ring A. In which equilibrium equations does W appear?",
      options: [
        { text: "Only in $\\Sigma F_z = 0$ (z up), as $-W$", correct: true },
        { text: "In all three, split like a cable's pull", feedback: "The weight points straight down: its x and y components are zero. Only z gets it." },
        { text: "Only in $\\Sigma F_z = 0$, as $+W$", feedback: "Down is the −z direction (z is up), so the weight's z-component is $-W$." },
        { text: "Nowhere: the cables already carry it", feedback: "The cables carry it BECAUSE the weight pulls on A. Leave $W$ out and the equations say nothing holds the crate up." },
      ],
      explanation: "$\\mathbf{W} = -W\\,\\mathbf{k}$: straight down. It appears only in the z-equation, balanced by the cables' vertical parts.",
    },
    {
      prompt: "Three cables hold a ring, all in the same horizontal plane as the ring. A crate hangs from it. Can they hold it?",
      options: [
        { text: "No: none of them pulls up, so nothing balances the weight in $\\Sigma F_z$.", correct: true },
        { text: "Yes, if the tensions are big enough.", feedback: "A level cable has no vertical part, however hard it pulls: $\\Sigma F_z = -W \\ne 0$." },
        { text: "Yes, like three people holding a trampoline.", feedback: "A trampoline sags, so its pulls tilt upward. Perfectly level cables have no vertical part at all." },
        { text: "Only if the cables are 120° apart.", feedback: "Spacing only helps the sideways parts cancel. Up and down still needs something with a z-part." },
      ],
      explanation: "The three unknowns all lie in one plane, so they can't balance a force across it. That's why real cables always sag a little — the sag gives each a vertical part.",
    },
    {
      prompt: "A cable from A (0, 0, 3) to B (−3, −2, 9) m. What goes in $\\Sigma F_z$ for its tension $T_{AB}$?",
      options: [
        { text: "$+\\tfrac{6}{7}T_{AB}$", correct: true },
        { text: "$-\\tfrac{6}{7}T_{AB}$", feedback: "B is ABOVE A ($z_B - z_A = +6$), so the cable pulls A up: the z-part is positive." },
        { text: "$+6\\,T_{AB}$", feedback: "That's the position vector's z-part in metres. Divide by the length first: $u_z = 6/7$." },
        { text: "$+\\tfrac{6}{9}T_{AB}$", feedback: "That divides by B's z-coordinate. Divide by the cable's LENGTH: $r = \\sqrt{3^2 + 2^2 + 6^2} = 7$ m." },
      ],
      explanation: "$\\mathbf{r}_{AB} = \\{-3\\,\\mathbf{i} - 2\\,\\mathbf{j} + 6\\,\\mathbf{k}\\}$ m, $r_{AB} = 7$ m, so $u_z = 6/7$ and the term is $+\\tfrac{6}{7}T_{AB}$.",
    },
  ],
};
