const MAX_USERS = 30;
const MAX_INSTITUTIONS = 0;
const MAX_USERS_LEADERBOARD = 15;
const ERR_DUPLICATE_USER = -3;

let users = [];
let leaderboard = [];
let institutions = [];
let chat = {"Unique chat id": User} // Chat dictionary with id key and chat object value
let panel;

// Example cities
institutions.push(new Institution("Toronto", "ABC123", "asfasfafs", {coords: [-79.3832, 43.6532]}));
institutions.push(new Institution("London", "ABC123", "afasffa", {coords: [-0.1276, 51.5074]}));
institutions.push(new Institution("Tokyo", "ABC123", "dfsdf", {coords: [139.6917, 35.6895]}));

function createUser() {
    let usernameInput = document.getElementById("usernameInput");
    let passwordInput = document.getElementById("passwordInput");
    let genderInput = document.getElementById("usernameInput");
    let pronounsInput = document.getElementById("passwordInput");
    let fieldofstudyInput = document.getElementById("usernameInput");
    let interestsInput = document.getElementById("passwordInput");
    let linkedinInput = document.getElementById("usernameInput");
    let causesInput = document.getElementById("passwordInput");
    let institutionInput = document.getElementById("passwordInput");
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

function loadData() {

}

function saveData() {

}

function drawMap() {
    d3.json("https://unpkg.com/world-atlas@2/countries-110m.json").then(data => {
        const countries = topojson.feature(data, data.objects.countries);

        // Initial dimensions
        let width = window.innerWidth;
        let height = window.innerHeight;

        const projection = d3.geoMercator()
            .scale(130)
            .translate([width / 2, height / 1.5]);

        const svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("background", "#cce7ff");

        const mapGroup = svg.append("g"); // main zoomable group

        const tileOffsets = [-1, 0, 1];
        let tiles = [];
        let allIcons = [];
        let allLabels = [];

        // --- Create 3x3 initial tiles ---
        tileOffsets.forEach(ox => {
            tileOffsets.forEach(oy => {
                const tile = mapGroup.append("g")
                    .attr("class", "tile")
                    .attr("data-offset-x", ox)
                    .attr("data-offset-y", oy)
                    .attr("transform", `translate(${ox * width}, ${oy * height})`);

                // Draw countries
                tile.selectAll("path")
                    .data(countries.features)
                    .enter()
                    .append("path")
                    .attr("d", d3.geoPath().projection(projection))
                    .attr("fill", "lightgreen")
                    .attr("stroke", "black");

                // Place institutions
                const { icons, labels } = placeInstitutions(tile, projection);
                allIcons = allIcons.concat(icons.nodes());
                allLabels = allLabels.concat(labels.nodes());

                tiles.push(tile);
            });
        });

        // --- Zoom & Pan ---
        const zoom = d3.zoom()
            .scaleExtent([2, 40])
            .on("zoom", (event) => {
                const { x, y, k } = event.transform;

                // Apply zoom & pan to main group
                mapGroup.attr("transform", `translate(${x},${y}) scale(${k})`);

                // Wrap tiles infinitely
                tiles.forEach(tile => {
                    let offsetX = parseInt(tile.attr("data-offset-x"));
                    let offsetY = parseInt(tile.attr("data-offset-y"));

                    const svgRect = svg.node().getBoundingClientRect();
                    const tileWidth = svgRect.width;
                    const tileHeight = svgRect.height;

                    const posX = offsetX * tileWidth * k + x;
                    const posY = offsetY * tileHeight * k + y;

                    let newOffsetX = offsetX;
                    let newOffsetY = offsetY;

                    if (posX + tileWidth * k < 0) newOffsetX += 3;
                    if (posX > tileWidth * k * 2) newOffsetX -= 3;
                    if (posY + tileHeight * k < 0) newOffsetY += 3;
                    if (posY > tileHeight * k * 2) newOffsetY -= 3;

                    if (newOffsetX !== offsetX || newOffsetY !== offsetY) {
                        tile.attr("data-offset-x", newOffsetX)
                            .attr("data-offset-y", newOffsetY)
                            .attr("transform", `translate(${newOffsetX * tileWidth}, ${newOffsetY * tileHeight})`);
                    }
                });

                // Scale icons and labels inversely to zoom
                d3.selectAll(allIcons)
                    .attr("width", d => Math.max(5, 20 / k))
                    .attr("height", d => Math.max(5, 20 / k))
                    .attr("x", d => projection(d.coords)[0] - (Math.max(8, 20 / k) / 2))
                    .attr("y", d => projection(d.coords)[1] - (Math.max(8, 20 / k) / 2));

                d3.selectAll(allLabels)
                    .style("font-size", `${Math.max(6, 12 / k)}px`)
                    .attr("x", d => projection(d.coords)[0] + (Math.max(7, 7 / k)))
                    .attr("y", d => projection(d.coords)[1] + (Math.max(3, 3 / k)));
            });

        svg.call(zoom);

        // --- Start centered on the middle of the middle tile (the world map center) ---
        const tileCenterX = width / 2;
        const tileCenterY = height / 2;
        const initialZoom = 2; // zoomed in

        const initialTransform = d3.zoomIdentity
            .translate(width / 2, height / 2) // move origin to viewport center
            .scale(initialZoom)
            .translate(-tileCenterX, -tileCenterY); // shift to tile center

        svg.call(zoom.transform, initialTransform);


        // --- Handle window resize ---
        window.addEventListener("resize", () => {
            width = window.innerWidth;
            height = window.innerHeight;

            svg.attr("width", width).attr("height", height);
            projection.translate([width / 2, height / 1.5]);

            // Update all country paths
            mapGroup.selectAll("path").attr("d", d3.geoPath().projection(projection));
        });
    });
}

function placeInstitutions(tile, projection) {
    const icons = tile.selectAll("image")
        .data(institutions)
        .enter()
        .append("image")
        .attr("xlink:href", d => d.icon || "placeholdericon.png")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", d => projection(d.coords)[0] - 10)
        .attr("y", d => projection(d.coords)[1] - 10)
        .attr("class", "instIcon")
        .attr("id", d => d.apiToken)
        .each(function(d) {
            // store the Institution object directly on the element
            this.instData = d;
        })
        .on("click", function(event) {
            const inst = this.instData; // access the Institution object

            if (panel && inst != panel.instData) { 
                panel.remove(); 
                panel = null;
            } else if (panel && inst == panel.instData) {
                panel.remove();
                panel = null;
                return; 
            }

            // Create the panel container
            panel = document.createElement("div");
            panel.classList.add("inst-panel");
            panel.instData = inst;

            // Create the title
            const title = document.createElement("h2");
            title.textContent = inst.name;
            panel.appendChild(title);

            // Create the leaderboard subtitle
            const subtitle = document.createElement("h3");
            subtitle.textContent = "Leaderboard";
            panel.appendChild(subtitle);

            // Create the list for leaderboard
            const list = document.createElement("ul");
            if (inst.leaderboard && inst.leaderboard.length > 0) {
                inst.leaderboard.forEach(userId => {
                    const li = document.createElement("li");
                    li.textContent = `User ID: ${userId}`;
                    list.appendChild(li);
                });
            } else {
                const li = document.createElement("li");
                li.textContent = "No data";
                list.appendChild(li);
            }
            panel.appendChild(list);

            // Append panel to container in HTML
            document.getElementById("panels-container").appendChild(panel);

            // Get mouse position relative to page
            const [x, y] = d3.pointer(event);

            // Position panel near icon
            panel.style.left = (x + 10) + "px";
            panel.style.top = (y + 10) + "px";

            // Show panel
            panel.classList.add("active");

            makePanelDraggable(panel);
        });


    const labels = tile.selectAll("text")
        .data(institutions)
        .enter()
        .append("text")
        .attr("x", d => projection(d.coords)[0] + 7)
        .attr("y", d => projection(d.coords)[1] + 3)
        .text(d => d.name)
        .style("font-size", "12px")
        .style("fill", "black");

    return { icons, labels };
}

// Make all existing and future panels draggable only via edges
function makePanelDraggable(panel) {
    const EDGE_SIZE = 10; // pixels from border that are draggable
    let offsetX = 0, offsetY = 0, isDragging = false;

    // Update cursor on hover
    panel.addEventListener("mousemove", (e) => {
        const rect = panel.getBoundingClientRect();
        const onEdge =
            e.clientX - rect.left < EDGE_SIZE || // left edge
            rect.right - e.clientX < EDGE_SIZE || // right edge
            e.clientY - rect.top < EDGE_SIZE || // top edge
            rect.bottom - e.clientY < EDGE_SIZE; // bottom edge

        panel.style.cursor = onEdge ? (isDragging ? "grabbing" : "grab") : "default";
    });

    panel.addEventListener("mousedown", (e) => {
        const rect = panel.getBoundingClientRect();
        const onEdge =
            e.clientX - rect.left < EDGE_SIZE ||
            rect.right - e.clientX < EDGE_SIZE ||
            e.clientY - rect.top < EDGE_SIZE ||
            rect.bottom - e.clientY < EDGE_SIZE;

        if (!onEdge) return; // only start dragging from edge

        isDragging = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
        panel.style.cursor = "grabbing";
        panel.style.transition = "none"; // disable transition while dragging
        e.preventDefault(); // prevent text selection
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        panel.style.left = (e.clientX - offsetX) + "px";
        panel.style.top = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        panel.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    });
}