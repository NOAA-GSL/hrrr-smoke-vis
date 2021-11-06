<script>
  export let id;
  export let label;
</script>

<div class="stack">
  <label for={id}>{label}</label>
  <slot></slot>
</div>
