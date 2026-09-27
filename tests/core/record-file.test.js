// The learning-record file (export / import): it round-trips, keeps what it
// doesn't understand, survives renamed stages, and merges without doubles.
import { test, ok, equal, setFile } from "../harness.js";
import { buildRecordFile, readRecordFile, mergeEvents, mergeProgress, tagEvent, FORMAT, RecordFileError } from "../../src/core/record-file.js";

setFile("core / learning-record file");

const events = [
  { t: Date.UTC(2026, 8, 20, 10, 0, 0), c: "statics", u: "cables", s: "cables/2-predict", p: 0, ch: "predict", r: "r1", q: "T_AB", ok: false, k: ["trig"], a: 1, ms: 42000, h: 0, chk: 1 },
  { t: Date.UTC(2026, 8, 20, 10, 1, 0), c: "statics", u: "cables", s: "cables/2-predict", p: 0, ch: "predict", r: "r1", q: "T_AB", ok: true, k: [], a: 2, ms: 30000, h: 0, chk: 2 },
];
const progress = { "statics/cables/2-predict": { status: "complete", updated: "2026-09-20T10:01:00.000Z" } };
const catalog = [{ id: "statics", title: "Statics", units: [{ id: "cables", title: "Cables", number: "2.1", chapter: "Equilibrium of a particle",
  stages: [{ id: "cables/2-predict", file: "2-predict", title: "Predict the Tensions", challenge: "predict", parts: [] }] }] }];

test("an exported file names its format, is anonymous, and spells out every field", () => {
  const f = buildRecordFile({ events, progress, catalog, kinds: { trig: { area: "math", label: "sin/cos" } }, recordId: "rec-x" });
  equal(f.format, FORMAT);
  equal(f.encoding, "none");
  equal(f.recordId, "rec-x");
  equal(Object.keys(f.events[0]).sort(), ["activeMs", "attempt", "challenge", "checkPress", "correct", "course", "hiddenMs", "mistakeKinds", "part", "question", "round", "stage", "time", "unit"].sort());
  equal(f.events[0].time, "2026-09-20T10:00:00.000Z");
  ok(f.dictionaries.eventFields.every((d) => d.name && d.about), "every field is explained");
  equal(f.progress, [{ course: "statics", stage: "cables/2-predict", status: "complete", updated: "2026-09-20T10:01:00.000Z" }]);
});

test("export → JSON text → import gives back exactly the same record", () => {
  const text = JSON.stringify(buildRecordFile({ events, progress, catalog, recordId: "rec-x" }));
  const got = readRecordFile(JSON.parse(text), catalog);
  equal(got.events, events);
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
  f.events[0].confidence = "high";
  const got = readRecordFile(f, catalog);
  equal(got.events[0].confidence, "high");
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
