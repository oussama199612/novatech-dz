import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Scroll to products if category/tag is present
    useEffect(() => {
        if (searchParams.get('category') || searchParams.get('tag')) {
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [searchParams]);

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
        <div className="bg-nebula-bg min-h-screen text-nebula-text overflow-x-hidden">

            {/* 1. HERO SECTION (NEBULA) */}
            <section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center">
                {/* Background - Cosmic Effect */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-auto bg-nebula-glow opacity-40 blur-3xl animate-pulse"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h2 className="text-nebula-blue font-bold tracking-[0.3em] text-sm md:text-base mb-6 uppercase">
                            Nouvelle Collection 2026
                        </h2>
                        <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            NEBULA
                        </h1>
                        <p className="text-lg md:text-2xl text-nebula-muted max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                            Chaussures d’exception, style cosmique.<br />
                            <span className="text-sm opacity-70">Élégance, confort, finitions parfaites.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button
                                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                                className="btn-primary"
                            >
                                Découvrir la Boutique <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
                                className="btn-outline"
                            >
                                Voir les Collections
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. BRANDS MARQUEE */}
            <div className="bg-nebula-surface/50 border-y border-white/5 py-8 overflow-hidden backdrop-blur-sm">
                <div className="inline-flex animate-marquee items-center">
                    {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, i) => (
                        <span key={i} className="mx-12 text-3xl font-display font-bold text-white/20 uppercase tracking-widest hover:text-nebula-violet transition-colors duration-300 cursor-default">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>

            {/* 3. FEATURED COLLECTIONS */}
            <section className="py-24 px-6 max-w-7xl mx-auto" id="collections">
                <div className="flex items-center gap-4 mb-16">
                    <h2 className="text-3xl font-display font-bold">Collections</h2>
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-nebula-violet to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {COLLECTIONS.map((col, index) => (
                        <div key={col.id} className={`card-nebula relative overflow-hidden group h-[500px] ${index === 0 ? 'md:col-span-2' : ''}`}>
                            <img
                                src={col.image}
                                alt={col.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-nebula-bg via-transparent to-transparent"></div>

                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h3 className="text-4xl font-display font-bold text-white mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    {col.title}
                                </h3>
                                <Link to={col.link} className="inline-flex items-center gap-2 text-nebula-cyan font-semibold tracking-wider hover:underline opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 translate-y-4 group-hover:translate-y-0">
                                    EXPLORER <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. TRENDING PRODUCTS */}
            <section className="py-24 bg-nebula-bg relative" id="products">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-nebula-blue opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <span className="text-nebula-violet font-bold uppercase tracking-wider mb-2 block text-xs">Sélection Premium</span>
                            <h2 className="text-4xl font-display font-bold">
                                {searchParams.get('category') ? `Collection ${searchParams.get('category')}` : 'Tendance Cosmique'}
                            </h2>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="hidden md:flex items-center gap-2 text-nebula-muted hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
                        >
                            Voir Tout le Catalogue
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-2 border-nebula-violet border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products
                                .filter(p => !searchParams.get('category') || p.category?.name?.toLowerCase().includes(searchParams.get('category') as string))
                                .slice(0, 8)
                                .map((product) => (
                                    <Link to={`/product/${product._id}`} key={product._id} className="card-nebula group overflow-hidden flex flex-col h-full block">
                                        {/* Image */}
                                        <div className="relative aspect-[4/5] bg-[#0F1218] p-6 overflow-hidden flex items-center justify-center">
                                            <div className="absolute inset-0 bg-nebula-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                className="w-full h-full object-contain filter brightness-90 contrast-125 group-hover:scale-110 group-hover:brightness-110 transition-all duration-500 drop-shadow-xl"
                                            />
                                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                <span className="absolute top-3 left-3 bg-nebula-violet/20 text-nebula-violet border border-nebula-violet/30 text-[10px] font-bold px-2 py-1 rounded uppercase backdrop-blur-md">
                                                    -{(100 - (product.price / product.compareAtPrice * 100)).toFixed(0)}%
                                                </span>
                                            )}
                                            <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/product/${product._id}`);
                                                    }}
                                                    className="bg-white text-black p-3 rounded-full hover:bg-nebula-cyan hover:scale-110 shadow-lg"
                                                >
                                                    <ShoppingBag size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-5 flex-grow flex flex-col justify-between">
                                            <div>
                                                <p className="text-xs text-nebula-muted font-medium mb-1 tracking-wider">{product.category?.name || 'Edition Limitée'}</p>
                                                <h3 className="font-display font-bold text-lg leading-tight mb-3 text-white group-hover:text-nebula-cyan transition-colors">{product.name}</h3>
                                            </div>
                                            <div className="flex items-end justify-between mt-2 border-t border-white/5 pt-4">
                                                <div className="flex flex-col">

                                                    <span className="font-bold text-xl text-white">{product.price.toLocaleString()} DA</span>
                                                    {product.compareAtPrice && (
                                                        <span className="text-xs text-nebula-muted line-through">{product.compareAtPrice.toLocaleString()} DA</span>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className="text-nebula-violet" fill="currentColor" />)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
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
