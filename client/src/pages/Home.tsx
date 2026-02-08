import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { type Product, type Category } from '../types';
import { getImageUrl } from '../utils';

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category._id === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto text-sm">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${selectedCategory === 'all' ? 'bg-novatech-blue text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        Tout
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategory(cat._id)}
                            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${selectedCategory === cat._id ? 'bg-novatech-blue text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-novatech-blue transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel group relative overflow-hidden flex flex-col"
                        >
                            <div className="aspect-video w-full overflow-hidden bg-[#0a0a0f]">
                                import {getImageUrl} from '../utils';

                                // ... (keep existing imports)

                                // In the component:
                                <img
                                    src={getImageUrl(product.image)}
                                    alt={product.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="text-xs text-novatech-cyan mb-1 font-medium">{product.category.name}</div>
                                <h3 className="font-bold text-lg mb-2 leading-tight">{product.name}</h3>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-xl font-bold text-novatech-gold">{product.price.toLocaleString()} DZD</span>
                                    <Link
                                        to={`/order/${product._id}`}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-novatech-blue transition-colors"
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
