// Moving a force, stage 5 — concept check. 3 correct answers finish it.

export default {
  id: "moving-forces/5-concept-check",
  challenge: "concept-check",
  solver: "statics.equivalent",
  title: "Moving a Force",
  mission: "Show you know what must be added when a force is moved.",
  instructions: "Answer 3 questions about moving a force to a new point. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "You slide a force $F$ along its own line of action, from A to B. What couple must you add to keep the same effect?",
      options: [
        { text: "None", correct: true },
        { text: "$M = F \\times AB$", feedback: "Sliding ALONG the line of action doesn't change the moment arm about any point, so nothing is lost (the principle of transmissibility)." },
        { text: "It depends on where O is", feedback: "For any point O, the perpendicular distance to the line is unchanged — the line hasn't moved." },
        { text: "A second force at A", feedback: "The force is the same; only its point moved along its own line. That changes nothing on a rigid body." },
      ],
      explanation: "Transmissibility: a force may slide along its line of action. A couple is only needed when the line itself is moved sideways.",
    },
    {
      prompt: "A 200 N force pushes straight down on the end of a 0.5 m wrench (horizontal). Replace it with a force-couple system at the bolt. What is it?",
      options: [
        { text: "200 N down, plus a 100 N·m clockwise couple", correct: true },
        { text: "200 N down only", feedback: "At the bolt the force has no moment arm, so the turning effect would be lost. Add the couple $M = Fd = 200(0.5)$." },
        { text: "100 N·m clockwise only", feedback: "The couple keeps the turning effect, but the push must move too: $F_R = 200$ N down." },
        { text: "200 N down, plus a 400 N·m clockwise couple", feedback: "That's $F/d$. A moment is force times distance: $200 \\times 0.5 = 100$ N·m." },
      ],
      explanation: "$F_R = 200$ N down and $M = Fd = 200(0.5) = 100$ N·m, clockwise (the way the force turned the wrench about the bolt).",
    },
    {
      prompt: "A force is moved to point O with its couple $M_O$. Then you move the same force to a different point P instead. The couple you need there…",
      options: [
        { text: "is the force's moment about P, which is usually different", correct: true },
        { text: "is the same $M_O$", feedback: "A couple's moment is the same about every point, but the force's moment is not: the distance from P to its line of action is different." },
        { text: "is zero", feedback: "Only if P lies on the force's line of action." },
        { text: "is $M_O$ plus $F$", feedback: "Moments and forces can't be added: they have different units (N·m and N)." },
      ],
      explanation: "The couple you add always equals the original force's moment about the NEW point. Change the point, change the couple.",
    },
    {
      prompt: "Why do engineers often move all the loads to a support point, as a force plus a couple?",
      options: [
        { text: "Because that's exactly what the support must resist: a push and a twist", correct: true },
        { text: "Because it makes the loads smaller", feedback: "The force is unchanged and the couple is added: nothing gets smaller. It's the same effect, described at the support." },
        { text: "Because couples are easier to draw", feedback: "The reason is physical: a bolt or weld at O has to hold both the force and the moment." },
        { text: "Because forces can't act away from supports", feedback: "Forces act wherever they're applied. Moving them is a way to see their total effect at one point." },
      ],
      explanation: "The force-couple system at a support tells you what that support must hold: the force $F_R$ and the moment $(M_R)_O$ that would otherwise twist the body.",
    },
  ],
  hints: ["Moving a force sideways by $d$ needs a couple $M = Fd$; sliding it along its own line needs nothing."],
  explanation: "A force can be moved to any point if you add a couple equal to its moment about that point. That's how any system is reduced to a force-couple system.",
};
