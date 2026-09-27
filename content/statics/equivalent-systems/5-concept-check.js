// Equivalent systems, stage 5 — concept check: what "equivalent" means.

export default {
  id: "equivalent-systems/5-concept-check",
  challenge: "concept-check",
  solver: "statics.equivalent",
  title: "Equivalent or Not?",
  mission: "Show you know when two force systems are equivalent.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "Two force systems act on the same rigid body. When are they **equivalent**?",
      options: [
        { text: "When they have the same resultant force and the same moment about any one point", correct: true },
        { text: "When they have the same resultant force", feedback: "Same push, but they could turn the body differently. The moments must match too." },
        { text: "When they have the same number of forces", feedback: "One force can be equivalent to many — that's the whole idea of a resultant." },
        { text: "When their forces act at the same points", feedback: "Equivalent systems can act at completely different points, as long as $F_R$ and the moment match." },
      ],
      explanation: "Equivalent systems push the same ($F_R$) and turn the same (moment about a point). Then they have the same effect on a rigid body.",
    },
    {
      prompt: "You move a force $F$ from point A to point O, a distance $d$ away (measured perpendicular to $F$). What must you add so nothing changes?",
      options: [
        { text: "A couple moment $M = Fd$", correct: true },
        { text: "Nothing: a force can slide anywhere", feedback: "A force can slide ALONG its line of action. Moving it sideways changes its moment, so a couple must make up the difference." },
        { text: "A second force $F$ at A", feedback: "That would double the push. The missing piece is the turning effect, $Fd$." },
        { text: "A couple moment $M = F/d$", feedback: "A moment is force TIMES distance: $M = Fd$." },
      ],
      explanation: "Moving $F$ sideways by $d$ changes its moment about any point by $Fd$, so a couple $M = Fd$ is added to keep the same effect.",
    },
    {
      prompt: "Three loads of 100 N, 100 N and 400 N push down on a beam. Where does their single resultant act?",
      options: [
        { text: "Closer to the 400 N load", correct: true },
        { text: "Exactly in the middle of the three loads", feedback: "That would be the plain average of the positions. Bigger loads count more: $\\bar{x} = \\Sigma F x / \\Sigma F$." },
        { text: "Right under the 400 N load", feedback: "Only if the other loads were zero (or at the same spot). The smaller loads pull it a little toward them." },
        { text: "At the end of the beam", feedback: "The resultant sits somewhere between the loads — a weighted average of their positions." },
      ],
      explanation: "The resultant is a weighted average of the positions, so it lies nearer the biggest load.",
    },
    {
      prompt: "The forces on a body add up to $F_R = 0$, but their moment about O is 50 N·m. What single thing can replace them?",
      options: [
        { text: "A 50 N·m couple", correct: true },
        { text: "A single force at the right spot", feedback: "A single force would push the body. Here the forces cancel, so only a turning effect remains — a couple." },
        { text: "Nothing: the system has no effect", feedback: "No push, but it still turns the body with 50 N·m." },
        { text: "A 50 N force", feedback: "$F_R = 0$, so there's no net force. 50 N·m is a moment." },
      ],
      explanation: "With $F_R = 0$, the system reduces to a pure couple — and a couple has the same moment about every point.",
    },
    {
      prompt: "The resultant force $F_R$ of a system is the same whichever point you move it to. What about the resultant moment?",
      options: [
        { text: "It depends on the point", correct: true },
        { text: "It's the same for every point", feedback: "Only for a pure couple ($F_R = 0$). Otherwise moving to a different point changes $(M_R)$ by $F_R$ times the shift." },
        { text: "It's always zero", feedback: "Only at special points — the ones on the line where the single resultant acts." },
        { text: "It's equal to $F_R$", feedback: "A moment (N·m) can't equal a force (N)." },
      ],
      explanation: "$(M_R)_O$ depends on O, because each force's moment arm depends on O. $F_R$ doesn't.",
    },
    {
      prompt: "When can a force $F_R$ plus a couple $(M_R)_O$ in the same plane be replaced by ONE force?",
      options: [
        { text: "Whenever $F_R \\ne 0$: move it a distance $d = (M_R)_O / F_R$", correct: true },
        { text: "Never: a couple can't be removed", feedback: "Sliding $F_R$ sideways adds a moment $F_R d$. Choose $d$ so it matches $(M_R)_O$, and the couple disappears." },
        { text: "Only when $(M_R)_O = 0$", feedback: "Then it's already a single force at O. With a moment, you just move $F_R$ over." },
        { text: "Only when all the forces are parallel", feedback: "In a plane it works for any forces, as long as $F_R \\ne 0$." },
      ],
      explanation: "Placing $F_R$ at distance $d = (M_R)_O / F_R$ from O gives it exactly the moment $(M_R)_O$, so the couple is no longer needed.",
    },
  ],
  hints: ["Equivalent means: same push ($F_R$) and same turning (moment about a point)."],
  explanation: "An equivalent system has the same resultant force and the same moment about a point as the original, so it has the same effect on a rigid body.",
};
