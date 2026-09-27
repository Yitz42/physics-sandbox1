// Old stage ids → today's (migrations.js): progress, events, merging, and the
// bounded event store.
import { test, ok, equal, setFile } from "../harness.js";
import { migrateStageId, migrateProgressMap, mergeProgressEntry, migrateEvent } from "../../src/core/migrations.js";
import { compact } from "../../src/core/evidence.js";

setFile("core / id migrations and merging");

test("every old numbered unit folder maps to today's unit (file names unchanged)", () => {
  equal(migrateStageId("statics", "01-force-vectors/2-predict"), "force-components/2-predict");
  equal(migrateStageId("statics", "02-particle-equilibrium/6-solve"), "cables/6-solve");
  equal(migrateStageId("statics", "03-moments/1-explore"), "moments/1-explore");
  equal(migrateStageId("statics", "04-couples/3-build"), "couples/3-build");
  equal(migrateStageId("statics", "05-equivalent-systems/5-concept-check"), "equivalent-systems/5-concept-check");
  equal(migrateStageId("statics", "cables/2-predict"), "cables/2-predict", "today's ids are left alone");
  equal(migrateStageId("controls", "01-force-vectors/2-predict"), "01-force-vectors/2-predict", "only the course the table is for");
});

test("progress under an old id moves to the new one", () => {
  const { map, changed } = migrateProgressMap({ "statics/03-moments/2-predict": { status: "complete", updated: "2026-09-20T10:00:00.000Z" } });
  ok(changed);
  equal(Object.keys(map), ["statics/moments/2-predict"]);
  equal(map["statics/moments/2-predict"].status, "complete");
  equal(migrateProgressMap({ "statics/moments/2-predict": { status: "started" } }).changed, false, "nothing to do: not re-saved");
});

test("an old and a new entry for the same stage merge: better status, latest update, earliest start", () => {
  const { map } = migrateProgressMap({
    "statics/02-particle-equilibrium/2-predict": { status: "complete", updated: "2026-09-20T10:00:00.000Z", firstStarted: "2026-09-19T09:00:00.000Z", completedAt: "2026-09-20T10:00:00.000Z" },
    "statics/cables/2-predict": { status: "started", updated: "2026-09-27T08:00:00.000Z", firstStarted: "2026-09-27T07:00:00.000Z" },
  });
  equal(map["statics/cables/2-predict"], { status: "complete", updated: "2026-09-27T08:00:00.000Z", firstStarted: "2026-09-19T09:00:00.000Z", completedAt: "2026-09-20T10:00:00.000Z" });
  // The ranking: complete > practice > started > none.
  equal(mergeProgressEntry({ status: "practice" }, { status: "started" }).status, "practice");
  equal(mergeProgressEntry({ status: "none" }, { status: "started" }).status, "started");
  equal(mergeProgressEntry({ status: "complete", partsDone: 0 }, { status: "practice" }), { status: "complete" }, "partsDone 0 isn't kept");
});

test("old events get today's ids, a type, null for a missing situation, and every timing field", () => {
  const e = migrateEvent({ t: 1, c: "statics", u: "02-particle-equilibrium", s: "02-particle-equilibrium/2-predict", v: "", q: "T_AB", ok: false, k: ["trig"] });
  equal(e.e, "check");
  equal([e.u, e.s], ["cables", "cables/2-predict"]);
  equal(e.v, null);
  equal([e.a, e.ms, e.h, e.chk], [null, null, null, null]);
  equal(migrateEvent({ t: 1, c: "statics", q: "*", shown: true }).e, "showAnswer", "a Show answer press");
  equal(migrateEvent({ e: "hint", t: 1, c: "statics", hi: 1 }).a, undefined, "only checks and Show answer get the answer fields");
});

test("storage stays bounded: the oldest explore summaries go first", () => {
  const ev = [{ e: "exploreAction", t: 1 }, { e: "check", t: 2 }, { e: "exploreAction", t: 3 }, { e: "check", t: 4 }, { e: "check", t: 5 }];
  equal(compact(ev, 4).map((x) => x.t), [2, 3, 4, 5]);
  equal(compact(ev, 3).map((x) => x.t), [2, 4, 5]);
  equal(compact(ev, 2).map((x) => x.t), [4, 5], "then the oldest of the rest");
  equal(compact(ev, 10).length, 5);
});

import { changeTally } from "../../src/challenges/common/design.js";

test("explore summary: one change per adjustment; the same slider moved again within a second is one change", () => {
  let clock = 0;
  const stage = { editable: [{ path: "forces.0.magnitude" }, { path: "forces.0.direction.angle" }], draggable: ["F"] };
  const setup = { forces: [{ id: "F", magnitude: 100, direction: { angle: 30 } }] };
  const tally = changeTally(stage, setup, () => clock);
  setup.forces[0].direction.angle = 40; // moves the slider AND the dragged arrow F: one change
  tally.note(setup);
  clock = 300;
  setup.forces[0].direction.angle = 45; // same slider, still moving
  tally.note(setup);
  clock = 5000;
  setup.forces[0].magnitude = 200; // a new adjustment
  tally.note(setup);
  tally.note(setup); // nothing moved
  const sum = tally.summary();
  equal(sum.changes, 2);
  equal(sum.params.sort(), ["F", "forces.0.direction.angle", "forces.0.magnitude"]);
  equal(sum.final["forces.0.direction.angle"], 45);
});
