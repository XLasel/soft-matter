import * as THREE from 'three'
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import { createChromeMaterial } from './chromeMaterial.js'

/**
 * The mother form — one liquid chrome substance built from a metaball field.
 * Topology is free here: droplets pinch off and merge back on their own,
 * negative balls carve holes that open and heal. The mesh is rebuilt every
 * frame (CPU), so keep `resolution` moderate; lower it on mobile.
 *
 * All coordinates passed to addBall() live in field space [0..1]^3;
 * the rendered mesh spans local [-1..1] * mc.scale.
 */
export function createMotherForm() {
  const params = {
    scale: 1.95,         // overall size on screen (mc.scale)
    resolution: 72,     // field grid; 48–80 is the sane range
    isolation: 80,      // surface threshold — lower = fatter matter

    // --- liquid line along a spline (field space [0..1]³) ---
    pathEnabled: true,
    pathSamples: 28,       // more → smoother merged tube
    pathStrength: 0.36,
    pathSubtract: 9,       // lower than core subtract → softer merge into one line
    pathSpeed: 0.055,      // pulse / snake travel along the curve
    pathFlowAmp: 0.22,     // traveling bulge on the tube
    pathSnake: false,      // true = a segment crawls along; false = full merged line
    pathSnakeSpan: 0.55,   // how much of the curve the snake occupies (0..1)
    pathPoints: [
      { x: 0.38, y: 0.40, z: 0.50 },
      { x: 0.46, y: 0.50, z: 0.52 },
      { x: 0.54, y: 0.56, z: 0.50 },
      { x: 0.62, y: 0.50, z: 0.48 },
      { x: 0.70, y: 0.58, z: 0.50 },
    ],

    fieldMargin: 0.04,  // keep metaballs off the marching-cubes box walls

    coreBalls: 0,       // 0 = off; nucleus is optional when path is the main form
    coreStrength: 0.7,
    coreRadius: 0.11,   // how far the nucleus balls wander (field units)
    droplets: 0,        // satellites that pinch off and return
    dropletStrength: 0.34,
    dropletReach: 0.36, // how far a droplet travels before returning
    dropletSpeed: 0.07, // cycles per second (slow!)
    hole: false,        // negative ball sweeping through → hole opens & heals
    holePeriod: 16,     // seconds between passes
    holeStrength: -0.55,
    subtract: 12,

    // --- interactive bead: matter the cursor can steal and give back ---
    beadStrength: 0.22,
    beadFollow: 0.09,        // spring toward cursor; lower = laggier, easier to lose
    beadAttract: 0.12,       // max pull per frame toward an attractor
    beadAttractRadius: 0.22, // attraction starts working inside this distance
    beadPickupCore: 0.26,    // come this close to the nucleus → it beads out to you
    beadPickupDroplet: 0.14, // same for free-floating droplets
    beadAbsorbDist: 0.11,    // bead this close to matter can be reclaimed...
    beadBreakDist: 0.17,     // ...if the cursor is farther than this (yank away!)
    beadCooldown: 1.0,       // seconds before matter offers a new bead
  }

  const material = createChromeMaterial(null, { displaced: false })
  const mc = new MarchingCubes(params.resolution, material, false, false, 90000)
  mc.isolation = params.isolation
  mc.scale.setScalar(params.scale)

  const group = new THREE.Group()
  group.add(mc)

  const _local = new THREE.Vector3()
  const _pathPos = new THREE.Vector3()
  const pathCurve = new THREE.CatmullRomCurve3(
    params.pathPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
  )

  function syncPathCurve() {
    for (let i = 0; i < params.pathPoints.length; i++) {
      const p = params.pathPoints[i]
      pathCurve.points[i].set(p.x, p.y, p.z)
    }
  }

  /** metaballs along the spline — dense enough to fuse into one liquid line */
  function addPathTube(t, S) {
    if (!params.pathEnabled) return

    syncPathCurve()
    const n = params.pathSamples
    const sub = params.pathSubtract
    const flow = t * params.pathSpeed

    if (params.pathSnake) {
      const head = flow % 1
      const span = params.pathSnakeSpan
      for (let i = 0; i < n; i++) {
        const u = head - (i / (n - 1)) * span
        if (u < 0 || u > 1) continue
        pathCurve.getPoint(u, _pathPos)
        const tail = i / (n - 1)
        const pulse = 1 + params.pathFlowAmp * Math.sin(t * 1.1 - tail * Math.PI)
        const strength = params.pathStrength * (1 - tail * 0.25) * pulse
        mc.addBall(_pathPos.x, _pathPos.y, _pathPos.z, strength, sub)
      }
      pathCurve.getPoint(head, attractors[0].p)
    } else {
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1)
        pathCurve.getPoint(u, _pathPos)
        // wave runs along the merged tube — reads as matter pulling along the line
        const pulse = 1 + params.pathFlowAmp * Math.sin((u - flow) * Math.PI * 4)
        const breathe = 1 + 0.07 * Math.sin(t * 0.65 + u * 8)
        mc.addBall(_pathPos.x, _pathPos.y, _pathPos.z, params.pathStrength * pulse * breathe, sub)
      }
      const headU = ((flow % 1) + 1) % 1
      pathCurve.getPoint(headU, attractors[0].p)
    }

    attractors[0].r = params.beadPickupCore
  }

  /** world point → field space [0..1], clamped inside the metaball box */
  function worldToField(v) {
    const m = params.fieldMargin
    _local.copy(v)
    mc.worldToLocal(_local)
    return _local.multiplyScalar(0.5).addScalar(0.5).clampScalar(m, 1 - m)
  }

  // attractor slots (field space), refilled every frame: [0] = nucleus, rest = droplets
  const attractors = Array.from({ length: 1 + params.droplets }, () => ({
    p: new THREE.Vector3(), r: 0,
  }))

  function nearestAttractor(p) {
    let best = null
    let bestDist = Infinity
    for (const a of attractors) {
      const d = a.p.distanceTo(p)
      if (d < bestDist) { bestDist = d; best = a }
    }
    return { a: best, dist: bestDist }
  }

  // the bead the cursor can steal — a tiny state machine
  const bead = {
    state: 'idle', // idle | carried | absorbing
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    strength: 0,
    cooldownUntil: 0,
  }

  function updateBead(t, f /* cursor in field space, or null */, hover) {
    const b = bead

    if (b.state === 'idle') {
      // cursor is nothing to the field until it comes close enough —
      // then the matter beads out toward it
      if (f && t > b.cooldownUntil) {
        const { a, dist } = nearestAttractor(f)
        if (a && dist < a.r) {
          b.pos.copy(a.p).lerp(f, 0.7)
          b.strength = 0.01
          b.state = 'carried'
        }
      }
    } else if (b.state === 'carried') {
      b.strength += (params.beadStrength - b.strength) * 0.08
      // spring toward cursor (with lag — that's what makes escape possible)
      if (f) b.pos.lerp(f, params.beadFollow)
      // tug of war: nearby matter pulls the bead back
      const { a, dist } = nearestAttractor(b.pos)
      if (a && dist < params.beadAttractRadius) {
        const pull = params.beadAttract * (1 - dist / params.beadAttractRadius)
        b.pos.lerp(a.p, pull)
      }
      // reclaim: bead близко к материи, а курсор уже успел сбежать
      const dCursor = f ? b.pos.distanceTo(f) : Infinity
      if (dist < params.beadAbsorbDist && dCursor > params.beadBreakDist) {
        b.state = 'absorbing'
        b.target.copy(a.p)
      }
    } else { // absorbing
      b.pos.lerp(b.target, 0.15)
      b.strength *= 0.88
      if (b.strength < 0.02) {
        b.strength = 0
        b.state = 'idle'
        b.cooldownUntil = t + params.beadCooldown
      }
    }

    if (b.strength > 0.015) {
      mc.addBall(b.pos.x, b.pos.y, b.pos.z, b.strength * (0.8 + hover * 0.4), params.subtract)
    }
  }

  function update(t, { cursor = null, hover = 0 } = {}) {
    mc.isolation = params.isolation
    mc.scale.setScalar(params.scale)
    mc.reset()
    const S = params.subtract

    addPathTube(t, S)

    // --- optional breathing nucleus ---
    if (params.coreBalls > 0 && !params.pathEnabled) {
      attractors[0].p.set(0.5, 0.5, 0.5)
      attractors[0].r = params.beadPickupCore
    }
    for (let i = 0; i < params.coreBalls; i++) {
      const o = i * 2.399 // golden-angle offset so balls don't sync
      const r = params.coreRadius * (0.6 + 0.4 * Math.sin(t * 0.5 + o * 2.0))
      mc.addBall(
        0.5 + Math.sin(t * 0.33 + o) * r,
        0.5 + Math.cos(t * 0.27 + o * 1.7) * r,
        0.5 + Math.sin(t * 0.41 + o * 0.9) * r * 0.8,
        params.coreStrength, S,
      )
    }

    // --- droplets: depart → pinch off → float → return → merge ---
    for (let i = 0; i < params.droplets; i++) {
      const phase = (t * params.dropletSpeed + i / params.droplets) % 1
      const travel = Math.pow(Math.sin(Math.PI * phase), 2) // 0 → out → 0
      const reach = 0.06 + params.dropletReach * travel
      const ang = t * 0.15 + i * Math.PI // slow orbital drift
      const dx = 0.5 + Math.cos(ang) * reach
      const dy = 0.5 + Math.sin(ang * 0.7) * reach * 0.6
      const dz = 0.5 + Math.sin(ang) * reach * 0.5
      mc.addBall(dx, dy, dz, params.dropletStrength, S)
      // droplet is also an attractor — you can feed the bead to it
      attractors[1 + i].p.set(dx, dy, dz)
      attractors[1 + i].r = params.beadPickupDroplet
    }

    // --- the hole: a negative ball sweeps through, carving a passage that heals ---
    if (params.hole) {
      const h = (t / params.holePeriod) % 1
      if (h < 0.3) {
        const k = h / 0.3 // 0..1 across the pass
        mc.addBall(
          0.25 + 0.5 * k,
          0.5 + Math.sin(k * Math.PI) * 0.06,
          0.55,
          params.holeStrength, S,
        )
      }
    }

    // --- the stealable bead (cursor no longer carries matter by default) ---
    updateBead(t, cursor ? worldToField(cursor) : null, hover)

    mc.update()
  }

  return { group, mc, params, pathCurve, update }
}
