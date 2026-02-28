const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const PaymentMethod = require('../models/PaymentMethod');
const { protect } = require('../middleware/authMiddleware');
const { protectCustomer } = require('../middleware/customerAuthMiddleware');

// @desc    Get logged in customer orders
// @route   GET /api/orders/myorders
// @access  Private (Customer)
router.get('/myorders', protectCustomer, asyncHandler(async (req, res) => {
    // Find all orders where the email or phone matches the logged-in customer's details
    const orders = await Order.find({
        $or: [
            { customerEmail: req.customer.email },
            { customerPhone: req.customer.phone }
        ]
    })
        .populate('products.product')
        .sort({ createdAt: -1 });

    res.json(orders);
}));

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
        paymentMethodId,
        storeId
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

            // OLD LOCATION OF PUSH REMOVED TO PREVENT DUPLICATION

            let unitPrice = product.price; // Default to base price

            // Decrement Stock Logic & Determine Unit Price
            if (product.hasVariants && item.variant) {
                const variantIndex = product.variants.findIndex(v => v.title === item.variant.title);
                if (variantIndex > -1) {
                    let localStockAvailable = false;

                    if (storeId) {
                        const locIdx = product.variants[variantIndex].locationsStock?.findIndex(l => l.store.toString() === storeId);
                        if (locIdx > -1) {
                            if (product.variants[variantIndex].locationsStock[locIdx].stock >= item.qty) {
                                product.variants[variantIndex].locationsStock[locIdx].stock -= item.qty;
                                localStockAvailable = true;
                            }
                        }
                    }

                    if (product.variants[variantIndex].stock < item.qty) {
                        res.status(400);
                        throw new Error(`Stock global insuffisant pour ${product.name} - ${item.variant.title}`);
                    }
                    if (storeId && !localStockAvailable) {
                        res.status(400);
                        throw new Error(`Stock local insuffisant dans ce magasin pour ${product.name} - ${item.variant.title}`);
                    }

                    product.variants[variantIndex].stock -= item.qty;
                    // Also decrement total stock if you track it
                    product.stock -= item.qty;

                    // USE VARIANT PRICE
                    unitPrice = product.variants[variantIndex].price;
                }
            } else {
                let localStockAvailable = false;
                if (storeId) {
                    const locIdx = product.locationsStock?.findIndex(l => l.store.toString() === storeId);
                    if (locIdx > -1) {
                        if (product.locationsStock[locIdx].stock >= item.qty) {
                            product.locationsStock[locIdx].stock -= item.qty;
                            localStockAvailable = true;
                        }
                    }
                }

                if (product.stock < item.qty) {
                    res.status(400);
                    throw new Error(`Stock global insuffisant pour ${product.name}`);
                }
                if (storeId && !localStockAvailable) {
                    res.status(400);
                    throw new Error(`Stock local insuffisant dans ce magasin pour ${product.name}`);
                }

                product.stock -= item.qty;
            }
            await product.save();

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

            // Add remaining items at standard unit price (Variant Price or Base Price)
            itemPrice += remainingQty * unitPrice;

            dbOrderItems.push({
                product: product._id,
                name: product.name,
                price: unitPrice, // Save the actual unit price used
                quantity: item.qty,
                image: item.variant?.image || product.image, // Use variant image if available
                variant: item.variant, // SAVE THE VARIANT
                options: item.options, // SAVE THE OPTIONS
                totalItemPrice: itemPrice
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
            store: storeId || undefined,
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
        .populate('store', 'name city')
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
        order = await Order.findById(req.params.id).populate('products.product').populate('store', 'name city address');
    } else {
        order = await Order.findOne({ orderId: req.params.id }).populate('products.product').populate('store', 'name city address');
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

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        await order.deleteOne();
        res.json({ message: 'Order removed' });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
}));

module.exports = router;
