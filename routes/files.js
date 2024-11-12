const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const db = require('../config/db'); // Your SQLite3 DB configuration
const { v4: uuidv4 } = require('uuid'); // For generating unique shareable links
const path = require('path');
const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Ensure the 'uploads' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '')}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not supported'), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }  // Example: Limit file size to 10MB
});

// 1. File Upload (POST)
// 1. File Upload (POST)
router.post('/upload', auth, upload.single('file'), (req, res) => {
    try {
        const { tags } = req.body;

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Ensure userId is available (from authenticated user)
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        // Insert the file record into the Files table
        const insertFileQuery = `
            INSERT INTO Files (filename, path, fileType, tags, userId)
            VALUES (?, ?, ?, ?, ?)
        `;
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).join(',') : '';

        db.run(insertFileQuery, [req.file.filename, req.file.path, req.file.mimetype.startsWith('image') ? 'image' : 'video', tagsArray, userId], function (err) {
            if (err) {
                console.error('Error inserting file:', err.message);
                return res.status(500).json({ error: 'Failed to upload file' });
            }

            const fileId = this.lastID;  // Get the inserted file ID
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            // Create a unique shareable link for the file
            const shareableLink = uuidv4();

            // Insert the file metadata
            const insertMetadataQuery = `
                INSERT INTO FileMetadata (fileId, shareableLink)
                VALUES (?, ?)
            `;
            db.run(insertMetadataQuery, [fileId, shareableLink], function (err) {
                if (err) {
                    console.error('Error inserting file metadata:', err.message);
                    return res.status(500).json({ error: 'Failed to upload file metadata' });
                }

                // Respond with the file metadata, including the URL
                res.status(201).json({
                    file: {
                        id: fileId,
                        filename: req.file.filename,
                        path: req.file.path,
                        fileType: req.file.mimetype.startsWith('image') ? 'image' : 'video',
                        tags: tagsArray.split(','),
                        userId: userId,
                        url: fileUrl  // Include the file URL here
                    },
                    fileMetadata: {
                        id: this.lastID,
                        shareableLink
                    }
                });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload file', details: err.message });
    }
});


// 2. Retrieving User Files (GET)
router.get('/', auth, (req, res) => {
    try {
        // Fetch files associated with the user
        const query = `SELECT * FROM Files WHERE userId = ?`;
        db.all(query, [req.user.id], (err, rows) => {
            if (err) {
                console.error('Error fetching files:', err.message);
                return res.status(500).json({ error: 'Failed to retrieve files' });
            }

            // Construct URLs for each file
            const files = rows.map(file => ({
                ...file,
                url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
            }));

            res.json(files);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve files' });
    }
});


// 3. Tagging Files (PATCH)
router.patch('/:fileId/tags', auth, (req, res) => {
    try {
        const { tags } = req.body;

        // Validate tags field
        if (!tags || typeof tags !== 'string') {
            return res.status(400).json({ error: 'Tags must be a non-empty string' });
        }

        // Process and sanitize tags
        const tagsArray = tags.split(',').map(tag => tag.trim()).join(',');

        // Update tags for the specified file
        const updateTagsQuery = `
            UPDATE Files
            SET tags = ?
            WHERE id = ? AND userId = ?
        `;

        db.run(updateTagsQuery, [tagsArray, req.params.fileId, req.user.id], function (err) {
            if (err) {
                console.error('Error updating tags:', err.message);
                return res.status(500).json({ error: 'Failed to update tags' });
            }

            // Check if the update affected any rows (indicating a successful update)
            if (this.changes === 0) {
                return res.status(404).json({ message: 'File not found or not authorized' });
            }

            res.json({ message: 'Tags updated successfully' });
        });
    } catch (err) {
        console.error('Unexpected error:', err.message);
        res.status(500).json({ error: 'Failed to update tags' });
    }
});


// 4. Generating Shareable Link (GET)
// router.get('/file/url/:id', auth, (req, res) => {
//     const fileId = req.params.id;

//     const getFileQuery = `
//         SELECT filename
//         FROM Files
//         WHERE id = ? AND userId = ?
//     `;

//     db.get(getFileQuery, [fileId, req.user.id], (err, file) => {
//         if (err) {
//             console.error('Error retrieving file:', err.message);
//             return res.status(500).json({ error: 'Failed to retrieve file' });
//         }

//         if (!file) {
//             return res.status(404).json({ error: 'File not found' });
//         }

//         // Construct the file URL
//         const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

//         // Respond with the URL only
//         res.json({ url: fileUrl });
//     });
// });


router.get('/file/share/:id', auth, (req, res) => {
    const fileId = req.params.id;

    // Check if the file exists and belongs to the user
    const getFileQuery = `
        SELECT id
        FROM Files
        WHERE id = ? AND userId = ?
    `;

    db.get(getFileQuery, [fileId, req.user.id], (err, file) => {
        if (err) {
            console.error('Error retrieving file:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve file' });
        }

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Create a unique shareable link ID
        const shareableLink = uuidv4();

        // Insert or update the shareable link in FileMetadata
        const upsertMetadataQuery = `
            INSERT INTO FileMetadata (fileId, shareableLink)
            VALUES (?, ?)
            ON CONFLICT(fileId) DO UPDATE SET shareableLink = ?
        `;

        db.run(upsertMetadataQuery, [fileId, shareableLink, shareableLink], function (err) {
            if (err) {
                console.error('Error creating shareable link:', err.message);
                return res.status(500).json({ error: 'Failed to create shareable link' });
            }

            // Respond with the shareable URL
            const url = `${req.protocol}://${req.get('host')}/api/files/file/view/${shareableLink}`;
            res.json({ url });
        });
    });
});


router.get('/file/view/:shareableLink', (req, res) => {
    const shareableLink = req.params.shareableLink;

    const query = `
        SELECT f.filename, f.path, f.fileType
        FROM FileMetadata fm
        JOIN Files f ON f.id = fm.fileId
        WHERE fm.shareableLink = ?
    `;

    db.get(query, [shareableLink], (err, row) => {
        if (err) {
            console.error('Error fetching file for shareable link:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve file' });
        }

        if (!row) {
            return res.status(404).json({ message: 'File not found or invalid shareable link' });
        }

        // Construct the absolute path to the file
        const filePath = path.join(__dirname, '../', row.path);
        console.log('Serving file from:', filePath);

        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err.message);
                res.status(500).json({ error: 'Error retrieving file' });
            }
        });
    });
});


module.exports = router;