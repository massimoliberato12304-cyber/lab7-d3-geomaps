
const width = 975;
const height = 610;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa()
    .scale(1300)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

d3.json("./topo.json").then(function(us) {
    console.log("US map data loaded:", us);

    const states = topojson.feature(us, us.objects.states);

    svg.selectAll("path")
        .data(states.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "lightblue")
        .attr("stroke", "black")
        .attr("stroke-width", 0.7);

}).catch(function(error) {
    console.error("Error loading map:", error);
});
