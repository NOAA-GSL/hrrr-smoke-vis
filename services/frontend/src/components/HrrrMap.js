class HrrrMap extends HTMLElement {
  static resizeObserver = new ResizeObserver(function (entries) {
    for (let e of entries) {
      console.log(e);
      if (e.target.resize) {
        const { blockSize, inlineSize } = Array.isArray(e.contentBoxSize)
          ? e.contentBoxSize[0]
          : e.contentBoxSize;

        e.target.resize(inlineSize, blockSize);
      }
    }
  });

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

  disconnectedCallback() {
    HrrrMap.resizeObserver.unobserve(this);
  }

  resize(width, height) {
    this.basemap.setAttribute("height", height);
    this.basemap.setAttribute("width", width);

    console.log(`Resized: ${width}, ${height}`);
  }
}

customElements.define("hrrr-map", HrrrMap);
