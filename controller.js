const MAX_USERS = 30;
const MAX_INSTITUTIONS = 20;
const MAX_USERS_LEADERBOARD = 15;
const ERR_DUPLICATE_USER = -3

let users = [MAX_USERS];
let leaderboard = [MAX_USERS_LEADERBOARD];
let institutions = [MAX_INSTITUTIONS];
let chat = {"Unique chat id": User} // Chat dictionary with id key and chat object value

function createUser() {
    let usernameInput = document.getElementById("usernameInput");
    let passwordInput = document.getElementById("passwordInput");
    let newUser;

    // Validate user
    for (user in users) {
        if (user.name.equals(usernameInput.value)) {
            throwError(ERR_DUPLICATE_USER);
            return;
        }
    }

    newUser = new User(usernameInput.value, passwordInput.value, 0);
    newUser.generateID(); // Generate unique id

    users.push(newUser); // Add user to the global array
}


function throwError(errorCode) {
    switch (errorCode) {
        case -3:
            alert("USER ALREADY EXISTS!");
    }

}

function drawMap() {
    d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then(data => {
        const countries = topojson.feature(data, data.objects.countries);

        const width = window.innerWidth;
        const height = window.innerHeight;

        const projection = d3.geoMercator()
            .scale(130)
            .translate([width / 2, height / 1.5]);

        const path = d3.geoPath().projection(projection);

        const svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("display", "block")
            .style("margin", "0 auto");

        // Group for map
        const g = svg.append("g");

        // Draw map
        g.selectAll("path")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "lightgreen")
            .attr("stroke", "black");

        // Example city reference points
        const cities = [
            { name: "Toronto", coords: [-79.3832, 43.6532] },
            { name: "London", coords: [-0.1276, 51.5074] },
            { name: "Tokyo", coords: [139.6917, 35.6895] }
        ];

        // City group (not scaled with map)
        const cityGroup = svg.append("g");

        const circles = cityGroup.selectAll("circle")
            .data(cities)
            .enter()
            .append("circle")
            .attr("cx", d => projection(d.coords)[0])
            .attr("cy", d => projection(d.coords)[1])
            .attr("r", 5)
            .attr("fill", "red");

        const labels = cityGroup.selectAll("text")
            .data(cities)
            .enter()
            .append("text")
            .attr("x", d => projection(d.coords)[0] + 7)
            .attr("y", d => projection(d.coords)[1] + 3)
            .text(d => d.name)
            .style("font-size", "12px")
            .style("fill", "black");

        // Add zoom/pan
        const zoom = d3.zoom()
            .scaleExtent([1, 50])
            .on("zoom", (event) => {
                g.attr("transform", event.transform); // scale map normally

                // Keep cities and labels consistent in size
        circles
            .attr("transform", event.transform)
            .attr("r", Math.min(5, 10 / event.transform.k)); // shrink when zooming in, never exceed 10

        labels
            .attr("transform", event.transform)
            .style("font-size", `${Math.min(5, 10 / event.transform.k)}px`); // shrink when zooming in, never exceed 20px
            });

        svg.call(zoom);
    });
}




function placeInstitutions() {
    
}