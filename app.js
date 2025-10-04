import { User, Institution } from "./model.js";

let users = [];
let institutions = [];

// --- Toggle forms ---
document.getElementById("showUserForm").addEventListener("click", () => {
  document.getElementById("userForm").classList.remove("hidden");
  document.getElementById("institutionForm").classList.add("hidden");
});

document.getElementById("showInstitutionForm").addEventListener("click", () => {
  document.getElementById("institutionForm").classList.remove("hidden");
  document.getElementById("userForm").classList.add("hidden");
});

// --- Create User ---
document.getElementById("createUserBtn").addEventListener("click", () => {
  const name = document.getElementById("username").value.trim();
  const pw = document.getElementById("password").value.trim();

  if (!name || !pw) {
    alert("Username and password required!");
    return;
  }

  const user = new User(name, pw);
  users.push(user);
  addUserCard(user);

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
});

// --- Create Institution ---
document.getElementById("createInstitutionBtn").addEventListener("click", () => {
  const name = document.getElementById("institutionName").value.trim();
  const token = document.getElementById("institutionApi").value.trim();
  const pw = document.getElementById("institutionPassword").value.trim();

  if (!name || !token || !pw) {
    alert("All fields required!");
    return;
  }

  try {
    const institution = new Institution(name, token, pw);
    institutions.push(institution);
    addInstitutionCard(institution);

    // update user dropdowns dynamically
    document.querySelectorAll(".institutionSelect").forEach(select => {
      const opt = document.createElement("option");
      opt.value = institution.id;
      opt.textContent = institution.name;
      select.appendChild(opt);
    });

    document.getElementById("institutionName").value = "";
    document.getElementById("institutionApi").value = "";
    document.getElementById("institutionPassword").value = "";
  } catch (err) {
    alert(err.message);
  }
});

// --- Render User card ---
function addUserCard(user) {
  const list = document.getElementById("usersList");
  const card = document.createElement("div");
  card.className = "user-card";

  card.innerHTML = `
    <p><strong>${user.name}</strong> (ID: ${user.id})</p>
    <button class="viewBtn">View User</button>
    <button class="editBtn">Edit User</button>

    <div class="profile" style="display:none;">
      <p><strong>LinkedIn:</strong> <a href="${user.linkedIn}" target="_blank" class="showLinkedIn">${user.linkedIn}</a></p>
      <p><strong>Causes:</strong></p>
      <ul class="showCauses">${user.causes.map(c => `<li>${c}</li>`).join("")}</ul>
      <p><strong>Gender:</strong> <span class="showGender">${user.gender}</span></p>
      <p><strong>Pronouns:</strong> <span class="showPronouns">${user.pronouns}</span></p>
      <p><strong>Field of Study:</strong> <span class="showField">${user.fieldOfStudy}</span></p>
      <p><strong>Interests:</strong> <span class="showInterests">${user.interests.join(", ")}</span></p>
      <p><strong>Institution Association:</strong> <span class="showInstitution">${user.institution}</span></p>
    </div>

    <div class="edit" style="display:none;">
      <label>LinkedIn: <input type="text" class="linkedInInput" value="${user.linkedIn}"></label><br>

      <label>Causes:</label>
      <div class="editCauses causes-dropdown">
        ${User.CAUSE_OPTIONS.map(c => `
          <label><input type="checkbox" value="${c}" ${user.causes.includes(c) ? "checked" : ""}> ${c}</label><br>
        `).join("")}
      </div><br>

      <label>Gender: 
        <select class="genderSelect">
          <option value="">Not shared</option>
          <option ${user.gender === "Male" ? "selected" : ""}>Male</option>
          <option ${user.gender === "Female" ? "selected" : ""}>Female</option>
          <option ${user.gender === "Non-Binary" ? "selected" : ""}>Non-Binary</option>
          <option ${user.gender === "Other" ? "selected" : ""}>Other</option>
        </select>
        <input type="text" class="customPronouns" placeholder="Custom pronouns" style="display:${user.gender === "Other" ? "inline-block" : "none"};" value="${user.gender === "Other" ? user.pronouns : ""}">
      </label><br>

      <label>Field of Study: <input type="text" class="fieldInput" value="${user.fieldOfStudy}"></label><br>

      <label>Interests: 
        <input type="text" class="interestInput" placeholder="Enter interest">
        <button class="addInterestBtn">Add</button>
      </label><br>

      <label>Associate with Institution:</label>
      <select class="institutionSelect">
        <option value="">No institution selected</option>
        ${institutions.map(i => `<option value="${i.id}" ${i.name === user.institution ? "selected" : ""}>${i.name}</option>`).join("")}
      </select><br>

      <button class="saveBtn">Save</button>
    </div>
  `;

  // Toggle view
  card.querySelector(".viewBtn").addEventListener("click", () => {
    const profile = card.querySelector(".profile");
    profile.style.display = profile.style.display === "none" ? "block" : "none";
  });

  // Toggle edit
  card.querySelector(".editBtn").addEventListener("click", () => {
    const edit = card.querySelector(".edit");
    edit.style.display = edit.style.display === "none" ? "block" : "none";
  });

  // Gender select
  card.querySelector(".genderSelect").addEventListener("change", (e) => {
    const customInput = card.querySelector(".customPronouns");
    customInput.style.display = e.target.value === "Other" ? "inline-block" : "none";
  });

  // Add interest
  card.querySelector(".addInterestBtn").addEventListener("click", () => {
    const input = card.querySelector(".interestInput");
    if (input.value) {
      user.addInterest(input.value);
      card.querySelector(".showInterests").textContent = user.interests.join(", ");
      input.value = "";
    }
  });

  // Save edits
  card.querySelector(".saveBtn").addEventListener("click", () => {
    const gender = card.querySelector(".genderSelect").value;
    const customPronouns = card.querySelector(".customPronouns").value;
    const field = card.querySelector(".fieldInput").value;
    const linkedIn = card.querySelector(".linkedInInput").value;
    const causes = Array.from(card.querySelectorAll(".editCauses input:checked")).map(cb => cb.value);
    const selectedInstitutionId = card.querySelector(".institutionSelect").value;

    user.setGender(gender, customPronouns);
    user.setFieldOfStudy(field);
    user.setLinkedIn(linkedIn);
    user.setCauses(causes);

    if (selectedInstitutionId) {
      const institution = institutions.find(i => i.id == selectedInstitutionId);
      if (institution) {
        user.setInstitution(institution.name);
        institution.addUser(user);
      }
    } else {
      user.setInstitution("No institution selected");
    }

    // update profile
    card.querySelector(".showInstitution").textContent = user.institution;
    card.querySelector(".showLinkedIn").textContent = user.linkedIn;
    card.querySelector(".showCauses").innerHTML = user.causes.map(c => `<li>${c}</li>`).join("");
    card.querySelector(".showGender").textContent = user.gender;
    card.querySelector(".showPronouns").textContent = user.pronouns;
    card.querySelector(".showField").textContent = user.fieldOfStudy;
    card.querySelector(".showInterests").textContent = user.interests.join(", ");
  });

  list.appendChild(card);
}

// --- Render Institution card ---
function addInstitutionCard(institution) {
  const list = document.getElementById("institutionsList");
  const card = document.createElement("div");
  card.className = "institution-card";

  card.innerHTML = `
    <p><strong>${institution.name}</strong> (ID: ${institution.id})</p>
    <button class="viewBtn">View Institution</button>

    <div class="profile" style="display:none;">
      <p><strong>Associated Users:</strong></p>
      <ul class="userList">
        ${institution.associatedUsers.map(uid => {
          const user = users.find(u => u.id === uid);
          return `<li>${user ? user.name : "Unknown"}</li>`;
        }).join("")}
      </ul>
    </div>
  `;

  card.querySelector(".viewBtn").addEventListener("click", () => {
    const profile = card.querySelector(".profile");
    profile.style.display = profile.style.display === "none" ? "block" : "none";

    const userList = card.querySelector(".userList");
    userList.innerHTML = institution.associatedUsers.map(uid => {
      const user = users.find(u => u.id === uid);
      return `<li>${user ? user.name : "Unknown"}</li>`;
    }).join("");
  });

  list.appendChild(card);
}
