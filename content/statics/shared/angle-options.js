// angle-options.js — the direction dropdown for stages that let the student
// set a force's direction. The angle θ is always measured from the x-axis;
// the dropdown picks which way the force points, written with x and y signs:
// "From O to +x,+y" means from the point O out into the +x, +y quarter.
//
// forcePath: path to the force, e.g. "forces.0" or "forces.#F2"

const QUARTERS = [["+x", "+y"], ["-x", "+y"], ["-x", "-y"], ["+x", "-y"]];
const pretty = (axis) => axis.replace("-", "−"); // real minus sign

export function angleOptions(forcePath, label = "Direction") {
  return {
    label,
    options: QUARTERS.map(([from, toward]) => ({
      label: `From O to ${pretty(from)},${pretty(toward)}`,
      set: { [`${forcePath}.direction.from`]: from, [`${forcePath}.direction.toward`]: toward },
    })),
  };
}
