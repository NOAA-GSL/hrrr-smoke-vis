import { geoPath, geoAlbers } from "d3-geo";
import { mesh } from "topojson-client";

function debounce(fn, delay) {
  let timer;

  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

class HrrrMap extends HTMLElement {
  static resizeObserver = new ResizeObserver(debounce(function (entries) {
    for (let e of entries) {
      if (e.target.resize) {
        const { blockSize, inlineSize } = Array.isArray(e.contentBoxSize)
          ? e.contentBoxSize[0]
          : e.contentBoxSize;

        e.target.resize(inlineSize, blockSize);
      }
    }
  }, 300));

  static get observedAttributes() {
    return ["borders", "show-counties", "north", "east", "south", "west"];
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
      case "north":
      case "east":
      case "south":
      case "west":
        this.redraw();
        break;
      default:
        break;
    }
  }

  disconnectedCallback() {
    HrrrMap.resizeObserver.unobserve(this);
  }

  get showCounties() {
    return this.hasAttribute("show-counties");
  }

  set showCounties(show) {
    if (show) {
      this.setAttribute("show-counties", "");
    } else {
      this.removeAttribute("show-counties");
    }
  }

  get north() {
    return +this.getAttribute("north");
  }

  set north(value) {
    this.setAttribute("north", value);
  }

  get east() {
    return +this.getAttribute("east");
  }

  set east(value) {
    this.setAttribute("east", value);
  }

  get south() {
    return +this.getAttribute("south");
  }

  set south(value) {
    this.setAttribute("south", value);
  }

  get west() {
    return +this.getAttribute("west");
  }

  set west(value) {
    this.setAttribute("west", value);
  }

  /**
   * Return a GeoJSON object defining the extents of the map
   */
  get extent() {
    const n = this.north, e = this.east, s = this.south, w = this.west;

    return {
      type: "LineString",
      coordinates: [
        [w, s], [e, n]
      ],
    };
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

  resize(width, height) {
    this.basemap.setAttribute("height", height);
    this.basemap.setAttribute("width", width);

    console.log(`Resized: ${width}, ${height}`);
    this.redraw();
  }
}

customElements.define("hrrr-map", HrrrMap);
