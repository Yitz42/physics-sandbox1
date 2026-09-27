// projection.js — drawing three dimensions on the flat canvas (Unit 2.3 on).
//
// A 3D picture is drawn by looking at it from one direction: every point in space
// (metres, z up, right-handed) becomes a point on the picture, and the result is an
// ordinary 2D scene — so labels, the object-boundaries rule and the picture test all
// work as usual. (No 3D library is needed for pictures made of lines and arrows.)
//
// view: { yaw, pitch } in degrees. yaw turns the viewer round the z axis, pitch
// raises them above the x-y plane. The default (yaw 30°, pitch 22°) is the textbook
// look: x toward the viewer and down-left, y to the right, z straight up.

const DEG = Math.PI / 180;

export function projector(view = {}) {
  const yaw = (view.yaw ?? 30) * DEG, pitch = (view.pitch ?? 22) * DEG;
  const right = [-Math.sin(yaw), Math.cos(yaw), 0];
  const up = [-Math.sin(pitch) * Math.cos(yaw), -Math.sin(pitch) * Math.sin(yaw), Math.cos(pitch)];
  const toward = [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return {
    at: (p) => [dot(p, right), dot(p, up)], // the point on the picture
    depth: (p) => dot(p, toward), // how near the viewer it is (bigger: nearer)
    screenDir: (v) => [dot(v, right), dot(v, up)], // a direction in space, as drawn
  };
}
