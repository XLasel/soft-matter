<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Experience } from './webgl/Experience.js'
import TheNav from './components/TheNav.vue'
import SectionHero from './components/SectionHero.vue'
import SectionAbout from './components/SectionAbout.vue'
import SectionApproach from './components/SectionApproach.vue'
import SectionNotes from './components/SectionNotes.vue'
import SectionConnect from './components/SectionConnect.vue'

const canvasRef = ref(null)
let experience = null
let observer = null

onMounted(() => {
  experience = new Experience(canvasRef.value)

  // tells the WebGL world which section is on screen
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) experience.setSection(e.target.dataset.section)
      }
    },
    { threshold: 0.5 },
  )
  document.querySelectorAll('[data-section]').forEach((s) => observer.observe(s))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  experience?.dispose()
})
</script>

<template>
  <canvas ref="canvasRef" class="webgl" />
  <TheNav />
  <main>
    <SectionHero />
    <SectionAbout />
    <SectionApproach />
    <SectionNotes />
    <SectionConnect />
  </main>
  <div class="grain" />
</template>
