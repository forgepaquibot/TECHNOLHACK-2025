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

  // Reset inputs
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

    <div class="profile" style="display:none;">
      <p><strong>Gender:</strong> <span class="showGender">${user.gender}</span></p>
      <p><strong>Pronouns:</strong> <span class="showPronouns">${user.pronouns}</span></p>
      <p><strong>Field of Study:</strong> <span class="showField">${user.fieldOfStudy}</span></p>
      <p><strong>Interests:</strong> <span class="showInterests">${user.interests.join(", ")}</span></p>
    </div>

    <div class="edit" style="display:none;">
      <label>Gender: 
        <select class="genderSelect">
          <option value="">Not shared</option>
          <option>Male</option>
          <option>Female</option>
          <option>Non-Binary</option>
          <option>Other</option>
        </select>
        <input type="text" class="customPronouns" placeholder="Custom pronouns" style="display:none;">
      </label>
      <br>

      <label>Field of Study: 
        <input type="text" class="fieldInput" placeholder="Enter field">
      </label>
      <br>

      <label>Interests: 
        <input type="text" class="interestInput" placeholder="Enter interest">
        <button class="addInterestBtn">Add</button>
      </label>
      <br>

      <button class="saveBtn">Save</button>
    </div>
  `;

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

  // Add interest (updates just this card, doesn’t nuke everything)
  card.querySelector(".addInterestBtn").addEventListener("click", () => {
    const input = card.querySelector(".interestInput");
    if (input.value) {
      user.addInterest(input.value);

      // update this card's profile interests
      card.querySelector(".showInterests").textContent = user.interests.join(", ");

      input.value = "";
    }
  });

  // Save edits (updates just this card)
  card.querySelector(".saveBtn").addEventListener("click", () => {
    const gender = card.querySelector(".genderSelect").value;
    const customPronouns = card.querySelector(".customPronouns").value;
    const field = card.querySelector(".fieldInput").value;

    user.setGender(gender, customPronouns);
    user.setFieldOfStudy(field);

    // update profile view
    card.querySelector(".showGender").textContent = user.gender;
    card.querySelector(".showPronouns").textContent = user.pronouns;
    card.querySelector(".showField").textContent = user.fieldOfStudy;
    card.querySelector(".showInterests").textContent = user.interests.join(", ");
  });

  list.appendChild(card);
}
