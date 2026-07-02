import * as THREE from 'three'
import { simplexNoise3D } from './shaders/noise.js'

/**
 * One shared "liquid chrome" material = one substance across the whole site.
 * Displacement is injected into MeshPhysicalMaterial via onBeforeCompile
 * (see Bruno Simon's "Modified materials" lesson), so reflections,
 * iridescence and env lighting keep working.
 */
export function createChromeMaterial(uniforms, { displaced = true } = {}) {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.07,
    envMapIntensity: 1.35,
    clearcoat: 0.6,
    clearcoatRoughness: 0.12,
    iridescence: 0.35,
    iridescenceIOR: 1.3,
  })

  if (!displaced) return material

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader =
      simplexNoise3D +
      /* glsl */ `
      uniform float uTime; uniform float uAmp; uniform vec3 uMouse; uniform float uHover;
      vec3 displace(vec3 p){
        vec3 nrm = normalize(p);
        float t = uTime * 0.28;
        float n = snoise(nrm * 1.55 + vec3(t, t*0.8, -t*0.6));
        n += 0.45 * snoise(nrm * 3.3 - vec3(t*1.35, -t, t*0.7));
        float d = distance(nrm, normalize(uMouse));
        float bump = exp(-d * d * 5.0) * uHover;
        return p + nrm * (n * uAmp + bump * 0.32);
      }
      ` +
      shader.vertexShader
        .replace('#include <beginnormal_vertex>', /* glsl */ `
          vec3 dPos = displace(position);
          vec3 orthoV = abs(normal.x) > 0.9 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0);
          vec3 tDir = normalize(cross(normal, orthoV));
          vec3 bDir = normalize(cross(normal, tDir));
          float epsN = 0.05;
          vec3 dT = displace(position + tDir * epsN);
          vec3 dB = displace(position + bDir * epsN);
          vec3 objectNormal = normalize(cross(dT - dPos, dB - dPos));
        `)
        .replace('#include <begin_vertex>', /* glsl */ `vec3 transformed = dPos;`)
  }

  return material
}
