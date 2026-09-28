# The learning record

What the game quietly records about every answer, how it is scored, and the file format.
Read this before changing src/core/evidence.js, record-file.js, migrations.js, classify.js, diagnosis.js, comprehension.js or pace.js, or renaming a unit or stage.

- **Learning data** (agreed with the owner): the home page's "Learning data" panel
  exports everything this browser gathered (finished stages + every checked answer,
  with timing and mistake kinds) as ONE anonymous JSON file, and imports such a
  file by ADDING it (nothing is deleted, doubles are skipped). For now it's for the
  programmer; later, for teachers and students, files may be shrunk and encrypted.
  The format (src/core/record-file.js) must stay readable as the game changes:
  spelled-out field names with a dictionary, a format name + version, an
  `encoding` field ("none" for now), a snapshot of every course/unit/stage with
  titles (renamed stages are matched by title on import), and unknown fields are
  always kept. Change the format only by adding fields or raising the version.
- **Learning record, format 2** (owner's spec, 2026-09-27): every event has a type
  (stageStart, stageLeave, check, showAnswer, hint, exploreAction, complete,
  confidence, guess — an explore-stage prediction, recorded but never scored), a random session id, app/content versions (src/core/version.js)
  and the time-zone offset. Checks store what was typed, the right value, units,
  tolerance and the round's `vary` numbers; FBD checks store the arrows drawn and
  expected; debug / concept-check / build store what was flagged, picked or
  designed. activeMs = time since the previous check in the round (or since the
  round started). Explore logs ONE summary per round, never every slider step.
  Storage is capped (5,000 events; oldest explore summaries go first).
  Privacy: no names, emails, account ids, IPs or device fingerprints; the only
  free text is what students type into answer boxes.
- **Renaming a unit or stage**: add the old → new id to src/core/migrations.js
  (and bump CONTENT_VERSION in version.js). Saved progress, stored events and
  imported files are all translated there; old ids must never reach an export.
- **Mistake rules** (src/core/classify.js): after a solver's own slips, a wrong
  number is tested for sign, weight (×/÷ 9.81), sin/cos swap, radians and
  rounding (within 2%) before it counts as unexplained. The first check within
  8 s of a round starting is flagged as a fast guess. The "Sure / Not sure"
  tap (src/ui/confidence.js) is built but off until the owner switches it on.
- **Comprehension, not just completion**: students complete stages and units as
  usual; in the background every answer is recorded (core/evidence.js) and scored
  per unit, chapter and course (core/comprehension.js), shown in the Comprehension
  window on the Courses page (#/comprehension/<course>). Every mistake the game
  recognises names a kind (core/diagnosis.js) in one of three areas: **math errors**
  (signs, sin/cos, algebra, rounding, vectors), **object errors** (reading the
  picture: missed or extra force, wrong direction) and **physics errors** (a
  principle: W = mg, cables only pull, perpendicular moment arm, pulley tension,
  concept questions; in controls the block and loop rules). New mistakes in solvers,
  palettes, choices and debug steps must carry a `kind` — a test checks it.
- **Timing** (core/pace.js): every try is timed (only while the page is visible;
  time on other tabs is kept separately) and compared with an expected time
  (60 s per number, 60 s per FBD, 25 s per concept question …; a stage may set
  `expectedTime`) and with the student's own usual pace. Signals, never proof:
  very fast and right (outside help / AI?), rushing (fast and wrong — "lazy"),
  much slower than expected (struggling), left the page and came back right,
  much faster / slower than their usual pace (someone else doing the work?).
  Scoring (first proposal, owner may change): right first time 1, after one slip
  0.6, after more 0.3, with "Show answer" 0; a unit averages its 20 latest questions.
