<script>
  export let promise;
  export let classNames;
</script>

<div class="stack {classNames}">
  <slot></slot>
  {#await promise}
    <div class="spinner stack">
      <span>Loading</span>
    </div>
  {/await}
</div>

<style>
.spinner > * {
  place-self: center;
  z-index: 1;
}

.spinner::before {
  content: '';
  display: block;
  background-color: var(--bg-color);
  opacity: 0.6;
  grid-area: stack;
  z-index: 0;
}
</style>
