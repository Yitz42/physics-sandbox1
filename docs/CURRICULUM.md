# Curriculum

Each unit teaches one concept and tests it several ways (see challenge types in
CLAUDE.md). Every unit has 6 stages: explore → predict → build → debug →
concept-check → solve. A stage can have several **parts**: new ideas in a unit are
added as extra parts of its existing stages (not as extra stages).

Items marked ⭐ were agreed with the owner as additions to the textbook plan.

Edit this file freely: reorder units, add ideas, change what is tested.
Claude builds from it.

---

## Subject 1: Statics

### Phase 1: Foundations
Also builds: core, level runner, all challenge types, test page.

**Unit 1: Forces as vectors**
- Concept: a force has magnitude and direction; it splits into x and y components.
- Test ideas: drag an arrow and watch Fx, Fy change; predict components of a 30° force;
  add two forces to hit a target resultant; debug a sin/cos swap.
- ⭐ Cartesian vector form F = {Fx i + Fy j} N and the unit vector u = F/F (built).
- ⭐ A force along a line from coordinates: r_AB = r_B − r_A, u_AB = r_AB/r_AB (built:
  a part in every stage; e.g. anchor a cable so it pulls with a given force).

**Unit 2: Equilibrium of a particle**
- Concept: ΣFx = 0, ΣFy = 0 for forces through one point.
- Test ideas: a weight hanging from two cables; predict cable tensions;
  pick cable angles so neither exceeds a limit; debug an FBD missing a force.
- ⭐ Springs, F = k s: find the stretch, or choose k so a spring reaches its hook (built).
- ⭐ Pulleys: a cable over a frictionless pulley pulls twice with the same tension T
  (built: a pulley riding on a cable, held by a rope).

### Phase 2: Moments and equivalent systems

**Unit 3: Moment of a force**
- Concept: M = F × d (perpendicular distance); sign convention.
- Test ideas: seesaw balance; predict the moment of an angled force two ways
  (components vs. perpendicular distance); find the wrong moment arm.
- ⭐ Varignon's theorem named and tested: predict the moments of F_x and F_y
  separately, then their sum (built).

**Unit 4: Couples**
- Concept: two equal, opposite, offset forces make a pure moment that is the same about any point.
- Test ideas: move the reference point and see the moment stay the same;
  replace a couple with an equivalent one.

**Unit 5: Equivalent force systems**
- Concept: replace several forces with one resultant force plus a moment.
- Test ideas: find where a single force must act to replace a set of loads.
- ⭐ Moving one force to a point: the same force plus a couple M = Fd
  (built: slide O along a beam; a force on a bracket moved to its bolt).

**Unit 6: Distributed loads**
- Concept: a distributed load is replaced by its area, acting at its centroid.
- Test ideas: uniform and triangular loads on a beam; predict the equivalent force and location.

### Phase 3: Rigid body equilibrium (2D)

**Unit 7: Supports and free-body diagrams**
- Concept: each support type provides specific reactions (roller, pin, fixed, cable, smooth surface).
- Test ideas: pick the correct reactions for each support; debug FBDs.

**Unit 8: Equilibrium of a rigid body**
- Concept: ΣFx = 0, ΣFy = 0, ΣM = 0; choosing a smart moment point.
- Test ideas: simply supported beam, cantilever, L-shaped bracket; predict reactions;
  compare the effort of taking moments about different points.
- ⭐ Alternative equation sets: two moment equations plus one force equation
  (and when that works).

**Unit 9: Stability and determinacy**
- Concept: too few supports → mechanism; too many → indeterminate; improper supports.
- Test ideas: add supports until stable; spot the "stable-looking" but improperly supported structure.

**Unit 10: Two-force and three-force members**
- Concept: two-force members carry force along their line; three forces must be concurrent or parallel.
- Test ideas: find a direction without calculating.

### Phase 4: Structures

**Unit 11: Trusses, method of joints**
- Concept: pin-jointed members in pure tension or compression; solve joint by joint.
- Test ideas: build a truss to carry a load across a gap; predict member forces;
  color members red (tension) / blue (compression); identify zero-force members.
- ⭐ Zero-force members get their own part: spot them by inspection before solving.

**Unit 12: Trusses, method of sections**
- Concept: cut through the truss and solve for up to three members directly.
- Test ideas: choose the best cut; predict one member force quickly.

**Unit 13: Frames and machines**
- Concept: multi-body structures with multi-force members; take them apart into separate FBDs.
- Test ideas: pliers, a crane arm, an A-frame; equal and opposite forces at the connecting pins.

### Phase 5: Internal forces

**Unit 14: Internal forces at a point**
- Concept: cut a beam; the cut face carries normal force N, shear V, moment M.
- Test ideas: slide a cut along the beam and watch N, V, M.

**Unit 15: Shear and moment diagrams**
- Concept: V and M along a beam; relationships dV/dx = −w, dM/dx = V.
- Test ideas: sketch the diagram, then compare; find the max moment location.
- ⭐ Write V(x) and M(x) as equations for each segment.
- ⭐ Jumps in the diagrams: V jumps at point loads, M jumps at applied couples.
- Bridge to later: this feeds "stress at a point" in mechanics of materials.

### Phase 6: Friction

**Unit 16: Dry friction**
- Concept: F ≤ μN; impending motion; slipping vs. tipping.
- Test ideas: box on a ramp; ladder against a wall; predict the angle it slips.
- ⭐ Tipping versus slipping as its own part: which happens first, and why.

**Unit 17: Wedges and belt friction**
- Concept: wedges; belt friction T2 = T1·e^(μβ).
- Test ideas: how many wraps of rope hold a boat.

### Phase 7: Geometric properties

**Unit 18: Centroids and center of gravity**
- Concept: composite shapes; where the weight acts.
- Test ideas: build a shape that balances on a pin at a given point.
- ⭐ Composite shapes with holes: a hole counts as negative area.

**Unit 19: Area moments of inertia**
- Concept: I = ∫y² dA; parallel axis theorem.
- Test ideas: compare I-beam vs. rectangle of the same area.
- Bridge to later: needed for bending stress.

### Phase 8: 3D statics (uses three.js)

**Unit 20: 3D force vectors and particle equilibrium**
**Unit 21: Moments in 3D (cross product) and moment about an axis**
**Unit 22: 3D rigid body equilibrium**

---

## Subject 2: Mechanics of materials (later)
- Stress and strain, axial loading
- Torsion
- Bending stress (σ = My/I) at a point in a beam or bridge
- Shear stress in beams
- Combined loading: stress at a point
- Stress transformation and Mohr's circle
- Deflection
- Buckling of columns

## Subject 3: Dynamics (later)
- Kinematics of particles
- Newton's second law, work-energy, impulse-momentum
- Rigid body kinematics and kinetics
- Vibrations

## Possible later features
- Accounts and a class dashboard for instructors (needs a server; not in Phase 1)
- Level editor so instructors can make stages without code
