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
        const categories = await Category.insertMany([
            { name: 'Gaming PC', slug: 'gaming-pc', icon: 'Cpu' },
            { name: 'Peripherals', slug: 'peripherals', icon: 'Keyboard' },
            { name: 'Components', slug: 'components', icon: 'HardDrive' },
            { name: 'Laptops', slug: 'laptops', icon: 'Laptop' },
        ]);
        console.log('Categories Created');

        // 3. Create Products
        const products = [
            {
                name: 'RTX 4090 Gaming PC',
                description: 'Ultimate gaming machine with i9-14900K and RTX 4090.',
                price: 850000,
                image: 'https://via.placeholder.com/600x400.png?text=RTX+4090+PC',
                category: categories[0]._id,
                stock: 5,
                orderIndex: 0
            },
            {
                name: 'Mechanical Keyboard RGB',
                description: 'Blue switches, fully customizable RGB.',
                price: 12000,
                image: 'https://via.placeholder.com/600x400.png?text=Keyboard',
                category: categories[1]._id,
                stock: 50,
                orderIndex: 1
            },
            {
                name: 'Gaming Mouse Wireless',
                description: 'Lightweight, ultra-fast response.',
                price: 8500,
                image: 'https://via.placeholder.com/600x400.png?text=Mouse',
                category: categories[1]._id,
                stock: 100,
                orderIndex: 2
            },
            {
                name: 'Curved Monitor 27"',
                description: '165Hz refresh rate, 1ms response time.',
                price: 45000,
                image: 'https://via.placeholder.com/600x400.png?text=Monitor',
                category: categories[1]._id,
                stock: 10,
                orderIndex: 3
            },
        ];
        await Product.insertMany(products);
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
