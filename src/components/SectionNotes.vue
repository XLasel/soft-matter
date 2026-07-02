<template>
  <section id="notes" class="section" data-section="notes">
    <p class="eyebrow">notes</p>
    <h2 class="display">Thoughts, studies, experiments.</h2>
    <div class="list">
      <!-- TODO: real notes — observations on craft, Three.js Journey studies,
           Blender experiments. This section replaces the portfolio:
           it shows taste and depth without commercial cases. -->
      <article v-for="note in notes" :key="note.title" class="note">
        <h3>{{ note.title }}</h3>
        <p>{{ note.teaser }}</p>
        <span class="date">{{ note.date }}</span>
      </article>
    </div>
  </section>
</template>

<script setup>
const notes = [
  { title: 'Why chrome feels alive', teaser: 'On environment maps and what the eye actually reads in a reflection.', date: 'jul 2026' },
  { title: 'Study: raging sea', teaser: 'Layered noise displacement — first steps toward the wave.', date: 'jul 2026' },
  { title: 'Form in Blender, life in shaders', teaser: 'Where sculpting ends and math begins.', date: 'jul 2026' },
]
</script>

<style scoped>
h2 { font-size: clamp(36px, 5vw, 88px); }
.list { margin-top: 2.5em; display: grid; gap: 1px; max-width: 44em; }
.note {
  padding: 1.6em 0; border-top: 1px solid rgba(43, 36, 64, .15);
  transition: opacity .25s; cursor: pointer;
}
.note:hover { opacity: .65; }
.note h3 { font-family: var(--font-display); font-weight: 500; font-size: 24px; }
.note p { margin-top: .5em; color: var(--ink-soft); line-height: 1.6; }
.date { display: block; margin-top: .8em; font-size: 12px; letter-spacing: .15em; text-transform: uppercase; color: var(--ink-soft); }
</style>
