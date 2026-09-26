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
    comingSoon: true,
  },
  {
    id: "dynamics",
    title: "Dynamics",
    subject: "dynamics",
    description: "Motion, Newton's second law, energy and momentum.",
    comingSoon: true,
  },
];
