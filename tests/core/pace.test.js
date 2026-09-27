// Pace: timing answers (src/core/pace.js). Each case is worked out by hand from
// the rules at the top of pace.js: expected 60 s per number, 60 s per FBD,
// 25 s per concept question; "fast" is under a quarter of that, "slow" over
// four times; usual pace = the median ratio of at least 8 first tries.
import { test, ok, equal, setFile } from "../harness.js";
import { checks, paceSignals, usualPace, questionType, EXPECTED } from "../../src/core/pace.js";

setFile("core / pace");

const ev = (r, chk, q, ok, sec, extra = {}) => ({ c: "statics", u: "cables", r, chk, q, ok, a: 1, ms: sec * 1000, h: 0, k: [], ...extra });

test("question types: numbers, FBDs, debug, concept questions", () => {
  equal(["T_AB", "fbd", "debug", "question 2", "design"].map(questionType), ["number", "fbd", "debug", "concept", "design"]);
  equal(EXPECTED.number, 60);
});

test("checks: two numbers checked together are one check, expected 2 × 60 = 120 s", () => {
  const cs = checks([ev("a", 1, "T_AB", true, 90), ev("a", 1, "T_AC", false, 90)]);
  equal(cs.length, 1);
  equal([cs[0].numbers, cs[0].expected, cs[0].ok, cs[0].ratio], [2, 120, false, 0.75]);
});

test("signals: 20 s for two tensions and right → very fast (under 30 s); 12 s and wrong → rushing", () => {
  const s = paceSignals([
    ev("a", 1, "T_AB", true, 20), ev("a", 1, "T_AC", true, 20), // 20 / 120 = 0.17 < 0.25, right
    ev("b", 1, "T_AB", false, 12), // 12 / 60 = 0.2, wrong
  ]);
  equal([s.counts.fastRight, s.counts.fastWrong, s.counts.slow], [1, 1, 0]);
});

test("signals: a concept question taking 2 minutes (over 4 × 25 s) is slow; 25 minutes is 'away', not slow", () => {
  const s = paceSignals([ev("a", 1, "question 1", true, 120), ev("b", 1, "question 2", true, 25 * 60)]);
  equal([s.counts.slow, s.counts.away], [1, 1]);
});

test("signals: three quick wrong retries at one question count as rushing (guessing)", () => {
  const s = paceSignals([
    ev("a", 1, "T_AB", false, 70),
    ev("a", 2, "T_AB", false, 4, { a: 2 }),
    ev("a", 3, "T_AB", false, 3, { a: 3 }),
    ev("a", 4, "T_AB", false, 5, { a: 4 }),
  ]);
  equal(s.counts.fastWrong, 1);
});

test("signals: 30 s on another tab during a question, then right → left the page", () => {
  const s = paceSignals([ev("a", 1, "fbd", true, 50, { h: 30000 })]);
  equal(s.counts.leftPage, 1);
});

test("usual pace: median of 8+ first tries; an answer 3× faster than usual is flagged", () => {
  // Eight FBDs at 60 s (ratio 1), then one at 15 s: ratio 0.25 — not under 0.25, so
  // not "very fast" against the expected time, but under 1/3 of the student's usual 1.
  const record = [...Array(8)].map((_, i) => ev(`r${i}`, 1, "fbd", true, 60));
  equal(usualPace(record), 1);
  equal(usualPace(record.slice(0, 7)), null, "7 first tries aren't enough to know");
  const s = paceSignals([...record, ev("z", 1, "fbd", true, 15)], usualPace(record));
  equal([s.counts.fastRight, s.counts.fasterThanUsual], [0, 1]);
});

test("typical time: the median first try per kind, next to what's expected", () => {
  const s = paceSignals([ev("a", 1, "fbd", true, 40), ev("b", 1, "fbd", true, 80), ev("c", 1, "fbd", true, 70)]);
  equal(s.typical.fbd, { seconds: 70, expected: 60, count: 3 });
});

test("retries and designs don't count as first tries; a stage's own expected time is used", () => {
  const cs = checks([ev("a", 1, "design", false, 5), ev("b", 2, "T_AB", true, 30, { a: 2 }), ev("c", 1, "T_AB", true, 30, { x: 300 })]);
  equal(cs.length, 2); // the design isn't a check
  equal(cs.find((c) => c.r === "b").first, false);
  equal(cs.find((c) => c.r === "c").expected, 300);
  ok(paceSignals([ev("c", 1, "T_AB", true, 30, { x: 300 })]).counts.fastRight === 1, "30 s of an expected 300 s is very fast");
});
