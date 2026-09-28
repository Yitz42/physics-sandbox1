// Allowable stress, stage 5 — concept check: intuition for simultaneous failure modes and safety factors.

export default {
  id: "allowable-stress/5-concept-check",
  challenge: "concept-check",
  solver: "materials.allowableStress",
  title: "Understanding Allowable Stress Design",
  mission: "Answer questions testing your intuition for simultaneous failure modes and safety factors.",
  instructions:
    "Test your understanding of allowable stress design, factor of safety, and multiple failure mode interactions. " +
    "Consider how the weakest link dictates capacity and how geometry can be optimized to balance strength.",
  required: 3,
  questions: [
    {
      prompt: "Why is the overall allowable load of a connection governed by the **minimum** of the allowable capacities ($P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})$)?",
      options: [
        {
          text: "The assembly will experience structural failure as soon as any single component exceeds its safe stress limit.",
          correct: true,
        },
        {
          text: "The average of the capacities should be used, but engineers choose the minimum to simplify the math.",
          feedback: "A structure does not fail at the average capacity: the weakest part fails first.",
        },
        {
          text: "The three failure modes occur sequentially, so the load passes from one to the next.",
          feedback: "All three stresses develop simultaneously in response to the same applied load.",
        },
      ],
      explanation:
        "Structural connections operate on the 'weakest link' principle. " +
        "If a load exceeds the lowest capacity, that specific member or fastener yields or ruptures, even if the other parts of the assembly have ample reserve strength.",
    },
    {
      prompt: "If a connection is designed with a factor of safety $FS = 2.0$ under a working load $P = 40\\,\\text{kN}$, what is the expected failure load $P_{\\text{fail}}$?",
      options: [
        {
          text: "80 kN, because failure capacity is $FS \\times P$.",
          correct: true,
        },
        {
          text: "20 kN, because the load must be halved to ensure safety.",
          feedback: "The factor of safety provides reserve strength above the working load: $P_{\\text{fail}} = FS \\times P$.",
        },
        {
          text: "40 kN, because the connection fails at the working load.",
          feedback: "If it failed at the working load, the factor of safety would be 1.0, not 2.0.",
        },
      ],
      explanation:
        "By definition, the factor of safety is the ratio of failure load to allowable working load: $FS = P_{\\text{fail}} / P$. " +
        "Rearranging yields $P_{\\text{fail}} = FS \\times P = 2.0 \\times 40\\,\\text{kN} = 80\\,\\text{kN}$.",
    },
    {
      prompt: "If an existing connection is governed by **bearing failure** of the plate, which modification increases capacity without requiring a larger pin?",
      options: [
        {
          text: "Increasing the plate thickness $t$, which directly increases the projected contact area $A_b = t \\cdot d$.",
          correct: true,
        },
        {
          text: "Making the tension rod longer to provide more flexibility.",
          feedback: "Length affects elastic elongation, but has no effect on bearing stress at the connection.",
        },
        {
          text: "Switching from double shear to single shear.",
          feedback: "Switching to single shear would halve the pin shear capacity without improving bearing capacity.",
        },
      ],
      explanation:
        "Because bearing capacity is $P_{\\text{bearing}} = \\sigma_{b,\\text{allow}} (t \\cdot d)$, thickening the plate ($t$) increases the contact area linearly without requiring any changes to the pin diameter or hole size.",
    },
    {
      prompt: "How does **double shear** affect the allowable load of a pin compared to **single shear** with the same diameter and material?",
      options: [
        {
          text: "It doubles the allowable shear capacity because two cross-sections share the load ($P_{\\text{shear}} = 2 \\tau_{\\text{allow}} A_{\\text{pin}}$).",
          correct: true,
        },
        {
          text: "It cuts the allowable load in half because there are twice as many failure surfaces.",
          feedback: "Having two failure surfaces means the applied force is shared across two cross-sections, doubling capacity.",
        },
        {
          text: "It has no effect on shear capacity, only on bending resistance.",
          feedback: "Double shear provides two physical shear planes that both resist the applied force.",
        },
      ],
      explanation:
        "In double shear, the applied tension $P$ must slice across two distinct cross-sections of the pin simultaneously. " +
        "Therefore, each cross-section carries only $P / 2$, which doubles the total load the pin can carry: $P_{\\text{shear}} = 2 \\tau_{\\text{allow}} A_{\\text{pin}}$.",
    },
  ],
  hints: [
    "Weakest link: the smallest capacity governs.",
    "Factor of safety: $FS = \\text{Capacity} / \\text{Demand}$.",
    "Bearing area is $t \\cdot d$; shear area in double shear is $2 \\times (\\frac{\\pi}{4} d^2)$.",
  ],
  explanation:
    "Allowable stress design guarantees structural integrity by enforcing separate safety factors on tension, shear, and bearing. " +
    "Mastering the interaction among these limits allows structural engineers to design efficient, safe, and balanced connections.",
};
