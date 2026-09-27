# Stage files, parts, situations and the lesson library
```js
export default {
  id: "03-moments/2-predict",
  challenge: "predict",          // one of the challenge types
  solver: "statics.rigidBody",   // solver registered by the subject
  title: "Balance the Seesaw",
  mission: "Predict where child B must sit to balance the seesaw.", // one line, shown as MISSION:
  instructions: "Plain-language instructions shown to the student.",
  setup: { bodies: [...], supports: [...], loads: [...] },
  editable: ["loads.0.position"],
  ask: { quantity: "supports.0.Ry", units: "N", precision: 0.1 }, // predict/solve; ±0.1 is the default
  goal: null,                    // used by build challenges; goal.predict: numbers the student
                                 // must work out for their own design before each Test
  hints: ["First hint", "Second hint"],
  explanation: "Shown after completion: why the answer is what it is.",
  tallPicture: true,             // optional: a taller picture, for drawings stacked one above
                                 // another (a beam with its shear and moment diagrams, Unit 7)
};
```

A stage can be split into **parts** that run in order ("Part 2 of 3: …"):
`{ id, challenge, title, solver, explanation, parts: [ {...}, {...} ] }`. Each part
is written like a whole stage (title, instructions, setup, vary, ask, hints,
explanation…) and takes the stage's id, challenge type, title and (by default)
solver. The part reached is saved; the stage is complete after the last part.
`vary` rules apply in order; `{ paths: [a, b], values }` puts one value at several paths.

A stage (or part) can also give several **situations**: the same idea in different
settings, each with its own picture (a crate on two cables, a traffic light between
poles, a balloon held down by tethers …):
`{ id, challenge, title, solver, ask, explanation, situations: [ { name, instructions, setup, vary, hints, … }, … ] }`.
Each situation replaces the stage fields it sets. Every new version plays a
different situation (all are seen before any repeats), then new numbers from its `vary`.

**The lesson library** (agreed with the owner: variations written once, shared by
any unit or chapter, trimmed or changed to fit each question). Situations live in
`content/<course>/library/*.js` as scenarios (src/core/library.js):
`scenario({ name, story, setup, vary, view?, questions: { kind: { instruction, ask, hints, solve?, vary? … } } })`.
A stage takes them with `situations: [crate, balloon].map((s) => use(s, "tensions"))`
(story + the question's instruction become the instructions; the stage's own
fields win: `use(s, "tensions", { hints })`). `edit(s, { name, story, remove:
["loads.#w"], set: { path: v }, fix: [paths], add: { forces: [...] }, vary,
questions: { kind: {…} | null } })` makes a new variation from an old picture
(what's removed takes its vary rules with it, so library vary paths name items
by id). New situations should go in the library, not inline in a stage, so other
stages can use them. Hand checks go at the top of the library file; unusual
ones also get a test (tests/core/library.test.js).
