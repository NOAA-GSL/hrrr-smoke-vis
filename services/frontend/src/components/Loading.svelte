<script>
  export let promise;
  export let classNames = "";
</script>

<div class="container stack {classNames}">
  <slot></slot>
  {#await promise}
    <div class="spinner stack">
      <span>Loading</span>
    </div>
  {/await}
</div>

<style>
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.spinner > * {
  place-self: center;
  z-index: 1;
}

.spinner::before {
  content: '';
  display: block;
  background-color: var(--surface-3);
  opacity: 0.6;
  grid-area: stack;
  z-index: 0;
}
</style>
