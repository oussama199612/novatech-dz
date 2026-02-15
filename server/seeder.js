const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors'); // Optional if not installed, remove usage if so. I'll rely on console.
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const Category = require('./models/Category');
const PaymentMethod = require('./models/PaymentMethod');
const Settings = require('./models/Settings');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await Admin.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await PaymentMethod.deleteMany();
        await Settings.deleteMany();

        // 1. Create Admin
        const createdAdmin = await Admin.create({
            email: 'admin@novatech.com',
            password: 'password123' // Will be hashed by pre-save
        });
        console.log('Admin Created: admin@novatech.com / password123');

        // 2. Create Categories
        const categoriesData = require('./data/categories');
        const createdCategories = await Category.insertMany(categoriesData);
        console.log('Categories Created');

        // Map category slugs to IDs for product association
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.slug] = cat._id;
        });

        // 3. Create Products
        const productsData = require('./data/products');
        const enrichedProducts = productsData.map((product, index) => {
            const catId = categoryMap[product.categorySlug];
            if (!catId) {
                console.warn(`Warning: Category slug '${product.categorySlug}' not found for product '${product.name}'. Defaulting to first category.`);
            }
            return {
                ...product,
                category: catId || createdCategories[0]._id,
                orderIndex: index
            };
        });

        await Product.insertMany(enrichedProducts);
        console.log('Products Created');

        // 4. Create Payment Methods
        await PaymentMethod.insertMany([
            {
                name: 'BaridiMob',
                slug: 'baridimob',
                accountLabel: 'RIP',
                accountValue: '00799999002345678944',
                extraInfo: 'Envoyez une capture du virement sur WhatsApp.',
                displayOrder: 1
            },
            {
                name: 'USDT (RedotPay)',
                slug: 'usdt',
                accountLabel: 'Binance Pay ID / Address',
                accountValue: '123456789',
                extraInfo: 'Network: TRC20. Send screenshot.',
                displayOrder: 2
            },
            {
                name: 'Main à main',
                slug: 'cash',
                accountLabel: 'Adresse',
                accountValue: 'Store Novatech, Alger Centre',
                extraInfo: 'Paiement à la livraison ou au magasin.',
                displayOrder: 3
            }
        ]);
        console.log('Payment Methods Created');

        // 5. Create Default Settings
        await Settings.create({
            shopName: 'Novatech Store',
            currency: 'DZD',
            exchangeRate: 1,
            contactEmail: 'contact@novatech.com',
            contactPhone: '0550000000',
        });
        console.log('Settings Created');

        console.log('Data Imported!'.green || 'Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`.red || error);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // destroyData(); 
    console.log('Destroy not implemented, implementing import only.');
    process.exit();
} else {
    importData();
}
