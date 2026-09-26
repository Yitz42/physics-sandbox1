// linear.js — solving systems of linear equations  A·x = b.
//
// Every statics problem ends up as a linear system: one row per equilibrium
// equation (ΣFx = 0, ΣFy = 0, ΣM = 0 …), one column per unknown force.
// The math.js library (loaded from a CDN in index.html) does the heavy
// lifting; this file adds the checks engineers care about:
//   • more unknowns than independent equations → "indeterminate"
//   • equations that contradict each other     → "inconsistent" (it moves)
//   • otherwise                                 → "unique" solution

const EPS = 1e-9;

// math.js is a global created by the <script> tag in index.html / tests.html.
function mathLib() {
  if (!globalThis.math) throw new Error("math.js did not load (check the CDN <script> tag).");
  return globalThis.math;
}

// Rank = number of truly independent rows. Two cables pointing the same way
// give two parallel columns, so the rank drops and we can't tell the forces apart.
export function rank(A) {
  const M = A.map((row) => row.slice());
  const rows = M.length;
  const cols = rows ? M[0].length : 0;
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    // Pick the biggest entry in this column as the pivot (numerically safest).
    let pivot = r;
    for (let i = r + 1; i < rows; i++) if (Math.abs(M[i][c]) > Math.abs(M[pivot][c])) pivot = i;
    if (Math.abs(M[pivot][c]) < EPS) continue;
    [M[r], M[pivot]] = [M[pivot], M[r]];
    for (let i = r + 1; i < rows; i++) {
      const f = M[i][c] / M[r][c];
      for (let j = c; j < cols; j++) M[i][j] -= f * M[r][j];
    }
    r++;
  }
  return r;
}

// Solve A·x = b. Returns { status, x, residual }.
//   status: "unique" | "indeterminate" | "inconsistent"
//   x:      the solution (best fit when inconsistent), or null
//   residual: A·x − b, i.e. how far each equation is from being satisfied
export function solveSystem(A, b) {
  const m = A.length;
  const n = m ? A[0].length : 0;

  // No unknowns at all: just check whether the equations already balance.
  if (n === 0) {
    const residual = b.map((v) => -v);
    const ok = residual.every((v) => Math.abs(v) < 1e-6 * scaleOf(b));
    return { status: ok ? "unique" : "inconsistent", x: [], residual };
  }

  const rA = rank(A);
  const rAb = rank(A.map((row, i) => [...row, b[i]]));
  if (rA < n) {
    // Some unknowns can't be separated (too many unknowns, or parallel ones).
    return { status: rA < rAb ? "inconsistent" : "indeterminate", x: null, residual: null };
  }

  const math = mathLib();
  let x;
  if (m === n) {
    x = math.flatten(math.lusolve(A, b));
  } else {
    // More equations than unknowns: least-squares best fit, then check it.
    const At = math.transpose(A);
    x = math.flatten(math.lusolve(math.multiply(At, A), math.multiply(At, b)));
  }
  const Ax = A.map((row) => row.reduce((s, a, j) => s + a * x[j], 0));
  const residual = Ax.map((v, i) => v - b[i]);
  const ok = residual.every((v) => Math.abs(v) < 1e-6 * scaleOf(b, A));
  return { status: ok ? "unique" : "inconsistent", x, residual };
}

// A size reference so "close to zero" means the same for 5 N and 50 kN problems.
function scaleOf(b, A = []) {
  let s = 1;
  for (const v of b) s = Math.max(s, Math.abs(v));
  for (const row of A) for (const v of row) s = Math.max(s, Math.abs(v));
  return s;
}
