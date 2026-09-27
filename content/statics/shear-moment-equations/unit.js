// Unit 7.3 — V(x) and M(x) equations: the shear and bending moment written as equations,
// one pair for each segment of the beam.
export default {
  title: "V(x) and M(x) equations",
  concept: "Between two \"events\" (an end, a support, a point load, a couple, where a distributed load starts or stops) the shear and moment follow one formula each. Cut the beam at a general point x in that **segment**, keep the left piece, and its equations give $V(x)$ and $M(x)$: every force on the piece counts, each with its own arm — a force at $x = a$ has arm $(x - a)$, a uniform load on the piece, $w(x - a)$, acts at its middle, so its moment is $w\\,\\tfrac{(x-a)^2}{2}$. Each new segment needs new equations, because a new force joins the piece.",
  goals: [
    "Split a beam into segments at its events.",
    "Write $V(x)$ and $M(x)$ for each segment from a cut at a general x.",
    "Measure each force's arm from where it acts: $(x - a)$.",
    "Check that the equations agree where segments meet, and with $dM/dx = V$.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
