// =====================
// model.js
// User & Institution classes
// =====================

export class User {
  // Presets
  static GENDER_OPTIONS = {
    "Male": "He/Him",
    "Female": "She/Her",
    "Non-Binary": "They/Them",
    "Other": null, // requires custom pronouns
  };

  static CAUSE_OPTIONS = [
    "Animal welfare",
    "Education",
    "Environment",
    "Justice + equity",
    "Health + medicine",
    "Poverty + hunger",
    "Senior service",
    "Children",
    "Global relations",
    "Disaster relief",
    "Veterans & military families",
    "Career development",
    "Peoples with disabilities/special needs",
  ];

  /**
   * @param {string} name
   * @param {string} password
   * @param {object} options
   */
  constructor(
    name,
    password,
    {
      gender = "Not shared",
      pronouns = "Not shared",
      fieldOfStudy = "Not shared",
      interests = [],
      linkedIn = "No LinkedIn provided",
      causes = [],
      institution = "No institution selected",
    } = {}
  ) {
    this.name = name;
    this.password = password;

    this.gender = gender;
    this.pronouns = pronouns;
    this.fieldOfStudy = fieldOfStudy;
    this.interests = interests.length ? interests : ["Not shared"];
    this.linkedIn = linkedIn;
    this.causes = causes.length ? causes : ["No causes selected"];
    this.institution = institution;

    this.id = null; // set via generateID()
  }

  /** Deterministic 32-bit hash of username → numeric ID */
  generateID() {
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = (hash << 5) - hash + this.name.charCodeAt(i);
      hash |= 0;
    }
    this.id = Math.abs(hash);
    return this.id;
  }

  setGender(gender, customPronouns) {
    if (!gender) {
      this.gender = "Not shared";
      this.pronouns = "Not shared";
      return;
    }
    this.gender = gender;
    if (gender === "Other") {
      this.pronouns = customPronouns || "Custom/Not shared";
    } else {
      this.pronouns = User.GENDER_OPTIONS[gender];
    }
  }

  setFieldOfStudy(field) {
    this.fieldOfStudy = field || "Not shared";
  }

  addInterest(interest) {
    if (!interest) return;
    if (this.interests.includes("Not shared")) this.interests = [interest];
    else this.interests.push(interest);
  }

  setLinkedIn(link) {
    this.linkedIn = link || "No LinkedIn provided";
  }

  setCauses(causesArray) {
    if (Array.isArray(causesArray) && causesArray.length) this.causes = causesArray;
    else this.causes = ["No causes selected"];
  }

  setInstitution(name) {
    this.institution = name || "No institution selected";
  }
}

// =====================
// Institution (special account)
// =====================
export class Institution {
  /**
   * Institutions require valid API token: "ABC123"
   * @param {string} name
   * @param {string} apiToken
   * @param {string} password
   */
  constructor(name, apiToken, password) {
    if (apiToken !== "ABC123") throw new Error("Invalid API Token. Must be 'ABC123'.");
    this.name = name;
    this.apiToken = apiToken;
    this.password = password;

    this.id = null; // set via generateID()
    this.associatedUsers = [];
    this.generateID();
  }

  /** Deterministic 32-bit hash of name → numeric ID */
  generateID() {
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = (hash << 5) - hash + this.name.charCodeAt(i);
      hash |= 0;
    }
    this.id = Math.abs(hash);
    return this.id;
  }

  addUser(user) {
    if (!this.associatedUsers.includes(user.id)) this.associatedUsers.push(user.id);
  }
}
