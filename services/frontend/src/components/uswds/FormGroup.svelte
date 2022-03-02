<script>
  export let id;
  export let label;
</script>

<div class="flow">
  <label for={id}>{label}</label>
  <slot></slot>
</div>
