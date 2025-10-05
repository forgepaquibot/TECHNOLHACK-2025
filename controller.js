const MAX_USERS = 30;
const MAX_INSTITUTIONS = 0;
const MAX_USERS_LEADERBOARD = 15;
const ERR_DUPLICATE_USER = -3;
const DAILY_INTERACTION_AMOUNT = 2;

let users = [];
let leaderboard = [];
let institutions = [];
let mainUser;
let panel;

// Example cities
institutions.push(new Institution("University of Toronto", "ABC123", "asfasfafs", ["Essay challenge", "ACORN quiz"], {coords: [-79.3832, 43.6532]}));
institutions.push(new Institution("University of Oxford", "ABC123", "afasffa", ["Math exam"], {coords: [-0.1276, 51.5074]}));
institutions.push(new Institution("Tokyo Imperial Palace", "ABC123", "dfsdf", ["Public administration", "Decipher script"], {coords: [139.6917, 35.6895]}));
institutions.push(new Institution("Google HQ", "ABC123", "afasffa", ["Leetcode", "AI solutions", "Cloud computing"], {coords: [-122.0841, 37.4220]}));
institutions.push(new Institution("Sydney Opera House", "ABC123", "afasffa", ["Ticket sales pitch", "Virtual opera competition"], {coords: [151.2153, -33.8568]}));
institutions.push(new Institution("ALMA Observatory", "ABC123", "afasffa", ["Constellation tracking", "Comet path calculation"], {coords: [-67.753, -23.029]}));
institutions.push(new Institution("Etosha Wildlife Conservatory", "ABC123", "afasffa", ["Advertise postings"], {coords: [16.445, -18.775]}));
institutions.push(new Institution("Juan Carlos I Research Base", "ABC123", "afasffa", ["Seismic data interpretation", "Temperature calculation", "Glacier life cycle"], {coords: [-60.3667, -62.6667]}));
institutions.push(new Institution("Carleton University", "ABC123", "afasffa", ["RAVE", "Research assistance"], {coords: [-75.6960, 45.3876]}));


function createUser() {
    let usernameInput = document.getElementById("name");
    let passwordInput = document.getElementById("password");
    let genderInput = document.getElementById("gender");
    let pronounsInput = document.getElementById("pronouns");
    let fieldofstudyInput = document.getElementById("fieldOfStudy");
    let interestsInput = document.getElementById("interests");
    let linkedinInput = document.getElementById("linkedin");
    let causesInput = document.getElementById("causes");

    // Validate user
    for (let u of users) {
        if (u.name === usernameInput.value) {
            throwError(ERR_DUPLICATE_USER);
            return;
        }
    }

    // Choose causes (just first one checked here)
    let cause = null;
    let checkboxes = causesInput.querySelectorAll("input[type=checkbox]:checked");
    if (checkboxes.length > 0) {
        cause = checkboxes[0].value;
    }

    let newUser = new User(
        usernameInput.value,
        passwordInput.value,
        0,
        0,
        {},
        "Tech Enthusiasts",
        {
            gender: genderInput.value,
            pronouns: pronounsInput.value,
            fieldOfStudy: fieldofstudyInput.value,
            interests: interestsInput.value,
            linkedin: linkedinInput.value,
            causes: cause
        }
    );

    newUser.generateID(); // Generate unique id
    mainUser = newUser;
    users.push(newUser); // Add user to the global array
}

function throwError(errorCode) {
    switch (errorCode) {
        case -3:
            alert("USER ALREADY EXISTS!");
    }

}

/*
function loadData() {

}

function saveData() {

}
*/

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
            //interactInstitution(event);

            const inst = this.instData; // access the Institution object
            let points = 0;

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

            // --- Close Button ---
            const closeBtn = document.createElement("button");
            closeBtn.textContent = "X";
            closeBtn.classList.add("panel-close-btn");
            closeBtn.style.position = "absolute";
            closeBtn.style.top = "18px";
            closeBtn.style.right = "10px";
            closeBtn.style.width = "30px";
            closeBtn.style.height = "30px";
            closeBtn.style.background = "#e74c3c"; // red background
            closeBtn.style.color = "white";
            closeBtn.style.border = "none";
            closeBtn.style.borderRadius = "50%";
            closeBtn.style.fontSize = "18px";
            closeBtn.style.cursor = "pointer";
            closeBtn.style.display = "flex";
            closeBtn.style.alignItems = "center";
            closeBtn.style.justifyContent = "center";
            closeBtn.addEventListener("click", () => {
                panel.remove();
                panel = null;
            });

            panel.appendChild(closeBtn);

            // --- Points Section ---
            const pointsDiv = document.createElement("div");
            pointsDiv.classList.add("points-section");
            pointsDiv.textContent = `Interaction Points: ${ mainUser.interactions[inst.apiToken] || 0}`;
            panel.appendChild(pointsDiv);

            // --- Title ---
            const title = document.createElement("h2");
            const socialElement = document.createElement("a"); // Social media plug
            socialElement.textContent = inst.name;
            socialElement.href = inst.social;
            title.appendChild(socialElement);
            panel.appendChild(title);

            // --- Content Container (Leaderboard + Tasks) ---
            const contentContainer = document.createElement("div");
            contentContainer.classList.add("panel-content");
            contentContainer.style.display = "flex";
            contentContainer.style.gap = "20px"; // space between leaderboard and tasks
            contentContainer.style.marginTop = "5px"; // smaller gap

            // --- Leaderboard Section ---
            const leaderboardDiv = document.createElement("div");
            leaderboardDiv.classList.add("leaderboard-section");
            leaderboardDiv.style.flex = "1";

            const leaderboardTitle = document.createElement("h3");
            leaderboardTitle.textContent = "Leaderboard";
            leaderboardDiv.appendChild(leaderboardTitle);

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
            leaderboardDiv.appendChild(list);

            // --- Tasks Section ---
            const tasksDiv = document.createElement("div");
            tasksDiv.classList.add("tasks-section");
            tasksDiv.style.flex = "1";

            const tasksTitle = document.createElement("h3");
            tasksTitle.textContent = "Tasks";
            tasksDiv.appendChild(tasksTitle);

            const tasksList = document.createElement("ul");
            if (inst.tasks && inst.tasks.length > 0) {
                inst.tasks.forEach(task => {
                    const li = document.createElement("li");
                    const taskLink = document.createElement("a");
                    taskLink.textContent = task;
                    taskLink.href = "#";
                    li.appendChild(taskLink);
                    tasksList.appendChild(li);
                });
            } else {
                const li = document.createElement("li");
                li.textContent = "No tasks available";
                tasksList.appendChild(li);
            }

            tasksDiv.appendChild(tasksList);

            // --- Append sections to content container ---
            contentContainer.appendChild(leaderboardDiv);
            contentContainer.appendChild(tasksDiv);
            panel.appendChild(contentContainer);

            // Append panel to container in HTML
            document.getElementById("panels-container").appendChild(panel);

            // --- Center the panel on screen ---
            panel.style.position = "fixed";
            panel.style.left = `calc(50% - ${panel.offsetWidth / 2}px)`;
            panel.style.top = `calc(50% - ${panel.offsetHeight / 2}px)`;

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

function interactInstitution(e) {
    const institution = e.instData;
    if (mainUser.interactions.includes(institution.apiToken)) {
        mainUser.interactions[institution.apiToken] += DAILY_INTERACTION_AMOUNT;
    } else {
        mainUser.interactions[institution.apiToken] = DAILY_INTERACTION_AMOUNT;
    }

    updateUserInfo();
    spawnPoint(e.clientX, e.clientY);
}

function updateUserInfo() {
    console.log(mainUser);
    mainUser.calculateTotalInteractions();

    // Update user info
    document.getElementById("user-name").textContent = mainUser.name;
    document.getElementById("user-group").textContent = "Group: " + mainUser.group;
    document.getElementById("user-points").textContent = "Interactions: " + mainUser.totalInteractions;
}

function spawnPoint(x, y, imgSrc = "interactionPoint.png") {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.style.position = "absolute";
    img.style.width = "750px";
    img.style.height = "500px";
    img.style.pointerEvents = "none";
    document.body.appendChild(img);

    let start = null;
    const duration = 1500; // 1.5s

    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;

        // easing
        const ease = Math.min(progress, 1);

        // upward movement
        const yOffset = -150 * ease; 

        // sideways swerve (sin wave)
        const xOffset = Math.sin(progress * Math.PI * 2) * 20 * (1 - ease);

        // opacity
        const opacity = 1 - ease;

        img.style.left = x + xOffset + "px";
        img.style.top = y + yOffset + "px";
        img.style.opacity = opacity;

        if (progress < 1) {
        requestAnimationFrame(animate);
        } else {
        img.remove();
        }
    }

    requestAnimationFrame(animate);
}