import { User, Institution } from "./model.js";

let users = [];
let institutions = [];

const cardTitle = document.getElementById("cardTitle");
const selectionBtns = document.getElementById("selectionBtns");
const userForm = document.getElementById("userForm");
const institutionForm = document.getElementById("institutionForm");

/* fade swap utility */
function swapFade(fromEl, toEl, newTitle) {
  fromEl.classList.remove("show");
  setTimeout(() => {
    toEl.classList.add("show");
    cardTitle.textContent = newTitle;
  }, 350);
}

/* top card actions */
document.getElementById("showUserForm").addEventListener("click", () => {
  swapFade(selectionBtns, userForm, "Creating New User");
});
document.getElementById("showInstitutionForm").addEventListener("click", () => {
  swapFade(selectionBtns, institutionForm, "Creating New Institution");
});
document.getElementById("backBtnUser").addEventListener("click", () => {
  swapFade(userForm, selectionBtns, "Select Account Type");
});
document.getElementById("backBtnInst").addEventListener("click", () => {
  swapFade(institutionForm, selectionBtns, "Select Account Type");
});

/* create user */
document.getElementById("createUserBtn").addEventListener("click", () => {
  const name = document.getElementById("username").value.trim();
  const pw = document.getElementById("password").value.trim();
  if (!name || !pw) return alert("Username and password required!");

  const user = new User(name, pw);
  user.generateID();
  users.push(user);
  addUserCard(user);

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  swapFade(userForm, selectionBtns, "Select Account Type");
});

/* create institution */
document.getElementById("createInstitutionBtn").addEventListener("click", () => {
  const name = document.getElementById("institutionName").value.trim();
  const token = document.getElementById("institutionApi").value.trim();
  const pw = document.getElementById("institutionPassword").value.trim();
  if (!name || !token || !pw) return alert("All fields required!");

  try {
    const inst = new Institution(name, token, pw);
    institutions.push(inst);
    addInstitutionCard(inst);

    // update open user editors' dropdowns
    document.querySelectorAll(".institutionSelect").forEach(select => {
      const opt = document.createElement("option");
      opt.value = inst.id;
      opt.textContent = inst.name;
      select.appendChild(opt);
    });

    document.getElementById("institutionName").value = "";
    document.getElementById("institutionApi").value = "";
    document.getElementById("institutionPassword").value = "";
    swapFade(institutionForm, selectionBtns, "Select Account Type");
  } catch (e) {
    alert(e.message);
  }
});

/* ============== RENDERERS ============== */
function addUserCard(user) {
  const list = document.getElementById("usersList");
  const card = document.createElement("div");
  card.className = "user-card";

  card.innerHTML = `
    <p><strong>${user.name}</strong> (ID: ${user.id})</p>
    <div class="btn-row">
      <button class="viewBtn">View</button>
      <button class="editBtn">Edit</button>
    </div>

    <!-- View -->
    <div class="profile fade">
      <p><strong>LinkedIn:</strong> <a class="showLinkedIn" href="${user.linkedIn}" target="_blank">${user.linkedIn}</a></p>
      <p><strong>Causes:</strong> <span class="showCauses">${user.causes.join(", ")}</span></p>
      <p><strong>Gender:</strong> <span class="showGender">${user.gender}</span></p>
      <p><strong>Pronouns:</strong> <span class="showPronouns">${user.pronouns}</span></p>
      <p><strong>Field of Study:</strong> <span class="showField">${user.fieldOfStudy}</span></p>
      <p><strong>Interests:</strong> <span class="showInterests">${user.interests.join(", ")}</span></p>
      <p><strong>Institution:</strong> <span class="showInstitution">${user.institution}</span></p>
    </div>

    <!-- Edit -->
    <div class="edit fade">
      <label>LinkedIn:
        <input type="text" class="linkedInInput" value="${user.linkedIn}">
      </label>

      <label>Gender:
        <select class="genderSelect">
          <option value="">Not shared</option>
          <option ${user.gender === "Male" ? "selected" : ""}>Male</option>
          <option ${user.gender === "Female" ? "selected" : ""}>Female</option>
          <option ${user.gender === "Non-Binary" ? "selected" : ""}>Non-Binary</option>
          <option ${user.gender === "Other" ? "selected" : ""}>Other</option>
        </select>
      </label>

      <input type="text" class="customPronouns" placeholder="Custom pronouns"
             style="display:${user.gender === "Other" ? "block" : "none"};"
             value="${user.gender === "Other" ? user.pronouns : ""}"/>

      <label>Field of Study:
        <input type="text" class="fieldInput" value="${user.fieldOfStudy}">
      </label>

      <label>Interests:
        <div class="btn-row" style="gap:.35rem; justify-content:flex-start;">
          <input type="text" class="interestInput" placeholder="Add interest" style="flex:1; max-width: 320px;">
          <button class="addInterestBtn">Add</button>
        </div>
      </label>

      <label>Associate with Institution:
        <select class="institutionSelect">
          <option value="">No institution selected</option>
          ${institutions.map(i =>
            `<option value="${i.id}" ${i.name === user.institution ? "selected" : ""}>${i.name}</option>`
          ).join("")}
        </select>
      </label>

      <div class="btn-row">
        <button class="saveBtn">Save</button>
        <button class="cancelEditBtn">Cancel</button>
      </div>
    </div>
  `;

  const viewEl = card.querySelector(".profile");
  const editEl = card.querySelector(".edit");

  // Toggle View
  card.querySelector(".viewBtn").addEventListener("click", () => {
    viewEl.classList.toggle("show");
  });

  // Toggle Edit
  card.querySelector(".editBtn").addEventListener("click", () => {
    editEl.classList.toggle("show");
  });

  // Gender -> custom pronouns visibility
  const genderSelect = card.querySelector(".genderSelect");
  const customPronounsInput = card.querySelector(".customPronouns");
  genderSelect.addEventListener("change", (e) => {
    customPronounsInput.style.display = e.target.value === "Other" ? "block" : "none";
  });

  // Add interest
  card.querySelector(".addInterestBtn").addEventListener("click", () => {
    const input = card.querySelector(".interestInput");
    const val = input.value.trim();
    if (!val) return;
    user.addInterest(val);
    card.querySelector(".showInterests").textContent = user.interests.join(", ");
    input.value = "";
  });

  // Cancel edit
  card.querySelector(".cancelEditBtn").addEventListener("click", () => {
    editEl.classList.remove("show");
  });

  // SAVE — robust hooks (no nth-child)
  card.querySelector(".saveBtn").addEventListener("click", () => {
    const linkedIn = card.querySelector(".linkedInInput").value.trim();
    const field = card.querySelector(".fieldInput").value.trim();
    const gender = genderSelect.value;
    const customPronouns = customPronounsInput.value.trim();
    const selectedInstitutionId = card.querySelector(".institutionSelect").value;

    user.setLinkedIn(linkedIn);
    user.setFieldOfStudy(field);
    user.setGender(gender, customPronouns);

    if (selectedInstitutionId) {
      const inst = institutions.find(i => i.id == selectedInstitutionId);
      if (inst) {
        user.setInstitution(inst.name);
        inst.addUser(user);
      }
    } else {
      user.setInstitution("No institution selected");
    }

    // Update view fields
    const showLinkedIn = card.querySelector(".showLinkedIn");
    showLinkedIn.href = user.linkedIn;
    showLinkedIn.textContent = user.linkedIn;

    card.querySelector(".showField").textContent = user.fieldOfStudy;
    card.querySelector(".showGender").textContent = user.gender;
    card.querySelector(".showPronouns").textContent = user.pronouns;
    card.querySelector(".showInstitution").textContent = user.institution;
    // interests are already kept up to date on Add

    // close edit gracefully
    editEl.classList.remove("show");
  });

  list.appendChild(card);
}

function addInstitutionCard(inst) {
  const list = document.getElementById("institutionsList");
  const card = document.createElement("div");
  card.className = "institution-card";

  card.innerHTML = `
    <p><strong>${inst.name}</strong> (ID: ${inst.id})</p>
    <div class="btn-row">
      <button class="viewBtn">View</button>
    </div>
    <div class="profile fade">
      <p><strong>Associated Users:</strong></p>
      <ul class="userList">
        ${inst.associatedUsers.map(uid => {
          const u = users.find(x => x.id === uid);
          return `<li>${u ? u.name : "Unknown"}</li>`;
        }).join("")}
      </ul>
    </div>
  `;

  const viewEl = card.querySelector(".profile");
  card.querySelector(".viewBtn").addEventListener("click", () => {
    // refresh list each open
    const ul = card.querySelector(".userList");
    ul.innerHTML = inst.associatedUsers.map(uid => {
      const u = users.find(x => x.id === uid);
      return `<li>${u ? u.name : "Unknown"}</li>`;
    }).join("");
    viewEl.classList.toggle("show");
  });

  list.appendChild(card);
}
