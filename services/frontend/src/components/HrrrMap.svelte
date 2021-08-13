<script>
  import { geoPath, geoAlbers } from "d3-geo";
  import { mesh } from "topojson-client";

  let showCounties = false;
  function loadBorders(url) {
    fetch(url)
      .then((res) => res.json())
      .then((geodata) => {
        this.borderData = geodata;
        this.redraw();
      });
  }

  function redraw() {
    if (!this.borderData) return;

    const states = mesh(this.borderData, this.borderData.objects.states);
    const ctx = this.basemap.getContext("2d");
    const projection = geoAlbers().fitSize(
      [
        +this.basemap.getAttribute("width"),
        +this.basemap.getAttribute("height"),
      ],
      this.extent
    );
    const path = geoPath(projection, ctx);

    ctx.strokeStyle = "#a9aeb1";

    if (this.showCounties) {
      ctx.lineWidth = 1;
      ctx.beginPath();
      path(mesh(this.borderData, this.borderData.objects.counties));
      ctx.stroke();
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    path(states);
    ctx.stroke();
  }

  function resize(width, height) {
    this.basemap.setAttribute("height", height);
    this.basemap.setAttribute("width", width);

    console.log(`Resized: ${width}, ${height}`);
    this.redraw();
  }
</script>

<style>
  canvas {
    width: 100%;
  }
</style>

<canvas />
