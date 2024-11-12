const db = require('../config/db');

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS Files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    fileType TEXT NOT NULL,
    tags TEXT,
    userId INTEGER,
    views INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES Users(id)
  );
`;

db.run(createTableQuery, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Files table created successfully.');
    }
});