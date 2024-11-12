const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Set the path for your SQLite database file
const dbPath = path.resolve(__dirname, 'filemanagement.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

module.exports = db;
