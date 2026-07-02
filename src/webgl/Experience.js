import * as THREE from 'three'
import { buildEnvironment } from './environment.js'
import { createBlob } from './Blob.js'

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

    this.blob = createBlob()
    this.scene.add(this.blob.group)

    // reflections + lighting; page CSS gradient stays as the visible background
    buildEnvironment(this.renderer).then((envMap) => {
      this.scene.environment = envMap
      this.scene.environmentRotation.set(-0.1, Math.PI * 0.1, 0)
    })

    // pointer state
    this.mouseTarget = new THREE.Vector3(0, 0, 1)
    this.hoverTarget = 0
    this.tiltX = 0
    this.tiltY = 0

    this._onMove = (e) => {
      const nx = (e.clientX / innerWidth) * 2 - 1
      const ny = -(e.clientY / innerHeight) * 2 + 1
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
    this.resize()
    this.renderer.setAnimationLoop(() => this.tick())
  }

  /**
   * Called by the section IntersectionObserver in App.vue.
   * TODO: drive the matter per section — e.g. morph target weights,
   * camera position, uAmp — so one substance flows through the whole site.
   */
  setSection(name) {
    this.section = name
    // example placeholder: calmer matter outside the hero
    const amp = name === 'hero' ? 0.30 : 0.18
    this._ampTarget = amp
  }

  tick() {
    const t = this.clock.getElapsedTime()
    const u = this.blob.uniforms
    u.uMouse.value.lerp(this.mouseTarget, 0.06)
    u.uHover.value += (this.hoverTarget - u.uHover.value) * 0.07
    if (this._ampTarget !== undefined) {
      u.uAmp.value += (this._ampTarget - u.uAmp.value) * 0.04
    }
    // slow env rotation — cheap with scene.environmentRotation (r163+)
    this.scene.environmentRotation.y = t * 0.04
    this.blob.update(t, { tiltX: this.tiltX, tiltY: this.tiltY })
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    this.renderer.setSize(innerWidth, innerHeight)
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
  }

  dispose() {
    this.renderer.setAnimationLoop(null)
    removeEventListener('pointermove', this._onMove)
    removeEventListener('pointerdown', this._onDown)
    removeEventListener('pointerup', this._onUp)
    removeEventListener('resize', this._onResize)
    this.scene.environment?.dispose()
    this.renderer.dispose()
  }
}
