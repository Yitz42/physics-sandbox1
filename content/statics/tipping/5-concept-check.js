// Unit 9.2, stage 5 — concept check: tipping versus slipping.

export default {
  id: "tipping/5-concept-check",
  challenge: "concept-check",
  title: "Tip or Slip?",
  mission: "Show you understand when things tip and when they slide.",
  instructions: "Answer 3 questions. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "A crate is pushed but doesn't move. As the push grows, the floor's push N on it…",
      options: [
        { text: "moves toward the front corner O", correct: true },
        { text: "stays under the centre of the crate", feedback: "Only with no push. The push turns the crate forward about O; N must move forward to balance that." },
        { text: "gets bigger", feedback: "A level push has no up-or-down part: N stays equal to W. What changes is WHERE it acts." },
        { text: "moves toward the back, where you push", feedback: "The push tries to tip the crate forward, over O. N moves forward to hold it back." },
      ],
      explanation: "N's position comes from ΣM = 0. The bigger the push's moment, the further forward N must act — up to the corner O.",
    },
    {
      prompt: "To slide a tall bookcase without tipping it over, you should push…",
      options: [
        { text: "low down, near the floor", correct: true },
        { text: "high up, near the top", feedback: "High up, your push has a big arm about O: the bookcase tips before friction gives way." },
        { text: "anywhere — only the size of the push matters", feedback: "The size decides slipping ($\\mu_s W$), but the HEIGHT decides tipping ($P h_P = W w/2$)." },
        { text: "at the centre, to push through the centre of gravity", feedback: "Even through the centre, the push has an arm about O (half the height). It tips first if $h/2 > w/(2\\mu_s)$." },
      ],
      explanation: "It slides first when the tipping push $W w/(2h_P)$ is bigger than $\\mu_s W$, that is when $h_P < w/(2\\mu_s)$.",
    },
    {
      prompt: "When a crate is just about to tip over its corner O, where does the floor's push N act?",
      options: [
        { text: "right at the corner O", correct: true },
        { text: "under the centre of gravity", feedback: "That's with no push at all. Tipping begins when N has been pushed all the way to the edge." },
        { text: "it's zero", feedback: "N still carries the whole weight (for a level push). It's just that it's all at the corner." },
        { text: "halfway between the centre and O", feedback: "N can move right up to the edge of the base. Only past O is it impossible — that's when it tips." },
      ],
      explanation: "At impending tipping, N and friction both act at O — so moments about O leave only the push and the weight.",
    },
    {
      prompt: "Does the push needed to TIP a crate depend on the friction coefficient $\\mu_s$?",
      options: [
        { text: "No — friction acts at O, so it has no moment about O", correct: true },
        { text: "Yes — more friction makes it harder to tip", feedback: "Friction acts along the floor, through O: it has no arm about O. (Though it must be big enough that the crate doesn't slip first.)" },
        { text: "Yes — the tipping push is $\\mu_s W$", feedback: "$\\mu_s W$ is the SLIPPING push. Tipping comes from moments: $P h_P = W\\,w/2$." },
        { text: "Only on a ramp", feedback: "On a ramp too, friction acts along the surface through O and drops out of $\\Sigma M_O$." },
      ],
      explanation: "The tipping push comes only from moments about O. Friction decides whether the crate slips first.",
    },
    {
      prompt: "A box sits on a truck bed that tilts up slowly. It will TIP before it slides if…",
      options: [
        { text: "$w/h < \\mu_s$ (it's tall and narrow, on a grippy bed)", correct: true },
        { text: "$w/h > \\mu_s$", feedback: "That's a squat box: its weight's line stays inside the base until the bed is steep, so it slides first." },
        { text: "it's heavy", feedback: "The weight cancels from both: it slides at $\\tan\\theta = \\mu_s$ and tips at $\\tan\\theta = w/h$." },
        { text: "never — boxes on slopes always slide", feedback: "A tall box tips once the vertical line through its centre passes the lower corner: at $\\tan\\theta = w/h$." },
      ],
      explanation: "It slides at $\\tan\\theta = \\mu_s$ and tips at $\\tan\\theta = w/h$ — whichever angle is smaller comes first.",
    },
  ],
};
