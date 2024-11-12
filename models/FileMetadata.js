const db = require('../config/db');

const createFileMetadataTableQuery = `
  CREATE TABLE IF NOT EXISTS FileMetadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fileId INTEGER NOT NULL,
    shareableLink TEXT NOT NULL,
    FOREIGN KEY (fileId) REFERENCES Files(id) ON DELETE CASCADE,
    UNIQUE (fileId)
  );
`;

db.run(createFileMetadataTableQuery, (err) => {
    if (err) {
        console.error('Error creating FileMetadata table:', err.message);
    } else {
        console.log('FileMetadata table created successfully.');
    }
});
