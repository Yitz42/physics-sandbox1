// Comprehension: scoring the quiet record of answers (src/core/comprehension.js)
// and naming the kind of each mistake (src/core/diagnosis.js).
// Every score here is worked out by hand from the rules at the top of
// comprehension.js: 1 right first time, 0.6 after one wrong try, 0.3 after
// two or more, 0 with "Show answer"; a unit = the average of its questions.
import { test, ok, equal, setFile } from "../harness.js";
import { questionScores, mistakeBreakdown, unitComprehension, courseComprehension, levelOf } from "../../src/core/comprehension.js";
import { errorKind, registerErrorKinds, isKnownKind } from "../../src/core/diagnosis.js";

setFile("core / comprehension");

// A little record: unit "cables", three versions (rounds a, b, c) and one in "springs".
const ev = (r, q, ok, k = [], extra = {}) => ({ c: "statics", u: "cables", s: "cables/2-predict", ch: "predict", v: "crate", r, q, ok, k, ...extra });
const record = [
  // Round a: T_AB right first time (1); T_AC wrong (sin/cos) then right (0.6).
  ev("a", "T_AB", true),
  ev("a", "T_AC", false, ["trig"]),
  ev("a", "T_AC", true),
  // Round b (traffic light): T_AB wrong twice (sign, then a missed force), then right (0.3);
  // T_AC never right, answer shown (0).
  ev("b", "T_AB", false, ["sign"], { v: "traffic light" }),
  ev("b", "T_AB", false, ["missing"], { v: "traffic light" }),
  ev("b", "T_AB", true, [], { v: "traffic light" }),
  ev("b", "T_AC", false, ["trig"], { v: "traffic light" }),
  { c: "statics", u: "cables", s: "cables/2-predict", ch: "predict", v: "traffic light", r: "b", q: "*", shown: true },
  // Round c: an FBD in a solve stage, right first time (1); a build design (not scored).
  ev("c", "fbd", true, [], { s: "cables/6-solve", ch: "solve", v: "balloon" }),
  ev("c", "design", false, [], { s: "cables/3-build", ch: "build" }),
  // Another unit.
  { c: "statics", u: "springs", s: "springs/2-predict", ch: "predict", v: "", r: "d", q: "s", ok: false, k: ["algebra"] },
  { c: "statics", u: "springs", s: "springs/2-predict", ch: "predict", v: "", r: "d", q: "s", ok: true, k: [] },
];

test("questions: 1 first time, 0.6 after one slip, 0.3 after two, 0 when shown; designs don't count", () => {
  const qs = questionScores(record.filter((e) => e.u === "cables"));
  equal(qs.map((q) => q.score), [1, 0.6, 0.3, 0, 1]);
});

test("questions: right only AFTER pressing Show answer scores 0", () => {
  const qs = questionScores([
    { r: "x", q: "fbd", ok: false, k: ["missing"] },
    { r: "x", q: "*", shown: true },
    { r: "x", q: "fbd", ok: true, k: [] },
  ]);
  equal(qs.map((q) => q.score), [0]);
});

test("unit: cables = (1 + 0.6 + 0.3 + 0 + 1) / 5 = 58%; 2 challenge types, 3 different problems", () => {
  const u = unitComprehension(record, "statics", "cables");
  equal(u.score, 58);
  equal(u.answered, 5);
  equal(u.types, 2); // predict, solve
  equal(u.situations, 3); // crate, traffic light (both 2-predict), balloon (6-solve)
  equal(u.level, "Developing");
});

test("mistakes: cables has 3 math (trig ×2, sign) and 1 object (missing); trig is the most common, in 2 versions", () => {
  const m = mistakeBreakdown(record.filter((e) => e.u === "cables"));
  equal(m.byArea, { math: 3, object: 1, physics: 0, unknown: 0 });
  equal(m.total, 4);
  equal([m.byKind[0].kind, m.byKind[0].count, m.byKind[0].rounds], ["trig", 2, 2]);
});

test("course: chapter = average of its units with answers; course = average of chapters", () => {
  const course = {
    id: "statics", title: "Statics",
    chapters: [
      { id: "particles", title: "Equilibrium of a particle", units: ["cables", "springs", { title: "3D", comingSoon: true }] },
      { id: "moments", title: "Moments", units: ["moments"] },
    ],
  };
  const units = [{ id: "cables", title: "Cables" }, { id: "springs", title: "Springs" }, { id: "moments", title: "Moments" }];
  const cc = courseComprehension(record, course, units);
  // springs: one question, right after one slip → 60%.  Chapter 1: (58 + 60) / 2 = 59.
  equal(cc.chapters[0].units.map((u) => u.score ?? "soon"), [58, 60, "soon"]);
  equal([cc.chapters[0].score, cc.chapters[0].tried, cc.chapters[0].built], [59, 2, 2]);
  equal(cc.chapters[0].units[2].number, "1.3");
  equal(cc.chapters[1].score, null); // no answers yet
  equal(cc.score, 59); // only chapter 1 has answers
  equal(cc.mistakes.byArea, { math: 4, object: 1, physics: 0, unknown: 0 });
});

test("levels: few answers → Just started; then Needs work / Developing / Good / Strong", () => {
  equal([levelOf(null, 0), levelOf(100, 2), levelOf(30, 5), levelOf(50, 5), levelOf(70, 5), levelOf(90, 5)],
    ["Not started", "Just started", "Needs work", "Developing", "Good", "Strong"]);
});

test("kinds: general ones are built in; subjects add their own; unknown ones count as not identified", () => {
  equal(errorKind("trig").area, "math");
  equal(errorKind("missing").area, "object");
  equal(errorKind("concept").area, "physics");
  equal(errorKind("weight").area, "physics"); // statics registers it (a principle: W = mg)
  equal(errorKind("no-such-kind").area, "unknown");
  registerErrorKinds({ testKind: { area: "object", label: "A test kind" } });
  ok(isKnownKind("testKind"));
  let threw = false;
  try {
    registerErrorKinds({ bad: { area: "chemistry", label: "no such area" } });
  } catch {
    threw = true;
  }
  ok(threw, "an unknown area is refused");
});
