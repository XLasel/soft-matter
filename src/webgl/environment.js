import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'

const ENV_MAP = '/env/pink_sunrise__2_1k.exr'

const loaderHandler = async (path) => {
  if (path.endsWith('.hdr')) {
    return await new RGBELoader().loadAsync(path)
  } else if (path.endsWith('.exr')) {
    return await new EXRLoader().loadAsync(path)
  }

}

/**
 * Bakes an equirectangular HDR into a PMREM env map for MeshPhysicalMaterial.
 * scene.background stays unset — the page CSS gradient remains visible behind WebGL.
 *
 * After load, rotate live via scene.environmentRotation (Three r163+).
 */
export async function buildEnvironment(renderer) {
  const hdri = await loaderHandler(ENV_MAP)
  hdri.mapping = THREE.EquirectangularReflectionMapping
  // hdri.rotation = Math.PI * 0.1 
  hdri.center.set(0.5, 0.5)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envMap = pmrem.fromEquirectangular(hdri).texture
  pmrem.dispose()
  hdri.dispose()

  return envMap
}
