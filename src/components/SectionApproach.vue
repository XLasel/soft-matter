<template>
  <section id="approach" class="section" data-section="approach">
    <p class="eyebrow">approach</p>
    <h2 class="display">How I think.</h2>
    <ul class="principles">
      <!-- TODO: your real principles, 3-4 max -->
      <li><span class="accent">complex inside, calm outside</span> — engineering rigor should be invisible in the experience</li>
      <li>performance is an aesthetic — 60fps is part of the design, not an afterthought</li>
      <li>interfaces can have character — the things that can't be generated: taste, coherence, intent</li>
    </ul>
  </section>
</template>

<style scoped>
h2 { font-size: clamp(36px, 5vw, 88px); }
.principles { margin-top: 2.5em; list-style: none; max-width: 40em; }
.principles li {
  padding: 1.2em 0; font-size: 18px; line-height: 1.6; color: var(--ink-soft);
  border-top: 1px solid rgba(43, 36, 64, .15);
}
.principles .accent { font-size: 1.1em; }
</style>
