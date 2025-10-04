import { User } from "./model.js";

let users = [];

// Handle user creation
document.getElementById("createBtn").addEventListener("click", () => {
  const name = document.getElementById("username").value.trim();
  const pw = document.getElementById("password").value.trim();

  if (!name || !pw) {
    alert("Username and password required!");
    return;
  }

  const user = new User(name, pw);
  users.push(user);
  addUserCard(user);

  // reset inputs
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
});

// Build one user card
function addUserCard(user) {
  const list = document.getElementById("usersList");
  const card = document.createElement("div");
  card.className = "user-card";

  card.innerHTML = `
    <p><strong>${user.name}</strong> (ID: ${user.id})</p>
    <button class="viewBtn">View User</button>
    <button class="editBtn">Edit User</button>

    <!-- PROFILE (read-only) -->
    <div class="profile" style="display:none;">
      <p><strong>Institution:</strong> <span class="showInstitution">${user.institution}</span></p>
      <p><strong>LinkedIn:</strong> <a href="${user.linkedIn}" target="_blank" class="showLinkedIn">${user.linkedIn}</a></p>
      <p><strong>Causes:</strong></p>
      <ul class="showCauses">
        ${user.causes.map(c => `<li>${c}</li>`).join("")}
      </ul>
      <p><strong>Gender:</strong> <span class="showGender">${user.gender}</span></p>
      <p><strong>Pronouns:</strong> <span class="showPronouns">${user.pronouns}</span></p>
      <p><strong>Field of Study:</strong> <span class="showField">${user.fieldOfStudy}</span></p>
      <p><strong>Interests:</strong> <span class="showInterests">${user.interests.join(", ")}</span></p>
    </div>

    <!-- EDIT (inputs for updating user) -->
    <div class="edit" style="display:none;">
      <label>Institution: 
        <input type="text" class="institutionInput" value="${user.institution}">
      </label><br>

      <label>LinkedIn: 
        <input type="text" class="linkedInInput" value="${user.linkedIn}">
      </label><br>

      <label>Causes:</label>
      <div class="editCauses causes-dropdown">
        ${User.CAUSE_OPTIONS.map(c => `
          <label>
            <input type="checkbox" value="${c}" ${user.causes.includes(c) ? "checked" : ""}> ${c}
          </label><br>
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
        <input type="text" class="customPronouns" placeholder="Custom pronouns" 
               style="display:${user.gender === "Other" ? "inline-block" : "none"};" 
               value="${user.gender === "Other" ? user.pronouns : ""}">
      </label><br>

      <label>Field of Study: 
        <input type="text" class="fieldInput" value="${user.fieldOfStudy}">
      </label><br>

      <label>Interests: 
        <input type="text" class="interestInput" placeholder="Enter interest">
        <button class="addInterestBtn">Add</button>
      </label><br>

      <button class="saveBtn">Save</button>
    </div>
  `;

  // --- Event listeners ---

  // Toggle profile view
  card.querySelector(".viewBtn").addEventListener("click", () => {
    const profile = card.querySelector(".profile");
    profile.style.display = profile.style.display === "none" ? "block" : "none";
  });

  // Toggle edit view
  card.querySelector(".editBtn").addEventListener("click", () => {
    const edit = card.querySelector(".edit");
    edit.style.display = edit.style.display === "none" ? "block" : "none";
  });

  // Gender select → show custom pronoun input if "Other"
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
    const institution = card.querySelector(".institutionInput").value;
    const linkedIn = card.querySelector(".linkedInInput").value;
    const causes = Array.from(card.querySelectorAll(".editCauses input:checked")).map(cb => cb.value);

    user.setGender(gender, customPronouns);
    user.setFieldOfStudy(field);
    user.setInstitution(institution);
    user.setLinkedIn(linkedIn);
    user.setCauses(causes);

    // update profile display
    card.querySelector(".showInstitution").textContent = user.institution;
    card.querySelector(".showLinkedIn").textContent = user.linkedIn;
    const causesList = card.querySelector(".showCauses");
    causesList.innerHTML = user.causes.map(c => `<li>${c}</li>`).join("");
    card.querySelector(".showGender").textContent = user.gender;
    card.querySelector(".showPronouns").textContent = user.pronouns;
    card.querySelector(".showField").textContent = user.fieldOfStudy;
    card.querySelector(".showInterests").textContent = user.interests.join(", ");
  });

  list.appendChild(card);
}
