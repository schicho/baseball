import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const DATAPATH = "data/chargingthemound.csv";

function loadData() {
    return d3.dsv(";", DATAPATH, d3.autoType);
}

export { loadData };