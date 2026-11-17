import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { USAMap } from "./usa.js";

// A0 portrait dimensions in millimetres. The viewBox remains scalable in a
// browser while the physical attributes preserve the intended print size.
const width = 841;
const height = 1189;
const marginTop = 150;
const marginRight = 50;
const marginBottom = 50;
const marginLeft = 50;

const svg = d3.create("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", `${width}mm`)
    .attr("height", `${height}mm`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("role", "img");

svg.append("rect")
    .attr("class", "poster-background")
    .attr("width", width)
    .attr("height", height);


const usaMap = new USAMap(width, height, marginTop, marginRight, marginBottom, marginLeft);
await usaMap.render(svg);

document.querySelector("#container").append(svg.node());