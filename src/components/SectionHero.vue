<template>
  <section id="hero" class="section hero" data-section="hero">
    <div class="bottom">
      <div>
        <p class="eyebrow">frontend developer · crafting smooth, meaningful interfaces</p>
        <h1 class="display">
          I bring <em class="accent">energy</em><br>
          to make things<br>
          feel <em class="accent">effortless.</em>
        </h1>
      </div>
      <p class="tagline">complex inside.<br><b>calm outside.</b></p>
    </div>
    <div class="scroll-hint">scroll to enter</div>
  </section>
</template>

<style scoped>
.hero { justify-content: flex-end; }
.bottom {
  display: flex; justify-content: space-between; align-items: flex-end; gap: 32px;
}
.eyebrow { margin-bottom: 18px; }
h1 { font-size: clamp(54px, 8.6vw, 160px); }
.tagline {
  max-width: 300px; text-align: right;
  font-size: 15px; line-height: 1.55; font-weight: 500;
  color: var(--ink-soft);
}
.tagline b { color: var(--ink); }
.scroll-hint {
  align-self: center; margin-top: 40px;
  font-size: 11px; letter-spacing: .3em; text-transform: uppercase;
  color: var(--ink-soft);
  animation: bob 2.4s ease-in-out infinite;
}
@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
@media (max-width: 720px) {
  .bottom { flex-direction: column; align-items: flex-start; }
  .tagline { text-align: left; }
}
</style>
