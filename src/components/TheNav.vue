<template>
  <header class="nav">
    <a class="mark" href="#hero">ekaterina bulgakova</a>
    <nav>
      <a href="#about">about</a>
      <a href="#approach">approach</a>
      <a href="#notes">notes</a>
      <a href="#connect">connect</a>
    </nav>
  </header>
</template>

<style scoped>
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 30;
  display: flex; justify-content: space-between; align-items: baseline;
  padding: var(--pad);
  pointer-events: none;
}
.mark {
  font-family: var(--font-display); font-weight: 500;
  font-size: 15px; letter-spacing: .06em;
  color: var(--ink); text-decoration: none;
  pointer-events: auto;
}
nav { display: flex; gap: 2.2em; }
nav a {
  pointer-events: auto;
  color: var(--ink); text-decoration: none;
  font-size: 13px; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase;
  opacity: .7; transition: opacity .25s;
}
nav a:hover { opacity: 1; }
@media (max-width: 720px) { nav { display: none; } }
</style>
