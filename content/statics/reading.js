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
  // Each links straight to its chapter: https://engineeringstatics.org/Chapter_02.html …
  chapters: {
    forces: { chapter: "Chapter 2: Forces and Other Vectors", url: "https://engineeringstatics.org/Chapter_02.html" },
    particles: { chapter: "Chapter 3: Equilibrium of Particles", url: "https://engineeringstatics.org/Chapter_03.html" },
    moments: { chapter: "Chapter 4: Moments and Static Equivalence", url: "https://engineeringstatics.org/Chapter_04.html" },
    "rigid-bodies": { chapter: "Chapter 5: Rigid Body Equilibrium", url: "https://engineeringstatics.org/Chapter_05.html" },
    structures: { chapter: "Chapter 6: Equilibrium of Structures", url: "https://engineeringstatics.org/Chapter_06.html" },
    centroids: { chapter: "Chapter 7: Centroids and Centers of Gravity", url: "https://engineeringstatics.org/Chapter_07.html" },
    "internal-forces": { chapter: "Chapter 8: Internal Loadings", url: "https://engineeringstatics.org/Chapter_08.html" },
    friction: { chapter: "Chapter 9: Friction", url: "https://engineeringstatics.org/Chapter_09.html" },
    inertia: { chapter: "Chapter 10: Moments of Inertia", url: "https://engineeringstatics.org/Chapter_10.html" },
  },
};
