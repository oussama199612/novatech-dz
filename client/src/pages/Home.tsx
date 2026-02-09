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
            <div className="text-center space-y-4 py-10">
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400">
                    La Référence Gaming
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Découvrez notre sélection premium d'équipements et services.
                </p>
            </div>

            {/* Filters Bar */}
            <div className="glass-panel p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto text-sm no-scrollbar">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${selectedCategory === 'all' ? 'bg-novatech-blue text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            Tout
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat._id)}
                                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${selectedCategory === cat._id ? 'bg-novatech-blue text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search & Advanced Filters */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

                        {/* Vendor Dropdown */}
                        <div className="relative group">
                            <select
                                value={selectedVendor}
                                onChange={(e) => setSelectedVendor(e.target.value)}
                                className="appearance-none bg-[#0a0a0f] border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-300 focus:outline-none focus:border-novatech-blue focus:ring-1 focus:ring-novatech-blue cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <option value="">Marque (Tout)</option>
                                {availableFilters.vendors.map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>

                        {/* Tag Dropdown */}
                        <div className="relative group">
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="appearance-none bg-[#0a0a0f] border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-300 focus:outline-none focus:border-novatech-blue focus:ring-1 focus:ring-novatech-blue cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <option value="">Tag (Tout)</option>
                                {availableFilters.tags.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-grow md:w-64">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-novatech-blue focus:ring-1 focus:ring-novatech-blue transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="p-2 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Effacer les filtres"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-novatech-blue"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl">Aucun produit trouvé.</p>
                    <button onClick={clearFilters} className="text-novatech-blue hover:underline mt-2">
                        Effacer les filtres
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel group relative overflow-hidden flex flex-col h-full hover:border-novatech-blue/30 transition-colors"
                        >
                            <div className="aspect-square w-full overflow-hidden bg-[#0a0a0f] relative">
                                <img
                                    src={getImageUrl(product.image)}
                                    alt={product.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                        PROMO
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="text-xs text-novatech-cyan mb-1 font-medium tracking-wide uppercase">{product.category.name}</div>
                                <h3 className="font-bold text-lg mb-2 leading-tight text-white group-hover:text-novatech-blue transition-colors">{product.name}</h3>

                                {/* Vendor/Tag preview if available */}
                                {(product.vendor || (product.tags && product.tags.length > 0)) && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {product.vendor && (
                                            <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">
                                                {product.vendor}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold text-novatech-gold">{product.price.toLocaleString()} DA</span>
                                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                                            <span className="text-xs text-gray-500 line-through">{product.compareAtPrice.toLocaleString()} DA</span>
                                        )}
                                    </div>
                                    <Link
                                        to={`/product/${product._id}`}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-novatech-blue text-white transition-all transform hover:scale-105 active:scale-95"
                                    >
                                        <ShoppingCart size={20} />
                                    </Link>
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
