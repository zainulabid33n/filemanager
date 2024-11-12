const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('./models/File');
require('./models/FileMetadata');

const app = express();
// connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
module.exports = app;
