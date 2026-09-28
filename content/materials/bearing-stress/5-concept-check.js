// Bearing stress, stage 5 — concept check: intuition for projected area, contact pressure, and failure modes.

export default {
  id: "bearing-stress/5-concept-check",
  challenge: "concept-check",
  solver: "materials.bearingStress",
  title: "Understanding Bearing Stress",
  mission: "Answer questions testing your intuition for bearing stress and projected contact area.",
  instructions:
    "Test your understanding of bearing stress $\\sigma_b = P / (t \\cdot d)$ in structural connections. " +
    "Consider why the projected area is used, how geometry influences contact stress, and how bearing stress differs from shear and tension.",
  required: 3,
  questions: [
    {
      prompt: "Why is bearing stress computed using the **projected rectangular area** $A_b = t \\cdot d$ rather than the actual curved semicircular contact surface $\\frac{\\pi}{2} d t$?",
      options: [
        {
          text: "Integrating the components of the contact pressure in the direction of the load yields a resultant equal to the average stress times the projected area $t \\cdot d$.",
          correct: true,
        },
        {
          text: "The pin only touches the plate along a single flat line, not around the curved hole.",
          feedback: "The pin touches the plate over the entire half-hole, but only the pressure component parallel to the load resists the force.",
        },
        {
          text: "Curved surfaces cannot develop normal stresses.",
          feedback: "Curved surfaces certainly develop normal contact stresses (pressure acts normal to the surface at every point).",
        },
      ],
      explanation:
        "The radial pressure distribution varies around the semicircular hole. " +
        "When you integrate the pressure components in the direction of the tensile force $P$, the geometric integral across the semicircle gives exactly the projected width $d$. " +
        "Using $A_b = t \\cdot d$ simplifies calculations while accurately matching the equilibrium resultant.",
    },
    {
      prompt: "If you double the plate thickness $t$ while keeping the load $P$ and pin diameter $d$ constant, how does the bearing stress $\\sigma_b$ change?",
      options: [
        { text: "It decreases to 1/2 of its original value.", correct: true },
        { text: "It decreases to 1/4 of its original value.", feedback: "Bearing area is linear with thickness: $A_b = t \\cdot d$. Only diameter in circular cross-sections squares." },
        { text: "It remains unchanged because the pin diameter is the same.", feedback: "A thicker plate provides more contact height for the pin to push against, increasing area." },
      ],
      explanation:
        "Because the projected area is $A_b = t \\cdot d$, doubling the thickness $t$ doubles the contact area $A_b$. " +
        "Since $\\sigma_b = P / A_b$, doubling the area cuts the bearing stress exactly in half.",
    },
    {
      prompt: "In a clevis joint, a central plate of thickness $t_1 = 16\\,\\text{mm}$ carries load $P$. Two outer side brackets of thickness $t_2 = 8\\,\\text{mm}$ each carry $P / 2$. Which part experiences higher bearing stress?",
      options: [
        {
          text: "Both experience the exact same bearing stress.",
          correct: true,
        },
        {
          text: "The central plate, because it carries the full load $P$.",
          feedback: "The central plate carries full load $P$, but it also has twice the thickness ($16\\text{ mm}$ vs $8\\text{ mm}$)." ,
        },
        {
          text: "The outer brackets, because they are thinner.",
          feedback: "The outer brackets are half as thick, but each carries only half the load ($P / 2$), so the ratio $P / (t \\cdot d)$ is identical.",
        },
      ],
      explanation:
        "For the central plate: $\\sigma_{b,1} = \\frac{P}{t_1 \\cdot d} = \\frac{P}{16\\,d}$. " +
        "For each outer bracket: $\\sigma_{b,2} = \\frac{P / 2}{t_2 \\cdot d} = \\frac{P / 2}{8\\,d} = \\frac{P}{16\\,d}$. " +
        "Both members experience identical bearing stress!",
    },
    {
      prompt: "What physical damage occurs if a joint fails primarily in **bearing**?",
      options: [
        {
          text: "The hole elongates into an oval as the plate material yields and crushes against the pin.",
          correct: true,
        },
        {
          text: "The pin slices cleanly across its circular cross-section.",
          feedback: "Pin slicing is shear failure, not bearing failure of the plate.",
        },
        {
          text: "The entire plate snaps across its net section far from the contact zone.",
          feedback: "Snapping across the net section is tensile fracture, not contact bearing failure.",
        },
      ],
      explanation:
        "Bearing failure is a localized compressive crushing and yielding of the plate material directly in contact with the pin. " +
        "The hole deforms and stretches into an oval slot, allowing excessive joint play and eventual tear-out.",
    },
  ],
  hints: [
    "Projected area $A_b = t \\cdot d$ is linear in both $t$ and $d$.",
    "In a clevis joint, the outer plates share the load: each carries $P / 2$.",
    "Bearing is compressive contact pressure, distinct from shear slicing of the pin.",
  ],
  explanation:
    "Bearing stress $\\sigma_b = P / (t \\cdot d)$ governs the contact integrity of pinned and bolted joints. " +
    "Engineers must ensure that both the pin resists shear ($\\tau = V / A$) and the plate hole resists bearing crushing ($\\sigma_b = P / A_b$).",
};
