class User {
    constructor(name, password, id) {
        this.name = name;
        this.password = password;
        this.id = id;
    }  
}
// Leaderboard class tracking users and their connection
class Leaderboard {
  constructor() {
    // Create a Map to store users and their total connections.
    // Key: userId (string), Value: number of connections.
    this.users = new Map();
  }

  // Add or update a user's connections
  addConnection(userId, connections) {
    // Check if the user already exists in the leaderboard
    if (this.users.has(userId)) {
      // If they exist, add the new connections to their current total
      this.users.set(userId, this.users.get(userId) + connections);
    } else {
      // If they don't exist, create a new entry with their initial connections
      this.users.set(userId, connections);
    }
  }

  // Get top N users by number of connections
  getTop(n) {
    return [...this.users.entries()] // Convert Map into an array of [userId, connections] pairs
      .sort((a, b) => b[1] - a[1])   // Sort users in descending order of connections (highest first)
      .slice(0, n)                    // Take the top N users from the sorted list
      .map(([id, connections], i) => ({ // Transform each entry into a structured object
        rank: i + 1,                  // Assign rank (1-based index)
        userId: id,                   // Include the user's ID
        connections,                  // Include total number of connections
      }));
  }

  // Get a specific user's rank and connection count
  getRank(userId) {
    // Sort all users in descending order by connections
    const sorted = [...this.users.entries()].sort((a, b) => b[1] - a[1]);
    
    // Find the index (position) of the given userId in the sorted array
    const rank = sorted.findIndex(([id]) => id === userId);
    
    // If the user doesn't exist, return null
    if (rank === -1) return null;
    
    // If found, return an object with their ID, total connections, and rank (1-based)
    return { 
      userId, 
      connections: this.users.get(userId), // Get their total connections from the Map
      rank: rank + 1                       // Convert from 0-based index to 1-based rank
    };
  }
}