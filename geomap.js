
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

// Load map, population, and capital data
Promise.all([
    d3.json("./topo.json"),
    d3.csv("./population.csv"),
    d3.csv("./capitals.csv")
]).then(function([us, populationData, capitalsData]) {

    // Convert TopoJSON to GeoJSON
    const states = topojson.feature(us, us.objects.states);

    // Match population values to state IDs
    const population = new Map(
        populationData.map(d => [
            String(d.id).trim().padStart(2, "0"),
            Number(d.population)
        ])
    );

    // Population-based color scale
    const maxPopulation = d3.max(
        populationData,
        d => Number(d.population)
    );

    const colorScale = d3.scaleSequential()
        .domain([0, maxPopulation])
        .interpolator(d3.interpolateBlues);

    // Draw states
    svg.selectAll(".state")
        .data(states.features)
        .join("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("fill", d => {
            const stateId = String(d.id).trim().padStart(2, "0");
            const statePopulation = population.get(stateId);

            return statePopulation === undefined
                ? "#dddddd"
                : colorScale(statePopulation);
        })
        .attr("stroke", "#333333")
        .attr("stroke-width", 0.8);

    // Convert capital coordinates to numbers
    const capitals = capitalsData.map(d => ({
        state: d.state,
        capital: d.capital,
        latitude: Number(d.latitude),
        longitude: Number(d.longitude)
    }));

    // Draw capital markers
    svg.selectAll(".capital")
        .data(capitals.filter(d =>
            projection([d.longitude, d.latitude]) !== null
        ))
        .join("circle")
        .attr("class", "capital")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", 4)
        .attr("fill", "red")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .append("title")
        .text(d => `${d.capital}, ${d.state}`);

    console.log("Map, populations, and capitals loaded!");
    console.log("Capital markers:", capitals.length);

}).catch(function(error) {
    console.error("Error loading map:", error);
});
