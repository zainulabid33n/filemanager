const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('./models/File');
require('./models/FileMetadata');

const app = express();
// connectDB();

const corsOptions = {
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow these headers
    credentials: true,  // Allow cookies and authorization headers to be sent in cross-origin requests
};

app.use(cors(corsOptions));

app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
module.exports = app;
