// Unit 4.4, stage 3 — build: hold a beam with three rollers only.
// Each roller sits on the floor (pushes up) or on a 45° ramp (pushes up and
// right, or up and left). The load P slants down and to the LEFT, so some
// roller must push to the right. Hand-worked traps:
//   three floor rollers → all parallel: improper, it slides;
//   ramps at A (up-right) and C (up-left) with B on the floor → the three lines
//   meet at (3, 3): improper, it turns about that point;
//   a ramp that pushes left only → it would have to pull: it lifts off.
// P = (−0.6P, −0.8P) at x = 4. The ramps' pushes to the right must add up to 0.6P,
// and each brings the same amount of lift, so only 0.2P is left for any floor
// roller; moments about A then decide. Hand-worked (a, b, c = the ramps' parts):
//   A floor, B and C ramps pushing right: b + c = 0.6P, 3b + 6c = 3.2P → c = 0.467P, b = 0.133P ✓
//   A and C ramps pushing right, B floor: N_B = 0.2P, 6c = 3.2P − 0.6P → c = 0.433P, a = 0.167P ✓
//   One ramp pushing right and two floor rollers: a floor roller would have to pull ✗
//   All three ramps pushing right: all parallel ✗

const s2 = Math.SQRT1_2;
const FLOOR = { normal: [0, 1], direction: "up" };
const RIGHT = { normal: [s2, s2], direction: { angle: 45, from: "+x", toward: "+y" } };
const LEFT = { normal: [-s2, s2], direction: { angle: 45, from: "-x", toward: "+y" } };
const choice = (id) => [
  { label: "On the floor (pushes up)", set: { [`supports.#${id}.normal`]: FLOOR.normal, [`supports.#${id}.direction`]: FLOOR.direction } },
  { label: "On a ramp (pushes up and right)", set: { [`supports.#${id}.normal`]: RIGHT.normal, [`supports.#${id}.direction`]: RIGHT.direction } },
  { label: "On a ramp (pushes up and left)", set: { [`supports.#${id}.normal`]: LEFT.normal, [`supports.#${id}.direction`]: LEFT.direction } },
];
const roller = (id, x) => ({ id, type: "roller", at: [x, 0], symbol: `N_${id}`, ...FLOOR });

export default {
  id: "stability/3-build",
  challenge: "build",
  solver: "statics.rigidBody",
  title: "Three Rollers Only",
  mission: "Hold the beam with three rollers — no pins allowed.",
  instructions:
    "The only parts left are three rollers, at A, B and C. Each can sit on the floor or on a 45° ramp. " +
    "Choose each one's surface so the beam is held in place, then press **Test**. (A roller can only push.)",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [roller("A", 0), roller("B", 3), roller("C", 6)],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: { slope: [-3, -4] }, at: [4, 0], push: true }],
  },
  view: { xmin: -1.4, xmax: 7.4, ymin: -2.4, ymax: 3.6 },
  vary: [{ path: "forces.#P.magnitude", min: 300, max: 900, step: 10 }],
  editable: [
    { label: "Roller at A", options: choice("A") },
    { label: "Roller at B", options: choice("B") },
    { label: "Roller at C", options: choice("C") },
  ],
  goal: {
    text: "Hold the beam still: **stable** and **statically determinate**, with every roller pushing (none lifting off).",
    check(result) {
      if (result.status === "determinate") return { ok: true, message: "Three rollers, three unknowns, and their lines neither all parallel nor all through one point — and each one pushes. A proper support!" };
      return { ok: false, message: `It moves! ${result.message}` };
    },
  },
  hints: [
    "Three floor rollers all push straight up. What holds the beam against the sideways part of $P$?",
    "$P$ pushes the beam to the left, so at least one roller must push to the right.",
    "If all three reactions' lines pass through one point, the beam can turn about it. And each ramp that pushes right also lifts — one ramp alone lifts too much in the wrong place.",
  ],
  explanation:
    "Three unknowns is necessary but not enough: the reactions must also be properly arranged. All parallel, and the beam slides across them; " +
    "all through one point, and it turns about that point. And a roller can only push, so the ramp must face the way the beam wants to slide.",
};
