const app = require('./app');
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
