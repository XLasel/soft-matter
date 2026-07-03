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
    resolution: 56,     // field grid; 48–80 is the sane range
    isolation: 80,      // surface threshold — lower = fatter matter
    coreBalls: 4,       // the breathing nucleus
    coreStrength: 0.7,
    coreRadius: 0.11,   // how far the nucleus balls wander (field units)
    droplets: 2,        // satellites that pinch off and return
    dropletStrength: 0.34,
    dropletReach: 0.36, // how far a droplet travels before returning
    dropletSpeed: 0.07, // cycles per second (slow!)
    hole: true,         // negative ball sweeping through → hole opens & heals
    holePeriod: 16,     // seconds between passes
    holeStrength: -0.55,
    cursorStrength: 0.3,
    subtract: 12,
  }

  const material = createChromeMaterial(null, { displaced: false })
  const mc = new MarchingCubes(params.resolution, material, false, false, 90000)
  mc.isolation = params.isolation
  mc.scale.set(1.6, 1.6, 1.6)

  const group = new THREE.Group()
  group.add(mc)

  const _local = new THREE.Vector3()

  /** world point → field space [0..1], clamped so the ball stays inside the box */
  function worldToField(v) {
    _local.copy(v)
    mc.worldToLocal(_local)
    return _local.multiplyScalar(0.5).addScalar(0.5).clampScalar(0.08, 0.92)
  }

  function update(t, { cursor = null, hover = 0 } = {}) {
    mc.reset()
    const S = params.subtract

    // --- breathing nucleus ---
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
      mc.addBall(
        0.5 + Math.cos(ang) * reach,
        0.5 + Math.sin(ang * 0.7) * reach * 0.6,
        0.5 + Math.sin(ang) * reach * 0.5,
        params.dropletStrength, S,
      )
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

    // --- cursor as a field source: matter reaches for the pointer ---
    if (cursor) {
      const f = worldToField(cursor)
      mc.addBall(f.x, f.y, f.z, params.cursorStrength * (0.4 + hover), S)
    }

    mc.update()
  }

  return { group, mc, params, update }
}
