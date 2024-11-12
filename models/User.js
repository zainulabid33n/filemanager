const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./file_manager.db'); // Path to your SQLite database file

// Create user table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
`);

const createUser = (username, email, password, callback) => {
    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    stmt.run(username, email, password, function (err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id: this.lastID, username, email }); // Return the created user object
    });
};

const findUserByEmail = (email, callback) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
            return callback(err);
        }
        callback(null, row); // Return the user if found
    });
};

module.exports = { createUser, findUserByEmail };
