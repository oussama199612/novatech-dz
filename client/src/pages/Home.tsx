import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { type Product } from '../types';
import { getImageUrl } from '../utils';

// Brand Logos (Placeholders - using text for now or simple SVGs)
const BRANDS = [
    "NIKE", "ADIDAS", "PUMA", "NEW BALANCE", "ASICS", "JORDAN", "VANS", "CONVERSE"
];

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/products');
                setProducts(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Featured Collections Mock
    const COLLECTIONS = [
        { id: 1, title: 'MEN RUNNING', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop', link: '/?category=men' },
        { id: 2, title: 'WOMEN LIFESTYLE', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2612&auto=format&fit=crop', link: '/?category=women' },
        { id: 3, title: 'NEW DROPS', image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=2525&auto=format&fit=crop', link: '/?tag=new' },
    ];

    return (
        <div className="bg-white min-h-screen text-black">

            {/* 1. HERO SECTION */}
            <section className="relative h-[85vh] w-full overflow-hidden flex items-center">
                {/* Background Image/Video */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1556906781-9a412961d289?q=80&w=2000&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover object-center brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-sm font-medium tracking-wider mb-6 backdrop-blur-sm">
                            NOUVELLE COLLECTION 2026
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6 leading-none">
                            WALK YOUR <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">WAY.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 max-w-lg mb-10 font-light">
                            Découvrez notre sélection exclusive de sneakers. Performance, style et authenticité garantis.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                Acheter Maintenant <ArrowRight size={20} />
                            </button>
                            <button className="border-2 border-white text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
                                Voir les Nouveautés
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. BRANDS MARQUEE */}
            <div className="bg-black py-6 overflow-hidden whitespace-nowrap border-y border-white/10">
                <div className="inline-flex animate-marquee">
                    {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, i) => (
                        <span key={i} className="mx-8 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 opacity-50 hover:opacity-100 transition-opacity cursor-default">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>

            {/* 3. FEATURED COLLECTIONS (BENTO) */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <h2 className="text-4xl font-black mb-12 tracking-tight uppercase flex items-center gap-4">
                    Collections <span className="h-1 flex-grow bg-black"></span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                    {COLLECTIONS.map((col, index) => (
                        <div key={col.id} className={`relative group overflow-hidden rounded-2xl ${index === 0 ? 'md:col-span-2' : ''}`}>
                            <img
                                src={col.image}
                                alt={col.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h3 className="text-3xl font-black text-white uppercase italic mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {col.title}
                                </h3>
                                <Link to={col.link} className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-wider hover:underline opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 translate-y-4 group-hover:translate-y-0">
                                    Découvrir <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. TRENDING PRODUCTS */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-blue-600 font-bold uppercase tracking-wider mb-2 block">Populaire</span>
                            <h2 className="text-4xl font-black uppercase tracking-tight">Tendance Actuelle</h2>
                        </div>
                        <Link to="/products" className="hidden md:flex items-center gap-2 font-bold border-b-2 border-black pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors">
                            Voir Tout
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.slice(0, 4).map((product) => (
                                <div key={product._id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                    {/* Image */}
                                    <div className="relative aspect-square bg-gray-100 p-6 overflow-hidden">
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                                            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm uppercase">
                                                Promo
                                            </span>
                                        )}
                                        <button className="absolute bottom-4 right-4 bg-black text-white p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600">
                                            <ShoppingBag size={20} />
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5">
                                        <p className="text-sm text-gray-500 font-bold uppercase mb-1">{product.category?.name || 'Sneakers'}</p>
                                        <h3 className="font-bold text-lg leading-tight mb-2 truncate">{product.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="font-black text-xl">{product.price.toLocaleString()} DA</span>
                                                {product.compareAtPrice && (
                                                    <span className="text-sm text-gray-400 line-through">{product.compareAtPrice.toLocaleString()} DA</span>
                                                )}
                                            </div>
                                            <div className="flex text-yellow-500 text-xs">
                                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* 5. TRUST SIGNALS */}
            <section className="py-16 bg-black text-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors">
                        <ShieldCheck size={48} className="mx-auto mb-4 text-blue-500" />
                        <h3 className="font-bold text-xl uppercase mb-2">Authenticité Garantie</h3>
                        <p className="text-gray-400 text-sm">Tous nos produits sont 100% authentiques et vérifiés par nos experts.</p>
                    </div>
                    <div className="p-6 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors">
                        <Truck size={48} className="mx-auto mb-4 text-purple-500" />
                        <h3 className="font-bold text-xl uppercase mb-2">Livraison Rapide</h3>
                        <p className="text-gray-400 text-sm">Livraison express 58 wilayas. Suivi en temps réel de votre commande.</p>
                    </div>
                    <div className="p-6 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors">
                        <RotateCcw size={48} className="mx-auto mb-4 text-green-500" />
                        <h3 className="font-bold text-xl uppercase mb-2">Retour Facile</h3>
                        <p className="text-gray-400 text-sm">Satisfait ou remboursé. Vous avez 15 jours pour changer d'avis.</p>
                    </div>
                </div>
            </section>

            {/* 6. NEWSLETTER */}
            <section className="py-20 px-6 max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase mb-4">Rejoignez le Club</h2>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                    Inscrivez-vous pour recevoir les dernières sorties, les offres exclusives et -10% sur votre première commande.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="Votre adresse email"
                        className="flex-grow px-6 py-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                    <button className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase hover:bg-gray-800 transition-colors">
                        S'inscrire
                    </button>
                </div>
            </section>

        </div>
    );
};

export default Home;
