import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db/connection.js';
import customerRoutes from './routes/customerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import technicianRoutes from './routes/technicianRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7070;

// Middleware
app.use(cors());
// Increase body size limit to handle base64 image uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to Database
connectDB();

// Routes
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/contact', contactRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Anterc API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
