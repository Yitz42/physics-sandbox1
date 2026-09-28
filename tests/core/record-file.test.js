// The learning-record file (export / import): it round-trips, keeps what it
// doesn't understand, survives renamed stages, and merges without doubles.
import { test, ok, equal, setFile } from "../harness.js";
import { buildRecordFile, readRecordFile, mergeEvents, mergeProgress, tagEvent, FORMAT, RecordFileError } from "../../src/core/record-file.js";
import { migrateEvent } from "../../src/core/migrations.js";

setFile("core / learning-record file");

const common = { tz: -240, sid: "s-test", av: "0.6.0", cv: "2026-09-27", c: "statics", u: "cables", s: "cables/2-predict", p: 0, v: null, ch: "predict", r: "r1" };
const events = [
  { e: "check", t: Date.UTC(2026, 8, 20, 10, 0, 0), ...common, q: "T_AB", ok: false, k: ["weight"], a: 1, ms: 42000, h: 0, chk: 1, fg: false, cf: null, sub: "42.4", exp: 416, un: "N", tol: 0.1, rp: { "forces.#W.mass": 42.4 } },
  { e: "check", t: Date.UTC(2026, 8, 20, 10, 1, 0), ...common, q: "T_AB", ok: true, k: [], a: 2, ms: 30000, h: 0, chk: 2, fg: false, cf: null, sub: "416", exp: 416, un: "N", tol: 0.1 },
];
const progress = { "statics/cables/2-predict": { status: "complete", updated: "2026-09-20T10:01:00.000Z" } };
const catalog = [{ id: "statics", title: "Statics", units: [{ id: "cables", title: "Cables", number: "2.1", chapter: "Equilibrium of a particle",
  stages: [{ id: "cables/2-predict", file: "2-predict", title: "Predict the Tensions", challenge: "predict", parts: [] }] }] }];

test("an exported file names its format, is anonymous, and spells out every field", () => {
  const f = buildRecordFile({ events, progress, catalog, kinds: { trig: { area: "math", label: "sin/cos" } }, recordId: "rec-x" });
  equal(f.format, FORMAT);
  equal(f.encoding, "none");
  equal(f.recordId, "rec-x");
  equal(f.formatVersion, 2);
  equal(Object.keys(f.events[0]).sort(), ["eventType", "time", "tzOffsetMin", "sessionId", "appVersion", "contentVersion", "course", "unit", "stage", "part", "situation", "challenge", "round",
    "question", "correct", "mistakeKinds", "attempt", "activeMs", "hiddenMs", "checkPress", "fastGuess", "confidence", "submitted", "expected", "units", "tolerance", "roundParams"].sort());
  equal(f.events[0].time, "2026-09-20T10:00:00.000Z");
  equal([f.events[0].submitted, f.events[0].expected, f.events[0].mistakeKinds], ["42.4", 416, ["weight"]]);
  ok(f.dictionaries.eventFields.every((d) => d.name && d.about), "every field is explained");
  ok(f.dictionaries.eventTypes.length === 9 && /* (9th: guess — an explore prediction) */ f.dictionaries.eventTypes.every((d) => d.name && d.about), "every event type is explained");
  ok(/previous check/.test(f.dictionaries.timing), "the timing is defined");
  equal(f.progress, [{ course: "statics", stage: "cables/2-predict", status: "complete", updated: "2026-09-20T10:01:00.000Z" }]);
});

test("export → JSON text → import gives back exactly the same record", () => {
  const text = JSON.stringify(buildRecordFile({ events, progress, catalog, recordId: "rec-x" }));
  const got = readRecordFile(JSON.parse(text), catalog);
  equal(got.events, events.map(migrateEvent));
  equal(got.progress, progress);
  equal(got.warnings, []);
});

test("fields it doesn't know are kept, both ways", () => {
  // A stored event with a key this version doesn't name travels under "other" …
  const tagged = tagEvent({ ...events[0], zz: 7 });
  equal(tagged.other, { zz: 7 });
  // … and a file field from a newer game is kept on the event.
  const f = buildRecordFile({ events, catalog });
  f.formatVersion = 99;
  f.events[0].pupilDilation = "high";
  const got = readRecordFile(f, catalog);
  equal(got.events[0].pupilDilation, "high");
  ok(/newer version/.test(got.warnings[0]));
});

test("a stage renamed since the export is matched up again by its title", () => {
  const f = buildRecordFile({ events, progress, catalog });
  const today = [{ id: "statics", title: "Statics", units: [{ id: "cable-tension", title: "Cables", stages: [{ id: "cable-tension/2-predict", title: "Predict the Tensions", challenge: "predict" }] }] }];
  const got = readRecordFile(f, today);
  equal(got.events.map((e) => [e.u, e.s]), [["cable-tension", "cable-tension/2-predict"], ["cable-tension", "cable-tension/2-predict"]]);
  ok(got.progress["statics/cable-tension/2-predict"], "progress moves with it");
  ok(/renamed or moved/.test(got.warnings[0]));
});

test("files that aren't learning records, or are encrypted, are refused with a clear message", () => {
  let e1 = null, e2 = null;
  try { readRecordFile({ hello: 1 }); } catch (err) { e1 = err; }
  try { readRecordFile({ ...buildRecordFile({}), encoding: "aes-gcm" }); } catch (err) { e2 = err; }
  ok(e1 instanceof RecordFileError && /isn't a learning record/.test(e1.message));
  ok(e2 instanceof RecordFileError && /can't open it yet/.test(e2.message));
});

test("merging: the same answers aren't added twice; the better stage status wins", () => {
  const m = mergeEvents([events[0]], events);
  equal(m.added, 1);
  equal(m.events.length, 2);
  const p = mergeProgress({ "statics/a": { status: "practice", partsDone: 2 } }, { "statics/a": { status: "complete", partsDone: 1 }, "statics/b": { status: "none" } });
  equal(p["statics/a"].status, "complete");
  equal(p["statics/a"].partsDone, 2);
  ok(p["statics/b"], "new stages are added");
  equal(mergeProgress({ "statics/a": { status: "complete" } }, { "statics/a": { status: "practice" } })["statics/a"].status, "complete");
});

test("a format-1 record still loads: old ids migrated, event types inferred, missing fields null", () => {
  const v1 = {
    format: FORMAT, formatVersion: 1, encoding: "none", recordId: "rec-old",
    game: { courses: [] },
    progress: [
      { course: "statics", stage: "02-particle-equilibrium/2-predict", status: "practice", updated: "2026-09-20T10:00:00.000Z" },
      { course: "statics", stage: "cables/2-predict", status: "complete", updated: "2026-09-21T10:00:00.000Z" },
      { course: "statics", stage: "03-moments/1-explore", status: "complete", partsDone: 0 },
    ],
    events: [
      { time: "2026-09-20T10:00:00.000Z", course: "statics", unit: "02-particle-equilibrium", stage: "02-particle-equilibrium/2-predict", situation: "", challenge: "predict", round: "r0", question: "T_AB", correct: false, mistakeKinds: [] },
      { time: "2026-09-20T10:02:00.000Z", course: "statics", unit: "02-particle-equilibrium", stage: "02-particle-equilibrium/2-predict", challenge: "predict", round: "r0", question: "*", answerShown: true, activeMs: 5000 },
    ],
  };
  const got = readRecordFile(v1, catalog);
  equal(got.events.map((e) => [e.e, e.s, e.u, e.v]), [["check", "cables/2-predict", "cables", null], ["showAnswer", "cables/2-predict", "cables", null]]);
  equal([got.events[0].a, got.events[0].ms, got.events[0].h, got.events[0].chk], [null, null, null, null]);
  equal(Object.keys(got.progress).sort(), ["statics/cables/2-predict", "statics/moments/1-explore"]);
  equal(got.progress["statics/cables/2-predict"].status, "complete", "the two entries merged: the better status");
  equal(got.progress["statics/cables/2-predict"].updated, "2026-09-21T10:00:00.000Z");
  // Exported again: no old ids, no "" situations, no partsDone on a stage without parts.
  const file = buildRecordFile({ events: got.events, progress: got.progress, catalog });
  const again = JSON.stringify(file);
  ok(!/0\d-[a-z-]+\//.test(again), "no old-style ids");
  ok(!/"situation":""/.test(again), "no empty situations");
  ok(file.progress.every((p) => !("partsDone" in p)), "no partsDone");
  ok(/"submitted":null/.test(again), "missing answer fields are null");
});

test("partsDone is only exported for stages with parts", () => {
  const cat = [{ id: "statics", units: [{ id: "u", stages: [{ id: "u/1-a", parts: ["one", "two"] }, { id: "u/2-b", parts: [] }] }] }];
  const f = buildRecordFile({ progress: { "statics/u/1-a": { status: "started", partsDone: 1 }, "statics/u/2-b": { status: "complete", partsDone: 1 } }, catalog: cat });
  equal(f.progress.map((p) => p.partsDone), [1, undefined]);
});
