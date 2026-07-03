import GUI from 'lil-gui'

/**
 * Dev-only panel (press H to hide). Tweaks layout, matter params, camera.
 * Values log to the console when you drag — copy into code when happy.
 */
export function attachDebugControls(experience) {
  if (!import.meta.env.DEV) return null

  const gui = new GUI({ title: 'soft matter', width: 300 })
  const { matter, camera, renderer, layout } = experience
  const p = matter.params

  const log = () => {
    console.log('[soft-matter]', {
      layout: { ...layout },
      scale: p.scale,
      isolation: p.isolation,
      camera: { z: camera.position.z, fov: camera.fov },
      exposure: renderer.toneMappingExposure,
    })
  }

  const layoutFolder = gui.addFolder('Position on screen')
  layoutFolder.add(layout, 'screenX', -1, 1, 0.01).name('X (−1 left … 1 right)').onChange(log)
  layoutFolder.add(layout, 'screenY', -1, 1, 0.01).name('Y (−1 bottom … 1 top)').onChange(log)
  layoutFolder.add(layout, 'depth', -1.5, 1.5, 0.01).name('depth (world Z)').onChange(log)
  layoutFolder.open()

  const sizeFolder = gui.addFolder('Size & surface')
  sizeFolder.add(p, 'scale', 0.4, 3, 0.01).name('overall scale').onChange(log)
  sizeFolder.add(p, 'isolation', 20, 120, 1).name('isolation (lower = fatter)').onChange(log)
  sizeFolder.open()

  const pathFolder = gui.addFolder('Path curve')
  pathFolder.add(p, 'pathEnabled').name('enabled')
  pathFolder.add(p, 'pathSamples', 8, 40, 1).name('balls (merge ↑)')
  pathFolder.add(p, 'pathStrength', 0.1, 0.8, 0.01).name('thickness')
  pathFolder.add(p, 'pathSubtract', 4, 14, 1).name('merge softness ↓')
  pathFolder.add(p, 'pathSpeed', 0, 0.2, 0.005).name('flow speed')
  pathFolder.add(p, 'pathFlowAmp', 0, 0.5, 0.01).name('flow bulge')
  pathFolder.add(p, 'pathSnake').name('snake mode')
  pathFolder.add(p, 'pathSnakeSpan', 0.2, 0.95, 0.01).name('snake length')
  p.pathPoints.forEach((pt, i) => {
    const ptFolder = pathFolder.addFolder(`point ${i}`)
    ptFolder.add(pt, 'x', 0.05, 0.95, 0.01)
    ptFolder.add(pt, 'y', 0.05, 0.95, 0.01)
    ptFolder.add(pt, 'z', 0.2, 0.8, 0.01)
  })
  pathFolder.add(p, 'fieldMargin', 0.02, 0.12, 0.005).name('field safe margin')
  pathFolder.open()

  const coreFolder = gui.addFolder('Nucleus')
  coreFolder.add(p, 'coreStrength', 0.1, 1.2, 0.01)
  coreFolder.add(p, 'coreRadius', 0.02, 0.3, 0.005)

  const dropFolder = gui.addFolder('Droplets')
  dropFolder.add(p, 'dropletStrength', 0.05, 0.8, 0.01)
  dropFolder.add(p, 'dropletReach', 0.05, 0.7, 0.01)
  dropFolder.add(p, 'dropletSpeed', 0.02, 0.2, 0.005)

  const holeFolder = gui.addFolder('Hole')
  holeFolder.add(p, 'hole')
  holeFolder.add(p, 'holePeriod', 4, 40, 0.5)
  holeFolder.add(p, 'holeStrength', -1.2, -0.1, 0.01)

  const beadFolder = gui.addFolder('Bead (cursor steal)')
  beadFolder.add(p, 'beadStrength', 0.05, 0.6, 0.01)
  beadFolder.add(p, 'beadFollow', 0.02, 0.25, 0.005).name('follow cursor')
  beadFolder.add(p, 'beadAttract', 0.02, 0.35, 0.01).name('matter pull back')
  beadFolder.add(p, 'beadPickupCore', 0.08, 0.45, 0.01).name('pickup radius (core)')
  beadFolder.add(p, 'beadBreakDist', 0.08, 0.35, 0.01).name('yank-away distance')

  const camFolder = gui.addFolder('Camera & light')
  const camState = { distance: camera.position.z, fov: camera.fov, exposure: renderer.toneMappingExposure }
  camFolder.add(camState, 'distance', 2, 10, 0.05).name('distance').onChange((v) => {
    camera.position.z = v
    log()
  })
  camFolder.add(camState, 'fov', 20, 70, 1).onChange((v) => {
    camera.fov = v
    camera.updateProjectionMatrix()
    log()
  })
  camFolder.add(camState, 'exposure', 0.4, 2.5, 0.05).onChange((v) => {
    renderer.toneMappingExposure = v
    log()
  })

  gui.add({ copy: log }, 'copy').name('Log values to console')

  let visible = true
  const onKey = (e) => {
    if (e.key === 'h' || e.key === 'H') {
      visible = !visible
      gui.domElement.style.display = visible ? '' : 'none'
    }
  }
  addEventListener('keydown', onKey)

  return {
    gui,
    dispose() {
      removeEventListener('keydown', onKey)
      gui.destroy()
    },
  }
}
