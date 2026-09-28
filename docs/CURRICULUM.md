# Curriculum

The course is grouped into **chapters** that follow the textbook's chapters
(content/statics/reading.js), chapter for chapter: Chapter 5 here is the
book's Chapter 5. Each **unit** teaches ONE concept and tests it six
ways (see challenge types in CLAUDE.md): explore → predict → build → debug →
concept-check → solve. Units are numbered by chapter: 3.2 is chapter 3, unit 2.
A new concept gets its own unit in the matching chapter. 3D units come at the end
of the chapter whose 2D ideas they build on (they use three.js).

Items marked ⭐ were agreed with the owner as additions to the textbook plan.
✅ = built.

Edit this file freely: reorder units, add ideas, change what is tested.
Claude builds from it.

---

## Subject 1: Statics

### Chapter 1: Introduction to statics

**Unit 1.1: Newton's laws and units**
- Concept: Newton's three laws; SI units (m, kg, s, N); weight W = mg.

**Unit 1.2: Solving a statics problem**
- Concept: the steps every problem follows: sketch, free-body diagram, equations, answer, check.

### Chapter 2: Forces and other vectors

**Unit 2.1: Force components and resultants** ✅
- Concept: a force has magnitude and direction; it splits into x and y components.
- Test ideas: drag an arrow and watch Fx, Fy change; predict components of a 30° force;
  add two forces to hit a target resultant; debug a sin/cos swap.

**Unit 2.2: Cartesian vectors** ⭐ ✅
- Concept: F = {Fx i + Fy j} N = F u; a force along a line from coordinates:
  r_AB = r_B − r_A, u_AB = r_AB / r_AB.
- Test ideas: move anchor B and watch r_AB, u_AB; predict a unit vector, then a cable
  force from coordinates; anchor a cable so it pulls with a given force; debug swapped
  fractions; resultant of two cables in Cartesian form.

**Unit 2.3: Forces in 3D** ✅
- Concept: F = Fx i + Fy j + Fz k; size √(Fx² + Fy² + Fz²); coordinate direction angles α, β, γ
  (cos²α + cos²β + cos²γ = 1); azimuth θ and elevation φ; a force along a line (r_AB in 3D).
- Built: set a force's three components (and turn the view) and watch F, α, β, γ; predict
  components from α and β (γ from the identity), from an azimuth and elevation, along a flagpole
  cable, and the size and angles from components; place a guy wire's anchor so it pulls straight
  toward −y with 600–800 N sideways; debug a student's cable working (backwards subtraction, a
  sign, no square root, F r_AB instead of F u_AB); concept check; solve two cables on a pole:
  choose r and T lines, then the resultant's size and direction angles.
- Pictures: drawn in 3D by projection onto the same canvas (render/projection.js), so labels
  and the picture test work as usual — no 3D library needed for lines and arrows.

**Unit 2.4: Chapter 2 challenge** ⭐ ✅
- A review unit (agreed with the owner, 2026-09-27): harder problems in NEW situations that
  need Units 2.1–2.3 together.
- Built: explore — steer a second tugboat so the barge goes along the canal, then with the
  smallest pull (it is perpendicular to the resultant's line); predict — work backwards from a
  known resultant: a force's components along two slanted lines u and v (bigger than the force!),
  or two rope tensions from coordinates; build — anchor a second guy wire (place C, set its
  tension) so a mast is pulled straight down its length, and work out that push; debug — one slip
  in the rope equations; concept check (smallest force, slanted components vs projections,
  impossible direction angles, unit-vector checks …); solve in two parts — a sign lifted by three
  lines given by an angle, coordinates and a slope (find two unknown sizes), and a mast pulled
  three ways in space (direction angles, azimuth/elevation, a line).

### Chapter 3: Equilibrium of particles

**Unit 3.1: Cables** ✅
- Concept: ΣFx = 0, ΣFy = 0 for forces through one point.
- Test ideas: a weight hanging from two cables; predict cable tensions;
  pick cable angles so neither exceeds a limit, past an off-centre skylight, working
  out both tensions for each design before it is load-tested; debug an FBD missing a force.
- Different pictures each version: Predict (crate, traffic light, balloon, lamp pulled
  aside), Build (skylight crate, balloon tethers around a pond), Solve (lamp, traffic
  light, balloon).

**Unit 3.2: Springs** ⭐ ✅
- Concept: F = k s; equilibrium sets the force, the stiffness sets the stretch.
- Test ideas: predict the stretch; choose k so a spring reaches its hook; debug a spring
  drawn pushing; a lamp hung from a spring and a cable (stretched length).

**Unit 3.3: Pulleys** ⭐ ✅
- Concept: a cable over a frictionless pulley pulls twice with the same tension T.
- Test ideas: a pulley riding on a cable, held by a rope; set the angles so the rope can
  be cut; debug an FBD with one side of the cable missing.

**Unit 3.4: Particle equilibrium in 3D** ✅
- Concept: ΣFx = 0, ΣFy = 0, ΣFz = 0: three equations, up to three unknowns.
- Built (statics.force3d with analysis "equilibrium", z up like Unit 2.3): explore — move one of three
  ceiling anchors and watch the tensions (make a cable carry nothing, one hold it all, one have to
  push); predict — a crate on three cables, on two cables and a spring (its stretch), or pulled
  aside by a known rope force (azimuth/elevation); build — place the third anchor so all three pull
  and none carries over 45% of the weight (10 places on the grid, the same for any crate); debug —
  one slip in the three equations (a sign, W left out, r not divided by its length); concept check;
  solve — a hall lamp on three cables: choose the equations, then the three tensions.
- No FBD drawing step in 3D yet (the owner may choose: draw arrows in 3D, or pick forces from a list).

**Unit 3.5: Chapter 3 challenge** ⭐ ✅
- A chapter challenge unit: harder problems from Chapter 3 that also use Chapter 2's skills.
- Built: explore — choose the direction of a pull holding a lamp aside (the smallest pull is
  perpendicular to the cable; one direction makes T = W); predict — a crate on cables to
  coordinates, a lamp on a spring between two points (its length gives its force; the lamp's
  weight is found), a pulley on a cable to coordinates; build — slide an anchor along the ceiling
  so neither cable carries over 65% of the crate's weight (same answer for any weight); debug — a
  pulley's FBD on coordinates; concept check (which cable limits first, spring length from
  coordinates, three unknowns, smallest pull, pulley angles, nearly level wires, backwards r);
  solve in two parts — the pulley on coordinates (FBD → equations → answers) and the heaviest crate
  two 500 N cables can hold (choose the limiting cable first).
- When Unit 3.4 (3D) is built, add a 3D situation here too.

### Chapter 4: Moments and static equivalence

**Unit 4.1: Moment of a force** ✅
- Concept: M = F × d (perpendicular distance); sign convention.
- Test ideas: seesaw balance; predict the moment of an angled force two ways
  (components vs. perpendicular distance); find the wrong moment arm.

**Unit 4.2: Varignon's theorem** ⭐ ✅
- Concept: the moment of a force = the sum of the moments of its components, xF_y − yF_x.
- Test ideas: watch each component's moment; aim a pull for a given moment; debug the
  xF_y − yF_x line; moment by components, then d = |M| / F.

**Unit 4.3: Couples** ✅
- Concept: two equal, opposite, offset forces make a pure moment that is the same about any point.
- Test ideas: move the reference point and see the moment stay the same;
  replace a couple with an equivalent one.

**Unit 4.4: Moving a force** ⭐ ✅
- Concept: a force moved to point O needs a couple equal to its moment about O (M = Fd).
- Test ideas: slide O along a beam; a force moved to a bolt; choose where to bolt a plate
  so the couple stays small; debug a forgotten couple.

**Unit 4.5: Equivalent force systems** ✅
- Concept: replace several forces with one resultant force plus a moment.
- Test ideas: find where a single force must act to replace a set of loads.

**Unit 4.6: Distributed loads** ✅
- Concept: a distributed load is replaced by its area, acting at its centroid.
- Covers rectangles, triangles, trapezoids (rectangle + triangle) and curved loads by
  integration (F_R = ∫w dx, x̄ = ∫x w dx / ∫w dx).
- Built: shape a load and watch its resultant; predict a triangular load's resultant;
  spread gravel over a trailer's axle; debug a trapezoid split; solve a curved load.

**Unit 4.7: Moments in 3D** ✅
- Concept: M_O = r × F (cross product); the moment vector points along the turning axis.
- Built (statics.force3d, analysis "moment"; the moment drawn as a double-headed arrow): explore —
  set a force's components at the end of a bent pipe and watch M_O; predict — a rope on the pipe,
  the flagpole cable as a moment (no twist: M_z = 0); build — push so the pipe only twists
  (M_x = M_y = 0) by 60–80 N·m; debug — r backwards, F × r, the j term's lost minus, wrong
  pairing; concept check; solve — a load and a rope on a bracket (r, F, r × F, then ΣM).

**Unit 4.8: Moment about an axis**
- Concept: how hard a force turns something about a given axis (a door about its hinges).

### Chapter 5: Rigid body equilibrium

**Unit 5.1: Supports and free-body diagrams** ✅
- Concept: each support type provides specific reactions (roller, pin, fixed, cable, smooth surface).
- Built: swap the supports and see their reactions; count the unknowns; choose a bridge's
  supports (stable, determinate, free to expand); debug a boom's FBD; draw a beam's FBD
  and find its reactions.

**Unit 5.2: Equilibrium of a rigid body** ✅
- Concept: ΣFx = 0, ΣFy = 0, ΣM = 0; choosing a smart moment point.
- Built: pick the moment point and watch the unknowns in ΣM (and move a load onto the
  overhang); predict the reactions of an overhanging beam and a cantilever with
  distributed loads; place a diving board's fulcrum within three limits; debug a
  student's equations (perpendicular arm, sign, missing weight); concept check on
  smart points; solve an L-shaped jib crane from FBD to reactions.

**Unit 5.3: Alternative equation sets** ⭐ ✅
- Concept: two moment equations plus one force equation (and when that works).
- Built: choose the three equations for a jib crane and watch the unknowns in each (and
  a set that fails); predict reactions one equation each (crane, slanted push); find the
  three moment points (A, B and E, where the roller's line meets the wall line) that give a
  ramp-roller beam one unknown per equation; debug two moment equations; concept check;
  solve a loading ramp, choosing the third equation before writing them.

**Unit 5.4: Stability and determinacy** ✅
- Concept: too few supports → mechanism; too many → indeterminate; improper supports.
- Built: add supports at three places (unstable / determinate / degree of indeterminacy);
  predict n and the degree; hold a beam with three rollers only (parallel and concurrent
  traps, lift-off); debug a student's classification working; solve a beam on a pin and
  a roller on a 30° incline.

**Unit 5.5: Two-force and three-force members** ✅
- Concept: two-force members carry force along their line; three forces must be concurrent or parallel.
- Built: a shelf on a link (tie or prop) with the three lines of action meeting at O;
  predict a pin force's direction from geometry; prop a shelf within three limits;
  debug an FBD with components at a link; solve a boom propped by a strut.

**Unit 5.6: Rigid body equilibrium in 3D**
- Concept: six equations; supports in space (ball-and-socket, journal bearings).

### Chapter 6: Equilibrium of structures

**Unit 6.1: Trusses, method of joints** ✅
- Concept: pin-jointed members in pure tension or compression; solve joint by joint.
- Built: a bridge truss coloured red (tension) / blue (compression) as the load moves;
  predict member forces (apex load, load plus wind); choose a roof truss's height within
  a member rating; debug a joint's two equations; solve a wall truss at its loaded joint.

**Unit 6.2: Zero-force members** ⭐ ✅
- Concept: spot members that carry no force by inspection, before solving.
- Built: move the load around a Pratt bridge and see which members go idle, with the
  joint-by-joint working; count zero members and find a member force (bridge loaded
  below or on top, a wall bracket whose roller pushes along a member); choose the bracing
  so thin rods only pull and the posts stay idle (Pratt); debug a student's inspection
  (a loaded joint, a support joint, members not in line, the wrong member); concept
  check; solve: spot the idle members, then joint A and B.

**Unit 6.3: Trusses, method of sections** ✅
- Concept: cut through the truss and solve for up to three members directly.
- Built: cut the bridge (or try a cut that doesn't split it) and pick the moment point,
  watching which member forces each equation holds; predict two members with one
  equation each (one load, two loads); plan a cut and point that give F_GH alone; debug a
  section's equations; concept check; solve the right part of a two-load bridge.

**Unit 6.4: Frames and machines** ✅
- Concept: multi-body structures with multi-force members; take them apart into separate FBDs.
- Built (all on a stepladder / A-frame): take it apart and see the equal and opposite pin
  forces, raise the crossbar, move the load; predict the floor's push and the crossbar's
  pull (load at the top, load on a leg); place an A-frame hoist's chain within its rating
  and the headroom; debug leg BC's equations (the reversed pin force); concept check;
  solve leg BC after spotting the two-force member.
- Still to add: pliers and a crane arm (a machine and a second frame shape).

### Chapter 7: Centroids and centers of gravity

**Unit 7.1: Centroids and center of gravity** ✅
- Concept: composite shapes; where the weight acts.
- Built: stretch an L-plate and watch C move (even off the plate); predict centroids of an
  L-plate, a tee, a ramp block (rectangle + triangle), an arch (rectangle + half circle)
  and a bracket's centre of gravity (by weight, not area); size a sign so it balances on a
  pin; debug a centroid table; concept check; solve a shop sign (rectangle + triangle +
  half circle), choosing the split first.

**Unit 7.2: Composite shapes with holes** ✅
- Concept: a hole counts as negative area.
- Built: move and resize a hole in a plate and watch C run away from it; predict a plate
  with a hole (area and x̄), an L found as a square minus a square, a notched plate and a
  link plate; drill a hole where it makes a plate balance on a pin; debug a table with a
  notch and a hole (a hole added, the 4r/3π slip, a hole left out); concept check; solve
  the link plate (rectangle + half circle − hole), choosing the split first.

### Chapter 8: Internal forces

**Unit 8.1: Internal forces at a point** ✅
- Concept: cut a beam; the cut face carries normal force N, shear V, moment M.
- Sign convention (textbook): N + tension; V + down on a left piece's face (up on a right
  piece's); M + concave up (a smile) — counterclockwise on a left piece's face.
- Built: slide a cut (and the load) along a beam and watch N, V, M on the pulled-apart
  pieces; predict N, V, M on a shelf beam, a cantilever (right piece, no reactions), an
  overhang and a beam with a slanted load (N ≠ 0); place a bolted splice where M ≈ 0 (the
  point of contraflexure); debug a left piece's equations (V's sign, the load's centroid,
  the load missing, A_y's sign); concept check; solve a balcony beam, choosing the piece.

**Unit 8.2: Shear and moment diagrams** ✅
- Concept: V and M along a beam; relationships dV/dx = −w, dM/dx = V.
- Built: move a point load and change a uniform load and watch both diagrams; predict the
  largest moment (and where) on a shelf beam, a uniform span, a half-loaded beam, an
  overhang (the negative moment over B wins) and a cantilever; place the roller so the sag
  and the overhang's hogging balance under a limit; debug a student's walk along the beam
  (a jump the wrong way, a triangle's area without the ½, the area under V's sign);
  concept check; solve a loading dock beam: the diagrams' shapes, then M_max and where.
- Test ideas: sketch the diagram, then compare; find the max moment location.
- ⭐ Jumps in the diagrams: V jumps at point loads, M jumps at applied couples.
- Bridge to later: this feeds "stress at a point" in mechanics of materials.

**Unit 8.3: V(x) and M(x) equations** ✅
- Concept: write V(x) and M(x) as equations for each segment.
- Built: slide a section along a beam and read its segment's V(x), M(x) and their values;
  predict coefficients (half-loaded beam, uniform span, a point load's second segment, a
  triangular load); place a second load so the middle is in pure bending (V = 0); debug a
  student's segment equations (the ½ dropped, x instead of (x − a), a sign, a missing force);
  concept check; solve an overhanging beam: choose each segment's V(x) and M(x), then use them.

### Chapter 9: Friction

**Unit 9.1: Dry friction** ✅
- Concept: friction is only what equilibrium needs, up to $|F| \le \mu_s N$; at impending
  motion $F = \mu_s N$ against the motion; sliding $F = \mu_k N$.
- Built: tilt a ramp, change μs and push a crate, watching N, the friction needed and μs N
  (the steepest ramp that holds, a push that holds it, friction down the slope, no friction);
  predict N and F on a crate that holds, the slip angle (tan θ = μs), the push or pull that
  starts a crate on a floor (angled down / a sled's rope angled up) and up a ramp; set a push
  that holds a crate on a too-steep ramp (the whole range works); debug a student's working
  (N = W, sin/cos swapped, F = μs N though it holds, μs W, friction's direction); concept
  check; solve a painter's ladder on a rough floor against a smooth wall (FBD → equations →
  N_B, F_A, N_A and the smallest μs that holds).
- Axes on a ramp: x' up the slope, y' across it; F positive up the slope (to the right on a floor).

**Unit 9.2: Tipping versus slipping** ⭐
- Concept: which happens first, and why.

**Unit 9.3: Wedges and belt friction**
- Concept: wedges; belt friction T2 = T1·e^(μβ).
- Test ideas: how many wraps of rope hold a boat.

### Chapter 10: Moments of inertia

**Unit 10.1: Area moments of inertia**
- Concept: I = ∫y² dA; parallel axis theorem.
- Test ideas: compare I-beam vs. rectangle of the same area.
- Bridge to later: needed for bending stress.

---

## Automatic controls (follows Nise, Control Systems Engineering, 7th ed.)

The owner is taking this course. Chapters follow Nise chapter for chapter
(content/controls/course.js); every unit is listed on the course page as
"Coming soon" until it is built. Same rules as statics: one concept per unit,
six stages each, hand-checked tests.

**Engine for controls** (general tools in core/ and render/). Built for chapter 5:
polynomials and transfer functions (core/poly.js), symbolic algebra (core/symbolic.js),
block diagrams drawn from a tree, signal-flow graphs (render/blocks.js).
Still needed for later chapters:
- a plot shape: curves against time or frequency, with axes and grid (step
  responses, Bode plots), and markers (%OS, Ts, Tp read off the curve);
- an s-plane shape: poles (×) and zeros (○), the jω axis, root locus branches;
- block diagrams: boxes, summing junctions and arrows;
- math: polynomial roots, partial fractions, step response by simulation.

How the six challenge types fit controls (examples):
- explore: sliders for ζ and ω_n (or K) and watch the step response and poles move;
- predict: %OS, settling time, a steady-state error, a range of stable K;
- build: tune K or a compensator to meet specs (e.g. %OS < 10%, Ts < 2 s);
- debug: a wrong block-diagram reduction, a wrong Routh row, a wrong asymptote;
- concept-check: what a pole's location means, which system type removes a ramp error;
- solve: a full textbook problem, step by step.

### Chapter 1: Introduction
1.1 Open and closed loop · 1.2 What a control system must do (transient, steady state, stability)

### Chapter 2: Modeling in the frequency domain
2.1 Laplace transforms · 2.2 Transfer functions · 2.3 Electrical networks ·
2.4 Translational mechanical systems · 2.5 Rotational systems and gears ·
2.6 Electromechanical systems (DC motor) · 2.7 Linearization

### Chapter 3: Modeling in the time domain
3.1 State-space representation · 3.2 Transfer functions and state space

### Chapter 4: Time response
4.1 Poles, zeros and the response · 4.2 First-order systems · 4.3 Second-order systems ·
4.4 Underdamped specifications (%OS, Tp, Ts, Tr) · 4.5 Higher-order systems (dominant poles)

### Chapter 5: Reduction of multiple subsystems ✅
5.1 Block diagram reduction ✅ (step-by-step collapse; closed loops with numbers; tune K and
rate feedback; find the wrong step; reduce, then T(s)) ·
5.2 Signal-flow graphs and Mason's rule ✅ (trace paths, loops, non-touching loops; count, then
Δ and T; set a feedback gain; check a student's Mason's rule; Mason step by step)

### Chapter 6: Stability
6.1 Stability and pole locations · 6.2 Routh–Hurwitz criterion · 6.3 Stability with a gain

### Chapter 7: Steady-state errors
7.1 Steady-state error · 7.2 System type and error constants · 7.3 Errors from disturbances

### Chapter 8: Root locus techniques
8.1 Sketching the root locus · 8.2 Refining the sketch · 8.3 Transient response via gain

### Chapter 9: Design via root locus
9.1 Improving steady-state error (PI, lag) · 9.2 Improving transient response (PD, lead) ·
9.3 PID and lag-lead design

### Chapter 10: Frequency response techniques
10.1 Frequency response · 10.2 Bode plots · 10.3 Nyquist criterion · 10.4 Gain and phase margins

### Chapter 11: Design via frequency response
11.1 Transient response via gain · 11.2 Lag compensation · 11.3 Lead compensation

### Chapter 12: Design via state space
12.1 Controllability and pole placement · 12.2 Observers

### Chapter 13: Digital control systems
13.1 Sampling and the z-transform · 13.2 Digital stability and design

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
