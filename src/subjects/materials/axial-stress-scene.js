// axial-stress-scene.js — drawing for an axially loaded bar (Normal Stress Unit 1.1).
// Dispatches between the 2D View (Elevation + Side Profile) and the 3D Perspective View.

import { axialStress2dScene } from "./axial-stress-2d.js";
import { axialStress3dScene } from "./axial-stress-3d.js";

export function axialStressScene(setup = {}, result, opts = {}) {
  const is3D = opts.viewMode === "3d" || opts.view3d === true || setup.viewMode === "3d";
  if (is3D) {
    return axialStress3dScene(setup, result, opts);
  }
  return axialStress2dScene(setup, result, opts);
}
