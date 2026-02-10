import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { type Product, type Category } from '../types';
import { getImageUrl } from '../utils';

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [availableFilters, setAvailableFilters] = useState<{ vendors: string[], tags: string[] }>({ vendors: [], tags: [] });

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedVendor, setSelectedVendor] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(true);

    // Fetch initial data (categories & available filters)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, filtersRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/products/filters')
                ]);
                setCategories(categoriesRes.data);
                setAvailableFilters(filtersRes.data);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch products with filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params: any = {};
                if (searchTerm) params.keyword = searchTerm;
                if (selectedCategory !== 'all') params.category = selectedCategory;
                if (selectedVendor) params.vendor = selectedVendor;
                if (selectedTag) params.tags = selectedTag;

                const { data } = await api.get('/products', { params });
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [selectedCategory, selectedVendor, selectedTag, searchTerm]);

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedVendor('');
        setSelectedTag('');
        setSearchTerm('');
    };

    const hasActiveFilters = selectedCategory !== 'all' || selectedVendor || selectedTag || searchTerm;

    return (
        <div className="space-y-8 bg-white min-h-screen">
            {/* Hero / Header */}
            <div className="relative py-20 md:py-32 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-luxury-gold/10 via-transparent to-transparent opacity-40 blur-3xl"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 space-y-6 px-4"
                >
                    <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs md:text-sm font-bold">Collection Exclusive</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-black leading-tight">
                        L'Art du <span className="italic text-luxury-gold">Gaming</span>
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto font-medium text-base md:text-lg leading-relaxed">
                        Une sélection rigoureuse d'équipements haute performance, alliant design d'exception et technologie de pointe.
                    </p>
                    <div className="pt-8">
                        <button className="glass-btn group border-black text-black hover:bg-black hover:text-white hover:border-black">
                            Découvrir la Collection
                            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Filters Bar */}
            <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-y border-gray-100 py-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center px-4 max-w-7xl mx-auto">
                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto text-sm no-scrollbar justify-start md:justify-start">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-5 py-2 whitespace-nowrap rounded-full transition-all duration-300 uppercase tracking-wider text-[10px] font-bold border ${selectedCategory === 'all' ? 'border-luxury-gold text-white bg-luxury-gold' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-400 hover:text-black'}`}
                        >
                            Tout
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat._id)}
                                className={`px-5 py-2 whitespace-nowrap rounded-full transition-all duration-300 uppercase tracking-wider text-[10px] font-bold border ${selectedCategory === cat._id ? 'border-luxury-gold text-white bg-luxury-gold' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-400 hover:text-black'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search & Advanced Filters */}
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center md:justify-end">

                        {/* Search Input */}
                        <div className="relative w-full md:w-64 border-b border-gray-300 focus-within:border-black transition-colors">
                            <Search className="absolute left-0 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="RECHERCHER..."
                                className="w-full bg-transparent border-none pl-8 pr-4 py-2 text-black placeholder-gray-400 text-xs uppercase tracking-wider focus:ring-0 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-20">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 font-serif italic">
                        <p className="text-xl">Aucune pièce d'exception trouvée.</p>
                        <button onClick={clearFilters} className="text-luxury-gold hover:underline mt-4 text-sm uppercase tracking-widest font-bold">
                            Voir toute la collection
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-12">
                        {products.map((product) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative flex flex-col h-full"
                            >
                                <Link to={`/product/${product._id}`} className="block overflow-hidden relative aspect-[4/5] bg-gray-50 mb-4">
                                    <img
                                        src={getImageUrl(product.image)}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <div className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">
                                            Privilège
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-white/90 backdrop-blur-sm border-t border-gray-100">
                                        <button className="w-full py-2 bg-black text-white uppercase tracking-widest text-[10px] font-bold hover:bg-luxury-gold transition-colors">
                                            Voir
                                        </button>
                                    </div>
                                </Link>

                                <div className="text-center space-y-1">
                                    <div className="text-[9px] text-gray-400 uppercase tracking-[0.2em]">{product.category.name}</div>
                                    <h3 className="font-serif text-base md:text-lg text-black group-hover:text-luxury-gold transition-colors duration-300 leading-tight">
                                        <Link to={`/product/${product._id}`}>
                                            {product.name}
                                        </Link>
                                    </h3>

                                    <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 pt-1">
                                        <span className="text-sm font-bold text-black">{product.price.toLocaleString()} DA</span>
                                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                                            <span className="text-xs text-gray-400 line-through">{product.compareAtPrice.toLocaleString()} DA</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
