// Unit 8.2, stage 5 — concept check: reading shear and moment diagrams.

export default {
  id: "shear-moment-diagrams/5-concept-check",
  challenge: "concept-check",
  title: "Reading the Diagrams",
  mission: "Show you can read shear and moment diagrams.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Under a uniform distributed load, the shear diagram is…",
      options: [
        { text: "a sloping straight line (slope −w)", correct: true },
        { text: "flat", feedback: "V is flat only where there is NO distributed load. Under w, $dV/dx = -w$: a steady slope." },
        { text: "a parabola", feedback: "That's the moment diagram under a uniform load. V falls at a steady rate: a straight line." },
        { text: "a jump", feedback: "Jumps come from POINT forces. A load spread out makes V change gradually." },
      ],
      explanation: "$dV/dx = -w$: a uniform load makes V fall at a steady rate, so its diagram is a straight sloping line (and M, its area, a parabola).",
    },
    {
      prompt: "Where on a beam is the bending moment largest?",
      options: [
        { text: "where V = 0 or changes sign (or at a support or end)", correct: true },
        { text: "where V is largest", feedback: "dM/dx = V: where V is largest, M is changing fastest — not at its peak. M peaks where V passes through zero." },
        { text: "always at mid-span", feedback: "Only for symmetric loading. In general, find where V passes through zero." },
        { text: "under the biggest load", feedback: "Often close, but not always — the peak is where V passes through zero." },
      ],
      explanation: "Since $dM/dx = V$, M has its peaks where V = 0 or where V jumps through zero. Check the supports and ends too (an overhang's moment over its support).",
    },
    {
      prompt: "At a point load P, the diagrams…",
      options: [
        { text: "V jumps by P; M has a corner (its slope changes)", correct: true },
        { text: "M jumps by P", feedback: "A point FORCE makes V jump. M only jumps at a couple." },
        { text: "nothing changes", feedback: "The load changes the shear suddenly: V jumps by P." },
        { text: "V and M both jump", feedback: "Only V jumps. M's slope (= V) changes suddenly, so M has a sharp corner, but no jump." },
      ],
      explanation: "A point force makes V jump by its size. Since M's slope is V, M gets a kink there, but stays continuous.",
    },
    {
      prompt: "A couple (a concentrated moment) acts on a beam. At that point…",
      options: [
        { text: "M jumps by the couple; V doesn't change", correct: true },
        { text: "V jumps by the couple", feedback: "A couple has no net force, so V doesn't change. It makes M jump." },
        { text: "nothing changes — a couple just turns things", feedback: "It turns the piece — so the bending moment inside jumps by its size." },
        { text: "both V and M jump", feedback: "A couple adds no force: only M jumps." },
      ],
      explanation: "A couple adds a moment but no force: M jumps by its size (walking left to right, up for a clockwise couple), V is unchanged.",
    },
    {
      prompt: "Between A and the first load, V = +2 kN (constant) over 3 m. Starting from M = 0 at A, M at the load is…",
      options: [
        { text: "+6 kN·m (the area under V)", correct: true },
        { text: "+2 kN·m", feedback: "M changes by the AREA under V: 2 kN × 3 m." },
        { text: "−6 kN·m", feedback: "Positive V makes M rise: dM/dx = V > 0." },
        { text: "0 — V is constant", feedback: "Constant V means M changes at a constant rate — it still changes, by V × length." },
      ],
      explanation: "$M_B = M_A + \\int V\\,dx$: the area under the V diagram, here 2 kN × 3 m = 6 kN·m.",
    },
  ],
  explanation: "$dV/dx = -w$ and $dM/dx = V$: V jumps at point forces and slopes under loads; M changes by the area under V, jumps at couples, and peaks where V = 0.",
};
