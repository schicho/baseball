import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

const USA_TOPOJSON_URL = "./data/usatopo_no_alaska_hawaii.json";
const HOMECITIES_URL = "./data/homecities.json";

async function drawTeamDots(mapGroup, projection) {
    const response = await fetch(HOMECITIES_URL);

    if (!response.ok) {
        throw new Error(`Could not load home cities (${response.status} ${response.statusText})`);
    }

    const homeCities = await response.json();

    mapGroup.append("g")
        .attr("class", "team-dots")
        .selectAll("circle")
        .data(homeCities.features)
        .join("circle")
        .attr("class", "team-dot")
        .attr("cx", (team) => {
            const position = projection(team.geometry.coordinates);
            return position ? position[0] : null;
        })
        .attr("cy", (team) => {
            const position = projection(team.geometry.coordinates);
            return position ? position[1] : null;
        })
        .attr("r", 5)
        .attr("fill", (team) => team.properties.color)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .append("title")
        .text((team) => `${team.properties.team} — ${team.properties.city}`);
}

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

        const projection = d3.geoAlbersUsa()
            .fitSize([MAP_WIDTH, MAP_HEIGHT], states);

        const path = d3.geoPath(projection);

        mapGroup.selectAll("path")
            .data(states.features)
            .join("path")
            .attr("class", "state-borders")
            .attr("d", path)
            .append("title")
            .text((state) => state.properties.name);

        await drawTeamDots(mapGroup, projection);
    }
}
