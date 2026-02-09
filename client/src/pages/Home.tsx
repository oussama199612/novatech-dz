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
        <div className="space-y-8">
            {/* Hero / Header */}
            {/* Hero / Header */}
            <div className="relative py-24 md:py-32 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-luxury-gold/10 via-transparent to-transparent opacity-50 blur-3xl"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 space-y-6 px-4"
                >
                    <span className="text-luxury-gold uppercase tracking-[0.3em] text-sm font-medium">Collection Exclusive</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white">
                        L'Art du <span className="italic text-luxury-gold">Gaming</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto font-light text-lg leading-relaxed">
                        Une sélection rigoureuse d'équipements haute performance, alliant design d'exception et technologie de pointe.
                    </p>
                    <div className="pt-8">
                        <button className="glass-btn group">
                            Découvrir la Collection
                            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Filters Bar */}
            <div className="bg-luxury-black/50 border-y border-white/5 py-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center px-4">
                    {/* Category Tabs */}
                    <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto text-sm no-scrollbar justify-center md:justify-start">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-2 rounded-none transition-all duration-300 uppercase tracking-widest text-xs font-medium border ${selectedCategory === 'all' ? 'border-luxury-gold text-luxury-gold bg-luxury-gold/5' : 'border-transparent text-gray-400 hover:text-luxury-gold'}`}
                        >
                            Tout
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat._id)}
                                className={`px-6 py-2 rounded-none transition-all duration-300 uppercase tracking-widest text-xs font-medium border ${selectedCategory === cat._id ? 'border-luxury-gold text-luxury-gold bg-luxury-gold/5' : 'border-transparent text-gray-400 hover:text-luxury-gold'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search & Advanced Filters */}
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center md:justify-end">

                        {/* Search Input */}
                        <div className="relative w-full md:w-64 border-b border-white/10 focus-within:border-luxury-gold transition-colors">
                            <Search className="absolute left-0 top-2.5 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="RECHERCHER..."
                                className="w-full bg-transparent border-none pl-8 pr-4 py-2 text-white placeholder-gray-600 text-xs uppercase tracking-wider focus:ring-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-serif italic">
                    <p className="text-xl">Aucune pièce d'exception trouvée.</p>
                    <button onClick={clearFilters} className="text-luxury-gold hover:underline mt-4 text-sm uppercase tracking-widest">
                        Voir toute la collection
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 px-4">
                    {products.map((product) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative flex flex-col h-full"
                        >
                            <Link to={`/product/${product._id}`} className="block overflow-hidden relative aspect-[4/5] bg-neutral-900 mb-6">
                                <img
                                    src={getImageUrl(product.image)}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                />
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <div className="absolute top-4 left-4 bg-luxury-gold text-luxury-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                                        Privilège
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
                                    <button className="w-full py-3 bg-white text-black uppercase tracking-widest text-xs font-bold hover:bg-luxury-gold transition-colors">
                                        Voir les détails
                                    </button>
                                </div>
                            </Link>

                            <div className="text-center space-y-2">
                                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">{product.category.name}</div>
                                <h3 className="font-serif text-xl text-white group-hover:text-luxury-gold transition-colors duration-300">
                                    <Link to={`/product/${product._id}`}>
                                        {product.name}
                                    </Link>
                                </h3>

                                <div className="flex items-center justify-center gap-4 pt-1">
                                    <span className="text-sm font-medium text-gray-300">{product.price.toLocaleString()} DA</span>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <span className="text-xs text-gray-600 line-through">{product.compareAtPrice.toLocaleString()} DA</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
