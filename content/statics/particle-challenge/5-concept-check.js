// Unit 3.5, stage 5 — concept check: equilibrium ideas from Chapter 3, and Chapter 2 ideas
// used inside equilibrium problems. Drawn in random order; 3 correct answers finish it.

export default {
  id: "particle-challenge/5-concept-check",
  challenge: "concept-check",
  title: "Balance Sense",
  mission: "Show you can reason about a particle in equilibrium in new situations.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A crate hangs on two cables, one at 30° and one at 60° above level, each rated 500 N. You keep adding weight. Which cable reaches 500 N first?",
      options: [
        { text: "The 60° (steeper) cable", correct: true },
        { text: "The 30° (flatter) cable", feedback: "$\\Sigma F_x = 0$: $T_{30}\\cos 30^\\circ = T_{60}\\cos 60^\\circ$, so $T_{60} = 1.73\\,T_{30}$. The steeper cable has the smaller cosine and needs the bigger tension." },
        { text: "Both at once", feedback: "Only if the angles were equal. Here the sideways parts must cancel, and that makes the tensions different." },
        { text: "It depends on how heavy the crate is", feedback: "Both tensions grow in proportion to the weight; their ratio comes from the angles alone. The same cable always goes first." },
      ],
      explanation: "The ratio of the tensions is set by $\\Sigma F_x = 0$ — geometry only. The steeper cable carries more, so it limits the load: set it to its rating and solve for $W$.",
    },
    {
      prompt: "A spring runs from A (0, 0) to B (3, 4) m. Its unstretched length is 4 m and $k = 100$ N/m. How hard does it pull on A?",
      options: [
        { text: "100 N", correct: true },
        { text: "500 N", feedback: "That uses the whole length, 5 m, as the stretch. The stretch is only the EXTRA length: $s = 5 - 4 = 1$ m." },
        { text: "400 N", feedback: "That uses the unstretched length as the stretch. The stretch is $s = l - l_0$, where $l$ = 5 m is the distance from A to B." },
        { text: "You can't tell without the weight it holds", feedback: "Here the spring's LENGTH is known (from the coordinates), so its force is known too: $F = k(l - l_0)$. Equilibrium then finds the OTHER forces." },
      ],
      explanation: "The distance between the ends is the spring's length: $l = \\sqrt{3^2 + 4^2} = 5$ m. Stretch $s = 5 - 4 = 1$ m, so $F = ks = 100$ N, pulling A toward B.",
    },
    {
      prompt: "A ring is held by three cables in a plane, and all three tensions are unknown. What can $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ tell you?",
      options: [
        { text: "Not all three: two equations can't fix three unknowns (statically indeterminate)", correct: true },
        { text: "All three tensions", feedback: "A particle in a plane gives only TWO equations. With three unknown tensions there are many ways to share the load." },
        { text: "All three, if you also use ΣM = 0", feedback: "All the forces pass through one point, so their moments about it are zero: $\\Sigma M$ adds no new equation for a particle." },
        { text: "Nothing at all", feedback: "The two equations still hold — they just can't decide how the three cables share the load without more information (e.g. how the cables stretch)." },
      ],
      explanation: "Two equations, three unknowns: statically indeterminate. Real cables share such a load according to how much they stretch — a Mechanics of Materials question.",
    },
    {
      prompt: "You pull a hanging lamp aside with a force $P$ while it hangs on a cable at 30° from vertical. Which direction of $P$ needs the SMALLEST pull?",
      options: [
        { text: "At right angles to the cable", correct: true },
        { text: "Level (horizontal)", feedback: "Level needs $P = W\\tan 30^\\circ$; perpendicular to the cable needs only $W\\sin 30^\\circ$, which is smaller." },
        { text: "Straight along the cable", feedback: "A pull along the cable can't move the lamp sideways at all — it only changes the cable's tension." },
        { text: "Straight up", feedback: "Straight up, you'd have to lift the whole lamp ($P = W$) — the cable goes slack." },
      ],
      explanation: "The cable supplies any force along itself for free; $P$ only has to supply the part ACROSS the cable. Pointing $P$ straight across the cable wastes none of it.",
    },
    {
      prompt: "A pulley rides on a cable; the two sides of the cable make DIFFERENT angles with the level, and nothing else holds the pulley sideways. What happens?",
      options: [
        { text: "It rolls along the cable until both sides make the same angle", correct: true },
        { text: "It stays put: the steeper side just pulls harder", feedback: "Over a frictionless pulley both sides have the SAME tension $T$. Different angles mean their sideways parts, $T\\cos\\theta$, don't cancel — so it moves." },
        { text: "The cable snaps", feedback: "Nothing overloads the cable here. The pulley simply can't be in equilibrium where it is, so it moves." },
        { text: "It stays put if it's heavy enough", feedback: "Weight pulls straight down, so it can't cancel a sideways imbalance. $\\Sigma F_x = T(\\cos\\theta_1 - \\cos\\theta_2) \\ne 0$ whatever the weight." },
      ],
      explanation: "Equal tensions on both sides mean the sideways parts cancel only when the angles are equal. That's where a pulley settles — or a rope must hold it (Unit 3.3).",
    },
    {
      prompt: "Two cables hold a traffic light, both nearly level (5° above horizontal). Compared with the light's weight $W$, each tension is…",
      options: [
        { text: "much bigger than $W$ (about $5.7\\,W$)", correct: true },
        { text: "about $W/2$", feedback: "That's true only for vertical cables. Here only the small vertical parts, $T\\sin 5^\\circ$, hold the light up." },
        { text: "a little less than $W$", feedback: "$2T\\sin 5^\\circ = W$ gives $T = W/(2 \\times 0.0872) = 5.7\\,W$." },
        { text: "zero, because the cables are level", feedback: "Perfectly level cables couldn't hold anything up — which is why nearly level ones need enormous tensions." },
      ],
      explanation: "$2T\\sin\\theta = W$, so $T = W/(2\\sin\\theta)$: as the cables flatten, $\\sin\\theta \\to 0$ and the tension grows without limit. That's why wires always sag a little.",
    },
    {
      prompt: "A cable pulls ring A toward B. A student writes its unit vector as $\\mathbf{u} = \\mathbf{r}_A - \\mathbf{r}_B$ divided by its length. What goes wrong in the equilibrium equations?",
      options: [
        { text: "The cable's force points the wrong way, so the tension comes out negative (or other forces come out wrong)", correct: true },
        { text: "Nothing: the size of the unit vector is still 1", feedback: "The size is 1, but it points from B to A — as if the cable pushed. A cable must pull A TOWARD B: $\\mathbf{r}_B - \\mathbf{r}_A$." },
        { text: "Only the units are wrong", feedback: "The units are fine (dividing metres by metres). It's the direction that is reversed." },
        { text: "Only $\\Sigma F_x$ is affected", feedback: "Both components flip sign when the subtraction is backwards, so both equations are affected." },
      ],
      explanation: "END minus START: the cable pulls A toward B, so $\\mathbf{u}_{AB} = (\\mathbf{r}_B - \\mathbf{r}_A)/r_{AB}$. A negative tension in the answer is the tell-tale sign of a backwards direction — cables can't push.",
    },
  ],
};
