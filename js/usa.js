import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature, mesh } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

const USA_TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export class USAMap {

    constructor(canvasWidth, canvasHeight, marginTop, marginRight, marginBottom, marginLeft) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.marginTop = marginTop;
        this.marginRight = marginRight;
        this.marginBottom = marginBottom;
        this.marginLeft = marginLeft;
    }

    async render(svg) {

        const MAP_WIDTH = this.width - this.marginLeft - this.marginRight;
        const MAP_HEIGHT = 500;

        const mapGroup = svg.append("g")
            .attr("class", "usa-map")
            .attr("transform", `translate(${this.marginLeft}, ${this.height - MAP_HEIGHT})`);

        const response = await fetch(USA_TOPOJSON_URL);

        if (!response.ok) {
            throw new Error(`Could not load USA TopoJSON (${response.status} ${response.statusText})`);
        }

        const topology = await response.json();
        const states = feature(topology, topology.objects.states);
        const stateBorders = mesh(
            topology,
            topology.objects.states,
            (a, b) => a !== b
        );
        const nationBorder = mesh(topology, topology.objects.nation);

        const projection = d3.geoAlbersUsa()
            .fitSize([MAP_WIDTH, MAP_HEIGHT], states);

        const path = d3.geoPath(projection);

        mapGroup.selectAll("path")
            .data(states.features)
            .join("path")
            .attr("class", "state")
            .attr("d", path)
            .append("title")
            .text((state) => state.properties.name);

        mapGroup.append("path")
            .datum(stateBorders)
            .attr("class", "state-borders")
            .attr("d", path);

        mapGroup.append("path")
            .datum(nationBorder)
            .attr("class", "nation-border")
            .attr("d", path);
    }
}
