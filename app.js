const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('./models/File');
require('./models/FileMetadata');

const app = express();
// connectDB();

app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL (local or production)
    methods: 'GET, POST, PUT, DELETE', // Allowed HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Allowed headers
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
module.exports = app;
