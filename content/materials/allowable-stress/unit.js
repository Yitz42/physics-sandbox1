// Unit 1.4: Allowable Stress and Factor of Safety.
export default {
  title: "Allowable Stress and Factor of Safety",
  concept: "Real structures are designed with a factor of safety $FS = \\sigma_{\\text{fail}} / \\sigma_{\\text{allow}}$. Connections must safely withstand all potential failure modes simultaneously: rod tension, pin shear, and hole bearing. The lowest capacity governs the maximum allowable load $P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})$.",
  goals: [
    "Apply factor of safety $FS = \\sigma_{\\text{fail}} / \\sigma_{\\text{allow}}$ to establish allowable design limits.",
    "Calculate individual load capacities for tension, pin shear, and plate bearing.",
    "Determine which failure mode governs the overall connection capacity.",
    "Size pins, plates, and rods to safely support a specified applied load.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
