<script>
  export let id;
  export let label;
</script>

<div class="usa-form-group">
  <label for={id} class="usa-label">{label}</label>
  <slot></slot>
</div>
