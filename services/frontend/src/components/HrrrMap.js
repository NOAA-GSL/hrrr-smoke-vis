import { geoPath, geoAlbers } from "d3-geo";
import { mesh } from "topojson-client";

class HrrrMap extends HTMLElement {
  static resizeObserver = new ResizeObserver(function (entries) {
    for (let e of entries) {
      if (e.target.resize) {
        const { blockSize, inlineSize } = Array.isArray(e.contentBoxSize)
          ? e.contentBoxSize[0]
          : e.contentBoxSize;

        e.target.resize(inlineSize, blockSize);
      }
    }
  });

  static get observedAttributes() {
    return ["borders"];
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
    :host {
      display: grid;
      grid-template-areas: "stack";
      place-items: center;
      overflow: hidden;
    }

    * {
      width: 100%;
    }`;

    shadow.appendChild(style);

    this.basemap = document.createElement("canvas");
    shadow.appendChild(this.basemap);

    HrrrMap.resizeObserver.observe(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "borders":
        this.loadBorders(newValue);
        break;
      default:
        break;
    }
  }

  disconnectedCallback() {
    HrrrMap.resizeObserver.unobserve(this);
  }

  loadBorders(url) {
    fetch(url)
      .then((res) => res.json())
      .then((geodata) => {
        this.borderData = geodata;
        this.redraw();
      });
  }

  redraw() {
    if (!this.borderData) return;

    const states = mesh(this.borderData, this.borderData.objects.states);
    const ctx = this.basemap.getContext("2d");
    const projection = geoAlbers().fitSize(
      [
        +this.basemap.getAttribute("width"),
        +this.basemap.getAttribute("height"),
      ],
      states
    );
    const path = geoPath(projection, ctx);

    ctx.strokeStyle = "#a9aeb1";
    ctx.lineWidth = 1;

    ctx.beginPath();
    path(mesh(this.borderData, this.borderData.objects.counties));
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    path(states);
    ctx.stroke();
  }

  resize(width, height) {
    this.basemap.setAttribute("height", height);
    this.basemap.setAttribute("width", width);

    console.log(`Resized: ${width}, ${height}`);
    this.redraw();
  }
}

customElements.define("hrrr-map", HrrrMap);
