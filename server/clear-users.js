require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const admin = require('./config/firebase');

async function clearUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Delete all from MongoDB
        const result = await Customer.deleteMany({});
        console.log(`Deleted ${result.deletedCount} customers from MongoDB`);

        // 2. Delete all from Firebase
        let users = [];
        let pageToken;
        do {
            const listUsersResult = await admin.auth().listUsers(1000, pageToken);
            users = users.concat(listUsersResult.users);
            pageToken = listUsersResult.pageToken;
        } while (pageToken);

        if (users.length > 0) {
            const uids = users.map(user => user.uid);
            const deleteResult = await admin.auth().deleteUsers(uids);
            console.log(`Deleted ${deleteResult.successCount} users from Firebase`);
            if (deleteResult.failureCount > 0) {
                console.log(`Failed to delete ${deleteResult.failureCount} users from Firebase`);
            }
        } else {
            console.log('No users found in Firebase to delete');
        }

    } catch (error) {
        console.error('Error clearing users:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

clearUsers();
