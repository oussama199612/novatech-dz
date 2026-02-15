const products = [
    // SMARTPHONES
    {
        name: 'iPhone 15 Pro Max',
        description: 'Le summum de la technologie Apple. Titane, puce A17 Pro et bouton Action.',
        price: 285000,
        compareAtPrice: 300000,
        categorySlug: 'smartphones',
        stock: 15,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800', // iPhone 15 Pro-like
        hasVariants: true,
        options: [
            { name: 'Couleur', values: ['Titane Naturel', 'Titane Bleu', 'Titane Noir'] },
            { name: 'Stockage', values: ['256GB', '512GB', '1TB'] }
        ],
        variants: [
            { title: 'Titane Naturel / 256GB', price: 285000, stock: 5 },
            { title: 'Titane Bleu / 256GB', price: 285000, stock: 5 },
            { title: 'Titane Noir / 512GB', price: 310000, stock: 3 }
        ],
        features: [
            { title: 'Processeur', description: 'A17 Pro' },
            { title: 'Écran', description: 'Super Retina XDR 6.7"' },
            { title: 'Caméra', description: 'Système photo pro 48Mpx' }
        ]
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'L\'expérience ultime Galaxy avec l\'IA intégrée et un nouveau châssis en titane.',
        price: 260000,
        categorySlug: 'smartphones',
        stock: 20,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800', // Samsung-like
        features: [
            { title: 'IA', description: 'Galaxy AI intégré' },
            { title: 'S-Pen', description: 'Inclus' }
        ]
    },
    {
        name: 'Google Pixel 8 Pro',
        description: 'La puissance de Google dans votre poche. Photos incroyables et IA Gemini.',
        price: 195000,
        categorySlug: 'smartphones',
        stock: 8,
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff23?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Xiaomi 14 Ultra',
        description: 'La photographie mobile redéfinie avec Leica.',
        price: 220000,
        categorySlug: 'smartphones',
        stock: 10,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800'
    },

    // LAPTOPS
    {
        name: 'MacBook Pro 14" M3',
        description: 'Puce M3 Pro effrayante de rapidité. Écran Liquid Retina XDR.',
        price: 380000,
        categorySlug: 'laptops',
        stock: 12,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800',
        offers: [
            { quantity: 2, price: 750000, label: 'Pack Duo Pro' }
        ]
    },
    {
        name: 'Dell XPS 13 Plus',
        description: 'Design futuriste et performances sans compromis.',
        price: 290000,
        categorySlug: 'laptops',
        stock: 5,
        image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'ASUS ROG Zephyrus G14',
        description: 'Le portable gaming 14 pouces le plus puissant du monde.',
        price: 320000,
        categorySlug: 'laptops',
        stock: 7,
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Lenovo ThinkPad X1 Carbon',
        description: 'La référence des professionnels. Ultra-léger et robuste.',
        price: 250000,
        categorySlug: 'laptops',
        stock: 15,
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800'
    },

    // GAMING
    {
        name: 'PlayStation 5 Slim',
        description: 'Jouez comme jamais auparavant. Édition Standard avec lecteur disque.',
        price: 95000,
        categorySlug: 'gaming',
        stock: 50,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800',
        offers: [
            { quantity: 2, price: 185000, label: 'Pack Duo' }
        ]
    },
    {
        name: 'Xbox Series X',
        description: 'La Xbox la plus rapide et la plus puissante jamais conçue.',
        price: 92000,
        categorySlug: 'gaming',
        stock: 30,
        image: 'https://images.unsplash.com/photo-1621259182902-88546b85d398?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Nintendo Switch OLED',
        description: 'Écran OLED 7 pouces, large support ajustable et station d\'accueil avec port LAN.',
        price: 65000,
        categorySlug: 'gaming',
        stock: 40,
        image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd8463d?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Manette PS5 DualSense',
        description: 'Retour haptique, gâchettes adaptatives et micro intégré.',
        price: 12500,
        categorySlug: 'gaming',
        stock: 100,
        image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&q=80&w=800',
        hasVariants: true,
        options: [
            { name: 'Couleur', values: ['Blanc', 'Midnight Black', 'Cosmic Red'] }
        ],
        variants: [
            { title: 'Blanc', price: 12500, stock: 50 },
            { title: 'Midnight Black', price: 13000, stock: 25 },
            { title: 'Cosmic Red', price: 13500, stock: 25 }
        ]
    },

    // AUDIO
    {
        name: 'Sony WH-1000XM5',
        description: 'Le meilleur casque à réduction de bruit du marché.',
        price: 55000,
        categorySlug: 'audio',
        stock: 25,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'AirPods Pro (2e gén)',
        description: 'Jusqu’à 2x plus de réduction de bruit active. Audio spatial personnalisé.',
        price: 35000,
        categorySlug: 'audio',
        stock: 60,
        image: 'https://images.unsplash.com/photo-1603351154351-5cf99bc0f16d?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Marshall Stanmore III',
        description: 'Enceinte Bluetooth légendaire avec un son puissant.',
        price: 65000,
        categorySlug: 'audio',
        stock: 10,
        image: 'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?auto=format&fit=crop&q=80&w=800'
    },

    // ACCESSOIRES
    {
        name: 'Apple Watch Ultra 2',
        description: 'L\'aventure vous appelle. Boîtier en titane robuste de 49 mm.',
        price: 145000,
        categorySlug: 'accessories',
        stock: 15,
        image: 'https://images.unsplash.com/photo-1664478546384-d57ffe74a791?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Samsung Galaxy Watch 6',
        description: 'Votre coach bien-être au poignet.',
        price: 45000,
        categorySlug: 'accessories',
        stock: 30,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Chargeur Anker 737 GaN',
        description: '120W de puissance pour charger votre ordinateur, téléphone et tablette simultanément.',
        price: 15000,
        categorySlug: 'accessories',
        stock: 100,
        image: 'https://images.unsplash.com/photo-1688586616091-a67dd59b5ae7?auto=format&fit=crop&q=80&w=800'
    },

    // COMPOSANTS
    {
        name: 'NVIDIA RTX 4080 Super',
        description: 'Performances suralimentées pour le gaming 4K et l\'IA.',
        price: 210000,
        categorySlug: 'components',
        stock: 8,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800'
    },
    {
        name: 'Intel Core i9-14900K',
        description: '24 cœurs. Jusqu\'à 6.0 GHz. Le processeur desktop ultime.',
        price: 95000,
        categorySlug: 'components',
        stock: 20,
        image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800'
    }
];

module.exports = products;
