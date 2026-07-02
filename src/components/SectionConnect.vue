<template>
  <section id="connect" class="section connect" data-section="connect">
    <p class="eyebrow">connect</p>
    <!-- the ONE place where chrome type takes the lead -->
    <a class="email accent" href="mailto:carefulka@gmail.com">carefulka@gmail.com</a>
    <div class="links">
      <a href="https://github.com/XLasel" target="_blank" rel="noopener">github</a>
      <!-- TODO: linkedin / telegram / etc -->
    </div>
  </section>
</template>

<style scoped>
.connect { align-items: center; text-align: center; }
.email {
  margin-top: .4em;
  font-size: clamp(28px, 5.5vw, 96px);
  text-decoration: none;
}
.links { margin-top: 3em; display: flex; gap: 2.5em; }
.links a {
  color: var(--ink); font-size: 13px; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase;
  opacity: .7; text-decoration: none; transition: opacity .25s;
}
.links a:hover { opacity: 1; }
</style>
