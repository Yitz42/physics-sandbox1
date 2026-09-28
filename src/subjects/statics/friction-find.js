// friction-find.js — where motion starts (Units 9.1–9.2): setup.find = { path, motion, … }
// names a number (a push, a slope, a distance); this steps it from min to max until the
// body changes between holding and slipping (or, with opts.event "tip", tipping).
// Split from friction.js to keep each file small; the physics of one state is there.

import { clone, setPath } from "../../core/paths.js";
import { blockState, bodyState, isBody } from "./friction.js";

// How far from slipping a setup is: positive once friction can't hold it.
// opts.event "tip" (Unit 9.2): how far from tipping instead — positive once N would
// have to act beyond the corner O (x < 0).
function slipMargin(setup, opts) {
  if (opts.event === "tip") {
    const b = blockState(setup, opts);
    return b.N < 0 ? NaN : -b.x;
  }
  if (isBody(setup)) {
    const { rigid, contacts } = bodyState(setup);
    if (rigid.status !== "determinate") return NaN;
    return Math.max(...Object.values(contacts).map((c) => Math.abs(c.Fneed) - c.Fmax));
  }
  const b = blockState(setup, opts);
  if (b.N < 0) return NaN;
  const way = ["up", "right"].includes(setup.find.motion) ? -1 : 1; // about to move up → friction points down (F < 0)
  return way * b.Fneed - setup.mus * b.N;
}

// The value at find.path where motion starts (NaN if it never does between min and max).
export function criticalValue(setup, opts = {}) {
  const f = setup.find;
  const at = (v) => {
    const s = clone(setup);
    setPath(s, f.path, v);
    return slipMargin(s, opts);
  };
  // Step from min to max until it changes between holding (margin < 0) and slipping,
  // either way round (a bigger push can start a crate moving, or stop it sliding
  // down), then close in on the change by halving.
  const steps = 400;
  let lo = f.min, glo = at(lo);
  if (Math.abs(glo) < 1e-9) return lo;
  for (let i = 1; i <= steps; i++) {
    const hi = f.min + ((f.max - f.min) * i) / steps;
    const ghi = at(hi);
    if (Number.isFinite(glo) && Number.isFinite(ghi) && (glo < 0) !== (ghi < 0)) {
      let a = lo, b = hi;
      const slipsAtA = glo >= 0;
      for (let k = 0; k < 60; k++) {
        const m = (a + b) / 2;
        if ((at(m) >= 0) === slipsAtA) a = m;
        else b = m;
      }
      return (a + b) / 2;
    }
    lo = hi;
    glo = ghi;
  }
  return NaN;
}

