const MAX_USERS = 30;
const MAX_USERS_LEADERBOARD = 15;
const ERR_DUPLICATE_USER = -3

let users = [MAX_USERS];
let leaderboard = [MAX_USERS_LEADERBOARD];
let chat = {"123123123": User} // Chat dictionary with id key and chat object value

function createUser() {
    let usernameInput = document.getElementById("usernameInput");
    let passwordInput = document.getElementById("passwordInput");
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

}