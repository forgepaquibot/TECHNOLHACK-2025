// =====================
// model.js
// Defines the User class and all user-related data fields
// =====================

export class User {
  // --- Static dropdown options (presets) ---
  static GENDER_OPTIONS = {
    "Male": "He/Him",
    "Female": "She/Her",
    "Non-Binary": "They/Them",
    "Other": null, // will require custom pronouns
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
    "Peoples with disabilities/special needs"
  ];

  // --- Constructor ---
  constructor(
    name,
    password,
    {
      gender = "Not shared",
      pronouns = "Not shared",
      fieldOfStudy = "Not shared",
      interests = [],
      institution = "No institution selected",
      linkedIn = "No LinkedIn provided",
      causes = []
    } = {}
  ) {
    this.name = name;
    this.password = password;
    this.id = User.generateId(name);

    // Basic identity
    this.gender = gender;
    this.pronouns = pronouns;
    this.fieldOfStudy = fieldOfStudy;
    this.interests = interests.length > 0 ? interests : ["Not shared"];

    // Bio-related fields
    this.institution = institution;
    this.linkedIn = linkedIn;
    this.causes = causes.length > 0 ? causes : ["No causes selected"];
  }

  // --- Utility: simple hash for ID ---
  static generateId(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = (hash << 5) - hash + username.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // --- Gender + pronouns handling ---
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

  // --- Field of study ---
  setFieldOfStudy(field) {
    this.fieldOfStudy = field || "Not shared";
  }

  // --- Interests ---
  addInterest(interest) {
    if (!interest) return;
    if (this.interests.includes("Not shared")) {
      this.interests = [interest];
    } else {
      this.interests.push(interest);
    }
  }

  // --- Institution ---
  setInstitution(institution) {
    this.institution = institution || "No institution selected";
  }

  // --- LinkedIn ---
  setLinkedIn(link) {
    this.linkedIn = link || "No LinkedIn provided";
  }

  // --- Causes ---
  setCauses(causesArray) {
    if (Array.isArray(causesArray) && causesArray.length > 0) {
      this.causes = causesArray;
    } else {
      this.causes = ["No causes selected"];
    }
  }
}
