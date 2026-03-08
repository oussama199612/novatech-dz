const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Family = require('./models/Family');
const connectDB = require('./config/db');

dotenv.config();

const seedFamilies = async () => {
    await connectDB();
    console.log('Inserting default families with SimpleIcons CDN URLs...');

    const familiesToInsert = [
        {
            name: "Burger King",
            slug: "burger-king",
            image: "https://cdn.simpleicons.org/burgerking/#DA291C",
            showInHomeBar: true
        },
        {
            name: "KFC",
            slug: "kfc",
            image: "https://cdn.simpleicons.org/kfc/#E4002B",
            showInHomeBar: true
        },
        {
            name: "Subway",
            slug: "subway",
            image: "https://cdn.simpleicons.org/subway/#008938",
            showInHomeBar: true
        },
        {
            name: "Domino's Pizza",
            slug: "dominos",
            image: "https://cdn.simpleicons.org/dominos/#0078D2",
            showInHomeBar: true
        },
        {
            name: "Starbucks",
            slug: "starbucks",
            image: "https://cdn.simpleicons.org/starbucks/#00704A",
            showInHomeBar: true
        },
        {
            name: "Taco Bell",
            slug: "taco-bell",
            image: "https://cdn.simpleicons.org/tacobell/#702082",
            showInHomeBar: true
        },
        {
            name: "McDonald's",
            slug: "mcdonalds",
            image: "https://cdn.simpleicons.org/mcdonalds/#FFC72C",
            showInHomeBar: true
        }
    ];

    try {
        await Family.deleteMany(); // Clear existing
        await Family.insertMany(familiesToInsert);
        console.log('Families embedded successfully with SimpleIcons URLs!');
    } catch (error) {
        console.error('Error inserting families:', error);
    } finally {
        process.exit(0);
    }
};

seedFamilies();
