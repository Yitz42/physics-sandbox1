// Unit 7.3, stage 5 — concept check: writing V(x) and M(x).

export default {
  id: "shear-moment-equations/5-concept-check",
  challenge: "concept-check",
  title: "Equations Along a Beam",
  mission: "Show you understand how V(x) and M(x) are written.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Why does a beam with a point load in the middle need TWO sets of V(x) and M(x) equations?",
      options: [
        { text: "Past the load, it's on the left piece too, so a new term joins the equations", correct: true },
        { text: "Because the beam has two supports", feedback: "It's not the number of supports but where things happen: each point load (or support, couple, load start or end) begins a new segment." },
        { text: "Because V and M are different", feedback: "V and M each need their own equation, but the point is that BOTH change formula at the load: one pair per segment." },
        { text: "It doesn't — one equation covers the whole beam", feedback: "A cut left of the load doesn't feel it; a cut right of it does. The equations must differ." },
      ],
      explanation: "A cut at x feels only the forces on the left piece. Crossing a load adds it to the piece, so the equations change there: one pair per segment.",
    },
    {
      prompt: "In M(x), a point load P at x = 2 m (with the cut at x > 2) appears as…",
      options: [
        { text: "$-P(x - 2)$", correct: true },
        { text: "$-Px$", feedback: "The arm is from the load to the cut: $(x - 2)$, not the distance from A." },
        { text: "$-P(2 - x)$", feedback: "That's the arm the wrong way round: for a cut right of the load it's $(x - 2)$, and a downward load bends the piece into a frown (minus)." },
        { text: "$-P$", feedback: "That's its term in V(x). In M(x) it's multiplied by its arm, $(x - 2)$." },
      ],
      explanation: "Each force's moment about the cut is the force times its distance to the cut: $(x - a)$ for a force at $x = a$.",
    },
    {
      prompt: "A uniform load w starts at A. In M(x), the part on the left piece gives…",
      options: [
        { text: "$-w\\,\\dfrac{x^2}{2}$ (the load wx acting at x/2)", correct: true },
        { text: "$-wx^2$", feedback: "The load on the piece, wx, acts at its middle: its arm is $x/2$, not x." },
        { text: "$-wx$", feedback: "That's its term in V(x). In M(x) it's multiplied by its arm $x/2$." },
        { text: "$-\\dfrac{wL^2}{8}$", feedback: "That's the peak moment of a whole uniformly loaded span. The equation needs the load on the piece: wx at x/2." },
      ],
      explanation: "The load on the piece is $wx$, acting at its centroid $x/2$ from the cut: moment $wx \\cdot \\tfrac{x}{2} = w\\tfrac{x^2}{2}$.",
    },
    {
      prompt: "You wrote $M(x) = 900x - 200x^2$. What is V(x)?",
      options: [
        { text: "$900 - 400x$ (since $V = dM/dx$)", correct: true },
        { text: "$900x - 400x^2$", feedback: "V is the SLOPE of M: differentiate, $dM/dx = 900 - 400x$." },
        { text: "$450x^2 - \\tfrac{200}{3}x^3$", feedback: "That's integrating. V is M's derivative: $dM/dx$." },
        { text: "$900 - 200x$", feedback: "Differentiate $200x^2$ carefully: it gives $400x$." },
      ],
      explanation: "$dM/dx = V$: differentiating M(x) gives V(x) — a quick check on your equations.",
    },
    {
      prompt: "Where two segments meet (with no point force or couple there), their equations…",
      options: [
        { text: "give the same V and M at the boundary", correct: true },
        { text: "must be the same equation", feedback: "The formulas differ, but at the meeting point they must give the same values — nothing there makes V or M jump." },
        { text: "can give any values", feedback: "V and M only jump where a point force or couple acts. Otherwise the two segments' values must match." },
        { text: "both give zero", feedback: "Only at a free end or a pin at the end is M zero. At an interior boundary, they just agree." },
      ],
      explanation: "V and M are continuous except where a point force (V jumps) or a couple (M jumps) acts — so neighbouring segments' equations must agree at their boundary.",
    },
  ],
  explanation: "One pair of equations per segment; each force with its arm $(x - a)$; a distributed load's part at its centroid; check with $dM/dx = V$ and matching values at boundaries.",
};
