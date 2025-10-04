const MAX_USERS = 30;
const MAX_USERS_LEADERBOARD = 15;

let users = [MAX_USERS];
let leaderboard = [MAX_USERS_LEADERBOARD];
let chat = {"123123123": User}

function createUser() {
    let usernameInput = document.getElementById("usernameInput");
    let passwordInput = document.getElementById("passwordInput");
    let newUser = new User(usernameInput.value, passwordInput.value, 0);

    newUser.id = newUser.generateID();
}