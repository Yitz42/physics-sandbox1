// reading.js — the textbook students can read alongside the game.
//
// Each chapter (on the course page) and each unit page shows a "Read more"
// link to the matching textbook chapter. We only LINK to the book (nothing is
// copied into the game), so its licence places no limits on how the game is used.
//
// To switch to a different book: change `book`, and the textbook chapter for
// each course chapter below. Nothing else in the game needs to change.
export default {
  book: {
    title: "Engineering Statics: Open and Interactive",
    authors: "Daniel Baker and William Haynes",
    url: "https://engineeringstatics.org",
  },
  // Each chapter of the course, and the textbook chapter to read with it.
  // (A chapter may give its own `url`; otherwise the link goes to the book.)
  chapters: {
    forces: { chapter: "Chapter 2: Forces and Other Vectors" },
    particles: { chapter: "Chapter 3: Equilibrium of Particles" },
    moments: { chapter: "Chapter 4: Moments and Static Equivalence" },
    "rigid-bodies": { chapter: "Chapter 5: Rigid Body Equilibrium" },
    structures: { chapter: "Chapter 6: Equilibrium of Structures" },
    centroids: { chapter: "Chapter 7: Centroids and Centers of Gravity" },
    "internal-forces": { chapter: "Chapter 8: Internal Loadings" },
    friction: { chapter: "Chapter 9: Friction" },
    inertia: { chapter: "Chapter 10: Moments of Inertia" },
  },
};
