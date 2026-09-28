// courses.js — every course shown on the home page.
// `subject` names the folder in src/subjects/ that provides the solvers.
export default [
  {
    id: "statics",
    title: "Statics",
    subject: "statics",
    description: "Forces, moments and equilibrium: why structures stand still.",
  },
  {
    id: "materials",
    title: "Mechanics of Materials",
    subject: "materials",
    description: "Stress, strain, Mohr's circle and beam stresses.",
  },
  {
    id: "dynamics",
    title: "Dynamics",
    subject: "dynamics",
    description: "Motion, Newton's second law, energy and momentum.",
    comingSoon: true,
  },
  {
    id: "controls",
    title: "Automatic Controls",
    subject: "controls",
    description: "Feedback, transfer functions, stability, root locus, Bode plots and PID control: making systems do what you want.",
  },
];
