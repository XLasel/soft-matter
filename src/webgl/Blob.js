import * as THREE from 'three'
import { createChromeMaterial } from './chromeMaterial.js'

/**
 * Hero blob + chrome satellites.
 *
 * EXTENSION POINTS (see README roadmap):
 * - Wave: same displacement idea on a subdivided PlaneGeometry ("Raging Sea" lesson)
 * - Morph targets: load a GLB with shape keys, drive mesh.morphTargetInfluences
 *   with slow noise to wander between sculpted curls
 * - Touch texture: replace uMouse gaussian bump with a ping-pong FBO trail
 */
export function createBlob() {
  const group = new THREE.Group()

  const uniforms = {
    uTime:  { value: 0 },
    uAmp:   { value: 0.30 },
    uMouse: { value: new THREE.Vector3(0, 0, 1) },
    uHover: { value: 0 },
  }

  const material = createChromeMaterial(uniforms)
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 96), material)
  group.add(blob)

  const satMaterial = createChromeMaterial(null, { displaced: false })
  const sats = [
    { r: 1.9,  size: .085, speed: .45, tilt: .5,  phase: 0 },
    { r: 2.25, size: .055, speed: -.3, tilt: -.9, phase: 2.1 },
    { r: 1.65, size: .04,  speed: .7,  tilt: 1.4, phase: 4.2 },
  ].map((cfg) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(cfg.size, 32, 24), satMaterial)
    group.add(m)
    return { m, ...cfg }
  })

  function update(t, { tiltX = 0, tiltY = 0 } = {}) {
    uniforms.uTime.value = t
    blob.rotation.y = t * 0.12 + tiltY * 0.6
    blob.rotation.x += (tiltX - blob.rotation.x) * 0.05
    blob.position.y = Math.sin(t * 0.6) * 0.05
    for (const s of sats) {
      const a = t * s.speed + s.phase
      s.m.position.set(
        Math.cos(a) * s.r,
        Math.sin(a * 0.9) * Math.sin(s.tilt) * 0.9,
        Math.sin(a) * s.r * 0.55,
      )
    }
  }

  return { group, uniforms, update }
}
