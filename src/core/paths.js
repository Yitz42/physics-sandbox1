// paths.js — reading and writing values deep inside a stage's setup,
// and making "new versions" of a problem with different numbers.
//
// A path is a dotted string such as "forces.0.magnitude": start at the setup,
// go into `forces`, take item 0, then its `magnitude`. Stage files use paths
// to say which values a slider edits and which values change between versions.

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Split "forces.0.magnitude" into ["forces", "0", "magnitude"].
function parts(path) {
  return String(path).split(".").filter(Boolean);
}

// Array items can also be found by id: "forces.#T_AB.magnitude" means
// "the force whose id is T_AB". That keeps paths readable and stable
// even if forces are reordered.
function step(obj, key) {
  if (obj == null) return undefined;
  if (key.startsWith("#") && Array.isArray(obj)) return obj.find((x) => x && x.id === key.slice(1));
  return obj[key];
}

export function getPath(obj, path) {
  return parts(path).reduce(step, obj);
}

export function setPath(obj, path, value) {
  const keys = parts(path);
  const last = keys.pop();
  const parent = keys.reduce(step, obj);
  if (parent == null) throw new Error(`Path not found: ${path}`);
  if (last.startsWith("#") && Array.isArray(parent)) {
    const i = parent.findIndex((x) => x && x.id === last.slice(1));
    parent[i] = value;
  } else {
    parent[last] = value;
  }
  return obj;
}

// Pick one random value for a "vary" rule. A rule is either
//   { path, values: [20, 30, 45] }            → one of the listed values
//   { path, min: 200, max: 600, step: 50 }    → a random multiple of step
export function pickValue(rule, random = Math.random) {
  if (rule.values) return rule.values[Math.floor(random() * rule.values.length)];
  const count = Math.floor((rule.max - rule.min) / rule.step + 1e-9) + 1;
  const v = rule.min + Math.floor(random() * count) * rule.step;
  return Number(v.toFixed(10)); // strip floating-point noise like 0.30000000000000004
}

// Make a new version of a setup by applying every "vary" rule.
// Tries a few times to get numbers that differ from `avoid` (the version the
// student just saw), so "a new question" really is new.
export function makeVariant(setup, rules = [], random = Math.random, avoid = null) {
  let out = clone(setup);
  for (let attempt = 0; attempt < 10; attempt++) {
    out = clone(setup);
    for (const rule of rules) setPath(out, rule.path, pickValue(rule, random));
    if (!avoid || JSON.stringify(out) !== JSON.stringify(avoid)) break;
  }
  return out;
}
