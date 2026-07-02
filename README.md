# soft-matter

ekaterina bulgakova — personal site. One living chrome substance over a sunset sky.

## Run

```bash
npm install
npm run dev
```

## Structure

```
src/
  App.vue                  canvas + sections + section observer
  styles/base.css          design tokens (palette, fonts, grain, layout)
  components/              DOM layer: nav + 5 sections (hero/about/approach/notes/connect)
  webgl/
    Experience.js          renderer, camera, loop, pointer, setSection()
    environment.js         what the chrome reflects — swap point for your HDRI
    chromeMaterial.js      the one shared liquid-chrome material (onBeforeCompile)
    Blob.js                hero blob + satellites, extension points
    shaders/noise.js       GLSL simplex noise
```

Principles baked in: chrome lives on shapes, type stays matte (`.accent` = the rare exception);
one material + one env map = one substance; form in Blender, life in shaders.

## Roadmap (in order, each maps to a Three.js Journey lesson)

1. **Your own sky** — bake an equirect HDRI in Blender (gradient + soft clouds + 1-2 bright
   sun emitters), drop into `public/env/sky.hdr`, swap in `environment.js` (instructions
   inside). Lesson: *Environment map*.
2. **The wave** — subdivided PlaneGeometry + layered noise displacement, same
   `chromeMaterial`. Lessons: *Shaders → Shader patterns → Raging Sea → Modified materials*.
3. **Sculpted curls that keep changing** — model one wave mesh in Blender, add 3-5 shape
   keys (same topology!), export GLB to `public/models/`, drive
   `mesh.morphTargetInfluences` with slow noise. Macro form = morph targets,
   micro life = shader noise on top.
4. **Touch texture** — replace the gaussian `uMouse` bump with a ping-pong FBO trail the
   cursor paints into (decays + diffuses), used as displacement. Search: *touch texture
   displacement*, Codrops. Lesson (advanced): *GPGPU flow field*.
5. **Melt transitions** — stars/tori as Blender meshes with the shared material; on contact
   with the wave: raise noise amplitude on the mesh, raise a bump in the wave, scale/fade
   out. Staged, cheap, reads as one substance.
6. **Per-section states** — flesh out `Experience.setSection()`: camera, uAmp, morph
   weights per section, so the matter flows through the whole site.

## Content TODO

- [ ] about: your text (personality + one line of experience)
- [ ] approach: 3-4 real principles
- [ ] notes: first 2-3 real notes
- [ ] connect: linkedin/telegram links
