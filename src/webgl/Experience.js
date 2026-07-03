import * as THREE from 'three'
import { buildEnvironment } from './environment.js'
import { createBlob } from './Blob.js'
import { createMotherForm } from './MotherForm.js'
import { attachDebugControls } from './debugControls.js'

/**
 * Matter mode switch (rough toggle for now):
 *   'mother' — marching cubes metaball substance: droplets pinch off & merge,
 *              holes open & heal, cursor is a field source (MotherForm.js)
 *   'blob'   — the original displaced icosphere + satellites (Blob.js)
 */
const MATTER = 'mother'

/**
 * Owns renderer / scene / camera / loop.
 * One instance per page, created in App.vue onMounted.
 */
export class Experience {
  constructor(canvas) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50)
    this.camera.position.set(0, 0, 3.6)

    // start HDR load early — chrome is fully metallic and reads black without env
    const envReady = buildEnvironment(this.renderer)

    this.matter = MATTER === 'mother' ? createMotherForm() : createBlob()
    this.scene.add(this.matter.group)

    // screen placement — positive X = right, positive Y = up (world units)
    this.layout = { offsetX: 0.75, offsetY: 0.28, offsetZ: 0 }

    // pointer state
    this.mouseTarget = new THREE.Vector3(0, 0, 1) // direction, used by blob
    this.pointerNdc = new THREE.Vector2(0, 0)     // raw NDC, used by mother form
    this.pointerActive = false
    this.hover = 0
    this.hoverTarget = 0
    this.tiltX = 0
    this.tiltY = 0

    this._onMove = (e) => {
      const nx = (e.clientX / innerWidth) * 2 - 1
      const ny = -(e.clientY / innerHeight) * 2 + 1
      this.pointerNdc.set(nx, ny)
      this.pointerActive = true
      this.mouseTarget.set(nx * 1.4, ny * 1.0, 0.9).normalize()
      this.hoverTarget = 0.85
      this.tiltX = ny * 0.12
      this.tiltY = nx * 0.2
    }
    this._onDown = () => { this.hoverTarget = 1.6 }
    this._onUp = () => { this.hoverTarget = 0.85 }
    this._onResize = () => this.resize()
    addEventListener('pointermove', this._onMove)
    addEventListener('pointerdown', this._onDown)
    addEventListener('pointerup', this._onUp)
    addEventListener('resize', this._onResize)

    this.clock = new THREE.Clock()
    this._ray = new THREE.Vector3()
    this._cursorWorld = new THREE.Vector3()
    this.resize()

    // reflections + lighting; page CSS gradient stays visible until the first frame
    envReady
      .then((envMap) => {
        this.scene.environment = envMap
        this.scene.environmentRotation.set(-0.1, Math.PI * 0.1, 0)
      })
      .catch((err) => console.error('Failed to load environment map', err))
      .finally(() => {
        if (!this._disposed) this.renderer.setAnimationLoop(() => this.tick())
      })

    this._debug = attachDebugControls(this)
  }

  /**
   * Called by the section IntersectionObserver in App.vue.
   * TODO: drive the matter per section — e.g. droplet reach, camera, isolation —
   * so one substance flows through the whole site.
   */
  setSection(name) {
    this.section = name
    this._ampTarget = name === 'hero' ? 0.30 : 0.18
  }

  /** pointer NDC → world point on the z=0 plane (where the matter lives) */
  cursorWorld() {
    this._ray.set(this.pointerNdc.x, this.pointerNdc.y, 0.5).unproject(this.camera)
    this._ray.sub(this.camera.position).normalize()
    const dist = -this.camera.position.z / this._ray.z
    return this._cursorWorld.copy(this.camera.position).addScaledVector(this._ray, dist)
  }

  tick() {
    const t = this.clock.getElapsedTime()
    this.hover += (this.hoverTarget - this.hover) * 0.07

    const g = this.matter.group
    g.position.set(this.layout.offsetX, this.layout.offsetY, this.layout.offsetZ)

    if (MATTER === 'mother') {
      const cursor = this.pointerActive ? this.cursorWorld() : null
      this.matter.update(t, { cursor, hover: this.hover })
      // gentle parallax lean toward the pointer
      g.rotation.y += (this.tiltY * 0.3 - g.rotation.y) * 0.04
      g.rotation.x += (-this.tiltX * 0.3 - g.rotation.x) * 0.04
    } else {
      const u = this.matter.uniforms
      u.uMouse.value.lerp(this.mouseTarget, 0.06)
      u.uHover.value += (this.hoverTarget - u.uHover.value) * 0.07
      if (this._ampTarget !== undefined) {
        u.uAmp.value += (this._ampTarget - u.uAmp.value) * 0.04
      }
      this.matter.update(t, { tiltX: this.tiltX, tiltY: this.tiltY })
    }

    // slow env rotation — cheap with scene.environmentRotation (r163+)
    this.scene.environmentRotation.y = t * 0.04
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    this.renderer.setSize(innerWidth, innerHeight)
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
  }

  dispose() {
    this._disposed = true
    this._debug?.dispose()
    this.renderer.setAnimationLoop(null)
    removeEventListener('pointermove', this._onMove)
    removeEventListener('pointerdown', this._onDown)
    removeEventListener('pointerup', this._onUp)
    removeEventListener('resize', this._onResize)
    this.scene.environment?.dispose()
    this.renderer.dispose()
  }
}
