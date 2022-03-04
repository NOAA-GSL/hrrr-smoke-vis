<script>
  export let id;
  export let label;
  export let labelClass = ""
</script>

<div class="flow">
  <label for={id} class="{labelClass}">{label}</label>
  <slot></slot>
</div>

<style lang="scss">
  @use "uswds";
  .uppercase {
    font-size: uswds.size("ui", "3xs");
    font-weight: bold;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
</style>
