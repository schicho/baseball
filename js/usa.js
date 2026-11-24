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

    const dotg = mapGroup.append("g")
        .attr("class", "team-dots");

    const dotsg = dotg.selectAll("g")
        .data(homeCities.features)
        .join("g")
        .on("mouseover", function (event, team) {
            d3.select(this).select(".hover-group").attr("visibility", "visible");
        })
        .on("mouseout", function (event, team) {
            d3.select(this).select(".hover-group").attr("visibility", "hidden");
        });

    dotsg.append("circle")
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

    const hoverG = dotsg.append("g")
        .attr("class", "hover-group")
        .attr("transform", (team) => {
            const position = projection(team.geometry.coordinates);
            return position ? `translate(${position[0]}, ${position[1] - 20})` : null;
        })
        .attr("visibility", "hidden");


    hoverG.append("rect")
        .attr("class", "hover-rect")
        .attr("x", (team) => -team.properties.team.length * 7)
        .attr("y", -20)
        .attr("width", (team) => team.properties.team.length * 7 * 2)
        .attr("height", 27)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    hoverG.append("text")
        .attr("class", "team-label")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "upper")
        .text((team) => team.properties.team)
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

        const mapG = svg.append("g")
            .attr("class", "usa-map")
            .attr("transform", `translate(${this.marginLeft}, ${this.height - MAP_HEIGHT})`);

        const lineg = mapG.append("g").attr("class", "map-lines");

        const response = await fetch(USA_TOPOJSON_URL);

        if (!response.ok) {
            throw new Error(`Could not load USA TopoJSON (${response.status} ${response.statusText})`);
        }

        const topology = await response.json();
        const states = feature(topology, topology.objects.states);

        const projection = d3.geoAlbersUsa()
            .fitSize([MAP_WIDTH, MAP_HEIGHT], states);

        const path = d3.geoPath(projection);

        lineg.selectAll("path")
            .data(states.features)
            .join("path")
            .attr("class", "state-borders")
            .attr("d", path)
            .append("title")
            .text((state) => state.properties.name);

        await drawTeamDots(mapG, projection);
    }
}
