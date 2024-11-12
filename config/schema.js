const db = require('./config/db');

const createTables = () => {
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // Create Files table
    db.run(`CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT NOT NULL,
        path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Create Tags table
    db.run(`CREATE TABLE IF NOT EXISTS file_tags (
        file_id INTEGER,
        tag TEXT,
        FOREIGN KEY (file_id) REFERENCES files (id)
    )`);

    // Create Statistics table
    db.run(`CREATE TABLE IF NOT EXISTS file_stats (
        file_id INTEGER,
        views INTEGER DEFAULT 0,
        FOREIGN KEY (file_id) REFERENCES files (id)
    )`);
};

createTables();
