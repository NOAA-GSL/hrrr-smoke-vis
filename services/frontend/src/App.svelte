<script>
	let count = 0;

	function handleClick() {
		count += 1;
	}
</script>
<h1>Hello, world</h1>
<button on:click={handleClick}>
	Clicked {count} {count === 1 ? 'time' : 'times'}
</button>
