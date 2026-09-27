// reading.js — the textbook students read alongside the Automatic Controls course.
//
// The course follows the class textbook, Nise's "Control Systems Engineering"
// (7th edition). It isn't free, so there is no link to it: each chapter just
// names the chapter to read in the student's own copy. A free, open book is
// linked as an alternative for anyone without it. (Only ever link to an
// official or openly licensed copy of a book.)
//
// To follow a different textbook: change `book` and the chapter for each course
// chapter below. Nothing else in the game needs to change.
export default {
  book: {
    title: "Control Systems Engineering, 7th edition",
    authors: "Norman S. Nise",
    url: null, // not free online: students use their own copy
    free: { title: "Control Systems (Wikibooks)", url: "https://en.wikibooks.org/wiki/Control_Systems" },
  },
  // Each chapter of the course, and the textbook chapter to read with it.
  chapters: {
    introduction: { chapter: "Chapter 1: Introduction" },
    "frequency-modeling": { chapter: "Chapter 2: Modeling in the Frequency Domain" },
    "time-modeling": { chapter: "Chapter 3: Modeling in the Time Domain" },
    "time-response": { chapter: "Chapter 4: Time Response" },
    reduction: { chapter: "Chapter 5: Reduction of Multiple Subsystems" },
    stability: { chapter: "Chapter 6: Stability" },
    "steady-state": { chapter: "Chapter 7: Steady-State Errors" },
    "root-locus": { chapter: "Chapter 8: Root Locus Techniques" },
    "root-locus-design": { chapter: "Chapter 9: Design via Root Locus" },
    "frequency-response": { chapter: "Chapter 10: Frequency Response Techniques" },
    "frequency-design": { chapter: "Chapter 11: Design via Frequency Response" },
    "state-design": { chapter: "Chapter 12: Design via State Space" },
    digital: { chapter: "Chapter 13: Digital Control Systems" },
  },
};
