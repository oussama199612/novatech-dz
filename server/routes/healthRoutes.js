const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Category = require('../models/Category');

router.get('/', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const dbStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        const adminCount = await Admin.countDocuments();
        const productCount = await Product.countDocuments();
        const categoryCount = await Category.countDocuments();

        const health = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now(),
            database: {
                status: dbStatus[dbState] || 'unknown',
                host: mongoose.connection.host,
                collections: {
                    admins: adminCount,
                    products: productCount,
                    categories: categoryCount
                }
            },
            server: {
                node_env: process.env.NODE_ENV,
                port: process.env.PORT
            }
        };

        res.status(200).json(health);
    } catch (error) {
        res.status(503).json({
            message: 'Service Unavailable',
            error: error.message
        });
    }
});

module.exports = router;
