// harness.js — a tiny test framework (no libraries needed).
//
// Test files call:
//   test("what it checks", () => { ... });
//   close(actual, expected, tolerance)  — numbers agree (default 0.1% relative)
//   equal(actual, expected)              — exactly equal (compares JSON)
//   ok(condition, message)               — condition is true
// tests.html imports every test file, then calls runAll() to show the results.

const tests = [];
let currentFile = "";

export function setFile(name) {
  currentFile = name;
}

export function test(name, fn) {
  tests.push({ file: currentFile, name, fn });
}

export function ok(condition, message = "expected condition to be true") {
  if (!condition) throw new Error(message);
}

export function equal(actual, expected, message = "") {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message} expected ${e}, got ${a}`.trim());
}

export function close(actual, expected, relTol = 1e-3, message = "") {
  const tol = Math.max(1e-9, relTol * Math.abs(expected));
  if (typeof actual !== "number" || !(Math.abs(actual - expected) <= tol)) {
    throw new Error(`${message} expected ≈ ${expected}, got ${actual}`.trim());
  }
}

// Run every registered test; returns [{ file, name, passed, error }].
export async function runAll() {
  const results = [];
  for (const t of tests) {
    try {
      await t.fn();
      results.push({ file: t.file, name: t.name, passed: true });
    } catch (err) {
      results.push({ file: t.file, name: t.name, passed: false, error: err.message || String(err) });
    }
  }
  return results;
}
