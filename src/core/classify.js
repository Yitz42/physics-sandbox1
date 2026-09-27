// classify.js — guesses WHY a wrong number is wrong, from the number alone.
//
// Each challenge first compares a wrong answer with the specific slips its
// solver knows (e.g. "you used cos where sin belongs, for THIS force"). When
// none of those match, these general rules are tried, in this order, before
// the answer is called "unexplained":
//
//   sign        the size is right, the sign is flipped:     submitted ≈ −expected
//   weight      a mass used as a weight, or the reverse:    submitted ≈ expected ÷ 9.81 or × 9.81
//   trig        sin and cos swapped for one of the round's angles:
//                                                           submitted ≈ expected × tan θ or ÷ tan θ
//   calculator  the calculator was in radians:              submitted ≈ the answer with θ read as radians
//               (for an angle answer: the angle given in radians instead of degrees)
//   rounding    within ROUNDING_BAND (2%) but outside the tolerance: an
//               intermediate step was rounded too early
//
// It knows nothing about a particular subject: the angles come from the
// round's numbers (anglesIn), g is the standard 9.81 m/s².

export const G = 9.81;
export const ROUNDING_BAND = 0.02; // "within about 2%"
// A check this soon after the round started is flagged as a fast guess
// (hardly time to read the question, let alone work it out).
export const FAST_GUESS_MS = 8000;

const RAD = Math.PI / 180;

// How close counts as "matches this slip": the answer's tolerance, or 1% of
// the slip's value (the student may also have rounded), whichever is bigger.
function near(submitted, target, tolerance) {
  return Number.isFinite(target) && Math.abs(submitted - target) <= Math.max(tolerance, 0.01 * Math.abs(target)) + 1e-9;
}

// The rules, in order. Each gets { submitted, expected, tolerance, angles, unit }
// and returns true when the answer fits it.
export const RULES = [
  ["sign", ({ submitted, expected, tolerance }) => Math.abs(expected) > tolerance && near(submitted, -expected, tolerance)],
  ["weight", ({ submitted, expected, tolerance }) => Math.abs(expected) > tolerance && (near(submitted, expected / G, tolerance) || near(submitted, expected * G, tolerance))],
  ["trig", ({ submitted, expected, tolerance, angles }) =>
    Math.abs(expected) > tolerance && angles.some((a) => {
      const t = Math.tan(a * RAD);
      // 45° (tan = 1) and 0°/90° (tan = 0 or ∞) can't show a swap.
      if (!Number.isFinite(t) || Math.abs(t) < 0.05 || Math.abs(Math.abs(t) - 1) < 0.05 || Math.abs(t) > 20) return false;
      return [expected * t, expected / t, -expected * t, -expected / t].some((v) => near(submitted, v, tolerance));
    })],
  ["calculator", ({ submitted, expected, tolerance, angles, unit }) => {
    if (unit === "deg" && near(submitted, expected * RAD, Math.min(tolerance, 0.01))) return true; // gave the angle in radians
    if (Math.abs(expected) <= tolerance) return false;
    return angles.some((a) => [Math.sin, Math.cos, Math.tan].some((f) => {
      const deg = f(a * RAD);
      if (Math.abs(deg) < 0.05) return false;
      return near(submitted, (expected * f(a)) / deg, tolerance); // f(θ) read as radians
    }));
  }],
  ["rounding", ({ submitted, expected, tolerance }) => Math.abs(submitted - expected) > tolerance && Math.abs(submitted - expected) <= Math.max(ROUNDING_BAND * Math.abs(expected), 5 * tolerance)],
];

// The first rule a wrong answer fits: "sign", "weight", "trig", "calculator",
// "rounding" — or null when none does.
export function classifyNumber({ submitted, expected, tolerance = 0.1, angles = [], unit = "" }) {
  if (!Number.isFinite(submitted) || !Number.isFinite(expected)) return null;
  if (Math.abs(submitted - expected) <= tolerance + 1e-9) return null; // it's right
  const facts = { submitted, expected, tolerance, angles, unit };
  const hit = RULES.find(([, fits]) => fits(facts));
  return hit ? hit[0] : null;
}

// What to tell the student for each rule (checkAnswer uses these).
export const RULE_MESSAGES = {
  sign: "The size is right but the sign isn't. Check which way it points: + is right, up and counterclockwise.",
  weight: "Your answer is off by a factor of g = 9.81. Check where a mass (kg) should have become a weight in newtons, W = mg — or the other way round.",
  trig: "That's what you get with sin and cos swapped. Look at the angle in the picture: the side NEXT to it uses cos, the side OPPOSITE it uses sin.",
  calculator: "That's what a calculator in radians gives. Switch it to degrees (DEG) and work it out again.",
};

// Every angle (in degrees) in a round's numbers: `angle: 30` entries, and the
// angle of each slope triangle (`slope: [3, 4]`). The trig and calculator
// rules try each one.
export function anglesIn(setup) {
  const out = new Set();
  const walk = (o) => {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(walk);
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === "number" && /angle|theta/i.test(k)) out.add(v);
      else if (k === "slope" && Array.isArray(v) && v.length === 2) out.add(Math.abs(Math.atan2(v[1], v[0]) / RAD) % 180);
      else walk(v);
    }
  };
  walk(setup);
  return [...out].filter((a) => Number.isFinite(a) && a % 90 !== 0);
}

// Fast guess: checked within FAST_GUESS_MS of the round starting (only the
// first check of a round can be one).
export const isFastGuess = (msSinceRoundStart) => msSinceRoundStart != null && msSinceRoundStart < FAST_GUESS_MS;
