// model.js
export class User {
  static GENDER_OPTIONS = {
    "Male": "He/Him",
    "Female": "She/Her",
    "Non-Binary": "They/Them",
    "Other": null, // custom
  };

  constructor(name, password, { gender="Not shared", pronouns="Not shared", fieldOfStudy="Not shared", interests=[] } = {}) {
    this.name = name;
    this.password = password;
    this.id = User.generateId(name);
    this.gender = gender;
    this.pronouns = pronouns;
    this.fieldOfStudy = fieldOfStudy;
    this.interests = interests.length > 0 ? interests : ["Not shared"];
  }

  static generateId(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = (hash << 5) - hash + username.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
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
    if (this.interests.includes("Not shared")) {
      this.interests = [interest];
    } else {
      this.interests.push(interest);
    }
  }
}
