import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../api';
import { getImageUrl } from '../utils';
import { type Product } from '../types';
import { motion } from 'framer-motion';
import FeaturesSection from '../components/FeaturesSection';

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const newArrivals = products.slice(0, 4);

    const fadeInVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-[#FAFAFA]">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-24 lg:py-32 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-12">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="order-2 lg:order-1"
                    >
                        <motion.span variants={fadeInVariants} className="text-gray-500 tracking-[0.2em] text-xs font-medium mb-4 block uppercase">Nouvelle Collection</motion.span>
                        <motion.h1 variants={fadeInVariants} className="text-5xl md:text-7xl font-serif leading-tight mb-6 text-gray-900">
                            L'ÉLÉGANCE<br />EN MOUVEMENT.
                        </motion.h1>
                        <motion.p variants={fadeInVariants} className="text-gray-500 font-light mb-10 max-w-md leading-relaxed">
                            Découvrez la prochaine génération de design. Pensée pour l'allure, conçue pour l'excellence.
                        </motion.p>
                        <motion.div variants={fadeInVariants} className="flex flex-wrap gap-4">
                            <Link to="/products" className="bg-black hover:bg-white hover:text-black border border-black text-white px-10 py-4 text-sm font-medium transition-colors text-center">
                                DÉCOUVRIR
                            </Link>
                            <Link to="/products" className="border border-gray-200 hover:border-black text-gray-900 px-10 py-4 text-sm font-medium transition-colors text-center">
                                EN SAVOIR PLUS
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="order-1 lg:order-2 relative group"
                    >
                        <div className="absolute inset-0 bg-gray-100 rounded-full blur-3xl transform scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
                        <img
                            alt="Collection Vedette"
                            className="relative z-10 w-full h-auto drop-shadow-xl transform group-hover:-translate-y-2 transition-transform duration-700"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFqkIyjB1L4t7MNj3sLd7I-qz4KijY4zaNaQuc56i7B1VxtmBNvG_DeA2F-z6a_bvh8hzn2d513-qLaBbz5pt5gmfNj_f2VJEXBJDwbJ3T4Fxr6GkJ5WASAo0Mku6ymq_JkIr-Gd-Rpv9GfPlQbVoWSKsf_H2-aKuJXEkf-OZcikxKzlzhKOATlCGVgNKEsK9jYnJsfwy9_ms8iJRhi7vobE7ZnwPrSHpV9Cl9xdIJB5ynu-FSWT0UMvmKZWxAeAy008k279uU9V8L"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Features/Badges Section */}
            <FeaturesSection />

            {/* New Arrivals Product Grid */}
            <section className="py-24" id="products">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl font-serif text-gray-900">Nouveautés</h2>
                        </div>
                        <Link to="/products" className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-2 transition-colors">
                            VOIR TOUT <ArrowRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-white border border-gray-100 aspect-square mb-4"></div>
                                    <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-100 w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
                        >
                            {newArrivals.map((product, index) => (
                                <motion.div variants={fadeInVariants} key={product._id}>
                                    <Link to={`/product/${product._id}`} className="group block">
                                        <div className="relative aspect-[4/5] bg-white border border-gray-100 overflow-hidden mb-5">
                                            <img
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                src={getImageUrl(product.image)}
                                            />
                                            <div className="absolute inset-0 bg-black/opacity-0 group-hover:bg-black/5 transition-colors duration-500"></div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/product/${product._id}`);
                                                }}
                                                className="absolute bottom-4 left-4 right-4 bg-white text-black py-3 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10 hover:bg-black hover:text-white flex items-center justify-center gap-2"
                                            >
                                                <ShoppingBag size={16} /> Ajouter au panier
                                            </button>

                                            {index === 0 && <span className="absolute top-4 left-4 bg-white/90 text-black text-[10px] uppercase tracking-wider font-medium px-2 py-1">Tendance</span>}
                                            {index === 3 && <span className="absolute top-4 left-4 bg-black/90 text-white text-[10px] uppercase tracking-wider font-medium px-2 py-1">Limité</span>}
                                        </div>
                                        <h3 className="font-medium text-base text-gray-900 group-hover:text-black transition-colors">{product.name}</h3>
                                        <p className="text-gray-400 text-sm mb-2 font-light">{product.category?.name || 'Vêtements'}</p>
                                        <p className="text-gray-900 font-medium">{product.price.toLocaleString()} DZD</p>
                                    </Link>
                                </motion.div>
                            ))}
                            {newArrivals.length === 0 && (
                                <div className="col-span-4 text-center text-gray-400 py-12 font-light">
                                    Aucun produit disponible pour le moment.
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Curated Collections */}
            <section className="py-24 bg-white border-t border-gray-100" id="collections">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >
                        <h2 className="text-3xl font-serif text-center text-gray-900">Collections Exclusives</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[700px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="md:col-span-8 relative group overflow-hidden cursor-pointer"
                            onClick={() => navigate('/products')}
                        >
                            <img
                                alt="Urbain"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDasQh1p9lp7uwbqY4dnYdCY2MSTHSmTYyqCjUfgmPXJffQHOGFczi3ujPqulT33uU1VfshE224ZNMNmO860O439raMcw_Lpc2fxkCXYJQPPS3z7SYEJma11gl4NcYYsWaOAa2Hh1bOJZ3Sps2wGoFHYTxQrCsWLfTksbI54bEJ2ntZgf8EgrfVE9fbNWeUj0LoHm0_DJxoC5AEfPweEeriJsUcWJuiALPSO9TuhOCtyd41fVLhExgZVc0ZWGFja3l4Y3FYoTzeRT2M"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10 transition-opacity duration-500 group-hover:from-black/90">
                                <p className="text-white/80 text-xs font-medium tracking-[0.2em] mb-3 uppercase">Les Essentiels</p>
                                <h3 className="text-4xl font-serif text-white mb-6">L'EXPLORATEUR URBAIN</h3>
                                <button className="text-white border-b border-white hover:border-b-2 hover:pb-0 w-fit pb-1 text-sm font-medium transition-all">DÉCOUVRIR</button>
                            </div>
                        </motion.div>

                        <div className="md:col-span-4 grid grid-rows-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative group overflow-hidden cursor-pointer"
                                onClick={() => navigate('/products')}
                            >
                                <img
                                    alt="Performance"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzJABNuN5Izh_m8qGxgnXurt1vjCG-CY1TQ6pjwcmg5Sa4mEXq-KANhYAj2CD9PPjMLgXXSTkKXU6qv3amGHW8dvp849c_88dctVfBdkCZhBZNaxuXHuR8T2IGKIa14jpMd672cWoqgq1Tn9-B4OI_9EZNgHUNaaVAg47zhb7wMU772p2iUANFMThF6sOKCCl4dyQWn0j3RnPLNrZOqc9Scz35jEa6qQckh-GjKGcGAStqMnfJYWWeGyOwzEby8OKBfO46-YFuKVoq"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                    <h3 className="text-2xl font-serif text-white">PERFORMANCE</h3>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative group overflow-hidden cursor-pointer bg-black"
                                onClick={() => navigate('/products')}
                            >
                                <img
                                    alt="Classiques"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2neNz8bB9KoWlV_jcnRQ2YdlgOkik9eOvGIQEwlbS_WXGs5uMGqNrjqs1UYKWkAtQgWOTG_h7ag03jFoSYrT0rVJsi5uEIO7ULHr9OhZDMYz-bIZla_yELQe00Zte4LXr5HZLjADhiBSv47IUJ-e-1Fj7vHtP7dvGWERnVM4zkNA4yexJFK5-zDEH-CA7lCAaTXYpSLNhndLPADciGU9Zci72qzFh4dPpGjK6qhlQKZ7NmK_bGw9HNhTVra-xy4WzXIvxeWjDhPDn"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                    <h3 className="text-2xl font-serif text-white">CLASSIQUES</h3>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
