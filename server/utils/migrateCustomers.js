const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' }); // Adjust if run from server folder

const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const Customer = require('../models/Customer');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const migrateCustomers = async () => {
    try {
        await connectDB();
        console.log('--- Starting Migration: Customer -> User & Profile ---');

        const customers = await Customer.find({});
        console.log(`Found ${customers.length} legacy customers to migrate.`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const oldCustomer of customers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: oldCustomer.email });
            if (existingUser) {
                console.log(`Skipping: ${oldCustomer.email} (already migrated)`);
                skippedCount++;
                continue;
            }

            // Create User Document
            const newUser = new User({
                firebaseUid: oldCustomer.firebaseUid,
                email: oldCustomer.email,
                phone: oldCustomer.phone,
                role: 'customer',
                status: 'active',
                isEmailVerified: oldCustomer.isEmailVerified || false,
                isPhoneVerified: oldCustomer.isPhoneVerified || false
            });

            const savedUser = await newUser.save();

            // Create CustomerProfile Document
            const newProfile = new CustomerProfile({
                user: savedUser._id,
                firstName: oldCustomer.firstName,
                lastName: oldCustomer.lastName,
                preferences: {
                    language: 'fr',
                    marketingOptIn: false
                }
            });

            await newProfile.save();
            migratedCount++;
            console.log(`Migrated: ${oldCustomer.email}`);
        }

        console.log('--- Migration Complete ---');
        console.log(`Successfully migrated: ${migratedCount}`);
        console.log(`Skipped (already exists): ${skippedCount}`);
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateCustomers();
