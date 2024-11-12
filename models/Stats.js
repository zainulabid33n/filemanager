const db = require('../config/db');

const createStatisticsTableQuery = `
  CREATE TABLE IF NOT EXISTS Statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fileId INTEGER NOT NULL,
    viewCount INTEGER DEFAULT 0,
    FOREIGN KEY (fileId) REFERENCES Files(id) ON DELETE CASCADE
  );
`;

db.run(createStatisticsTableQuery, (err) => {
    if (err) {
        console.error('Error creating Statistics table:', err.message);
    } else {
        console.log('Statistics table created successfully.');
    }
});
