const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const PaymentMethod = require('../models/PaymentMethod');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
router.post('/', asyncHandler(async (req, res) => {
    const {
        orderItems, // array of { product(id), qty }
        customerName,
        customerEmail,
        customerPhone,
        gameId,
        paymentMethodId
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        // 1. Fetch real prices and check stock (optional)
        let dbOrderItems = [];
        let totalPrice = 0;

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404);
                throw new Error(`Product not found: ${item.product}`);
            }
            dbOrderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.qty,
                image: product.image
            });
            let itemPrice = 0;
            let remainingQty = item.qty;

            // Sort offers by quantity descending to apply best value (largest volume) first
            if (product.offers && product.offers.length > 0) {
                const sortedOffers = product.offers.sort((a, b) => b.quantity - a.quantity);

                for (const offer of sortedOffers) {
                    while (remainingQty >= offer.quantity) {
                        itemPrice += offer.price;
                        remainingQty -= offer.quantity;
                    }
                }
            }

            // Add remaining items at standard unit price
            itemPrice += remainingQty * product.price;

            dbOrderItems.push({
                product: product._id,
                name: product.name,
                price: product.price, // Unit price stored for reference
                quantity: item.qty,
                image: product.image,
                totalItemPrice: itemPrice // Store the total price for this line item (including discounts)
            });
            totalPrice += itemPrice;
        }

        const paymentMethod = await PaymentMethod.findById(paymentMethodId);
        if (!paymentMethod) {
            res.status(404);
            throw new Error('Payment method not found');
        }

        // Generate Short Order ID
        const orderId = 'CMD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

        const order = new Order({
            orderId,
            customerName,
            customerEmail,
            customerPhone,
            gameId,
            products: dbOrderItems,
            totalAmount: totalPrice,
            paymentMethodId,
            paymentMethodSnapshot: {
                name: paymentMethod.name,
                accountLabel: paymentMethod.accountLabel,
                accountValue: paymentMethod.accountValue
            },
            status: 'pending'
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
}));

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, asyncHandler(async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Order.countDocuments({});
    const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ orders, page, pages: Math.ceil(count / pageSize) });
}));

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public (should be secure ideally, but for now we follow requirement)
router.get('/:id', asyncHandler(async (req, res) => {
    // :id can be mongo ID or orderId string
    let order;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        order = await Order.findById(req.params.id).populate('products.product');
    } else {
        order = await Order.findOne({ orderId: req.params.id }).populate('products.product');
    }

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
}));

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        if (status === 'paid') {
            order.isPaid = true;
            order.paidAt = Date.now();
        }
        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
}));

module.exports = router;
