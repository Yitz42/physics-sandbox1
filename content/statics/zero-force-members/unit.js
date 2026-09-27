// Unit 6.2 — Zero-force members: spot, before solving, the members that carry nothing.
export default {
  title: "Zero-force members",
  concept: "Some truss members carry no force at all under a given load — and you can often see which **before** solving. At a joint with no load and no support: if only two members meet there, not in line, **both** are zero; if three meet and two are in line, the **third** is zero. (In general: if every force at a joint but one lies along one line, the odd one is zero.) Finding them first leaves fewer unknowns. They're still needed: they keep the truss stable, and carry force when the load moves.",
  goals: [
    "Spot zero-force members by inspection with the two joint rules.",
    "Check that a joint has no load or support across the line before using a rule.",
    "Look again after finding one: ignoring a zero member can reveal the next.",
    "Explain why zero-force members are still part of the truss.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
