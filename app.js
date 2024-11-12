const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('./models/File');
require('./models/FileMetadata');

const app = express();
// connectDB();

app.use(cors({
    origin: '*', // Allow your frontend's domain (localhost:3000) to make requests
    methods: 'GET, POST, PUT, DELETE', // Specify the allowed HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Specify the allowed headers
}));

app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
module.exports = app;
