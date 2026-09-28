// allowable-stress-scene.js — 2D engineering diagram for allowable stress design (Unit 1.4).
//
// Shows two panels:
//   Left:  Structural Connection Assembly — tension rod, clevis plates, pin, and tensile load P.
//   Right: Critical Connection Sections — pin shear plane and plate bearing area.

import { spreadPanels } from "../../render/panels.js";
import { solveAllowableStress } from "./allowable-stress.js";
import { sectionShapes } from "./allowable-stress-sections.js";
import { assemblyShapes } from "./allowable-stress-assembly.js";

export function allowableStressScene(setup = {}, result, opts = {}) {
  const res = result || solveAllowableStress(setup);
  const v = res.values;
  const reveal = !!opts.reveal;

  const dRod = v.d_rod ?? 22;
  const dPin = v.d_pin ?? 18;
  const tPlate = v.t_plate ?? 12;
  const isDouble = v.n === 2;

  const shapes = [];

  // =========================================================================
  // GEOMETRY & SCALE
  // =========================================================================
  const hRod = 0.22 * Math.max(0.6, Math.min(1.5, dRod / 22));
  const R_pin = 0.18 * Math.max(0.6, Math.min(1.5, dPin / 18));
  const pinW = 2 * R_pin;
  const tH = 0.22 * Math.max(0.6, Math.min(1.5, tPlate / 12));

  const plateLen = 1.15;
  const rodLen = 1.25;

  // The assembly — rod, plates, pin and the load — is drawn in allowable-stress-assembly.js.
  shapes.push(...assemblyShapes({ v, hRod, R_pin, pinW, tH, plateLen, rodLen, dRod, dPin, tPlate, isDouble }));

  // =========================================================================
  // RIGHT PANEL: Critical Failure Sections (Pin Shear & Bearing Area)
  // =========================================================================
  const dividerX = rodLen + 0.95;
  const xR = rodLen + 2.35;



  // (The two sections — the pin's shear plane and the plate's bearing area — are drawn in
  // allowable-stress-sections.js.)
  shapes.push(...sectionShapes({ v, xR, R_pin, pinW, tH, dPin, tPlate, isDouble, reveal }));

  // =========================================================================
  // CORNER NOTE
  // =========================================================================
  // The allowable stresses are givens of the problem (a build stage varies them), so they are
  // always listed. The capacities they give are what the stages ask for: only once revealed
  // (after Test — or, in the explore stage, after its opening guess).
  const noteLines = [];
  // (Short lines: the note must leave room for the labels round the drawing.)
  noteLines.push(`Rod: σ ≤ ${v.sigma_allow} MPa`);
  noteLines.push(`Pin: τ ≤ ${v.tau_allow} MPa`);
  noteLines.push(`Plate: σb ≤ ${v.sigma_b_allow} MPa`);
  if (reveal) {
    noteLines.push(`Tension: ${v.P_tension.toFixed(1)} kN`);
    noteLines.push(`Allowable: ${v.P_allow.toFixed(1)} kN (${v.governing})`);
  }
  if (reveal && v.FS != null) {
    noteLines.push(`Applied P = ${v.P.toFixed(1)} kN, FS = ${v.FS.toFixed(2)}`);
  }
  shapes.push({
    type: "note",
    lines: noteLines,
  });

  // =========================================================================
  // SPREAD PANELS
  // =========================================================================
  const leftReach = [-plateLen - 0.85, rodLen + 0.85];
  const rightReach = [xR - 0.85, xR + 1.15];
  const yReach = [-0.85, 0.78];


  return spreadPanels(shapes, {
    divider: dividerX,
    left: leftReach,
    right: rightReach,
    y: yReach,
    margin: 0.35,
    size: opts.canvasSize,
  });
}
