const MAX_USERS = 30;
const MAX_USERS_LEADERBOARD = 15;
const ERR_DUPLICATE_USER = -3
const d3 = require("d3");

let users = [MAX_USERS];
let leaderboard = [MAX_USERS_LEADERBOARD];
let chat = {"123123123": User} // Chat dictionary with id key and chat object value

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

// Load a GeoJSON file of world countries
d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then(data => {
    const countries = topojson.feature(data, data.objects.countries);
    
    const width = 800;
    const height = 400;

    const projection = d3.geoMercator().scale(130).translate([width/2, height/1.5]);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select("body").append("svg")
                  .attr("width", width)
                  .attr("height", height);

    svg.selectAll("path")
       .data(countries.features)
       .enter()
       .append("path")
       .attr("d", path)
       .attr("fill", "lightgreen")
       .attr("stroke", "black");
});


function throwError(errorCode) {

}

function drawMap() {

}