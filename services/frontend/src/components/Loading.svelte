<script>
  export let promise;
</script>

<div class="container">
  <slot></slot>
  {#await promise}
    <div class="spinner">
      <span>Loading</span>
    </div>
  {/await}
</div>

<style>
.container {
  position: relative;
}

.spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-areas: "main";
  place-items: center;
}

.spinner > * {
  grid-area: main;
  z-index: 1;
}

.spinner::before {
  content: '';
  display: block;
  background-color: var(--bg-color);
  opacity: 0.6;
  grid-area: main;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
