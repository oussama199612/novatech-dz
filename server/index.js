const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow loading images from different origins/same site
}));

// CORS Configuration
app.use(cors({
    origin: '*', // Allow all origins for simplicity in this crisis
    credentials: false // Must be false if origin is *
}));

// Debug Middleware for logging requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send('Novatech API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment-methods', require('./routes/paymentMethodRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

// Static Folder for Uploads
const __dirname1 = path.resolve();
app.use('/api/uploads', express.static(path.join(__dirname1, '/uploads')));
app.use('/uploads', express.static(path.join(__dirname1, '/uploads')));

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
