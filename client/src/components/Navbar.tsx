import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, ChevronRight, User, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api';

const Navbar = () => {
    const { cartCount } = useCart();
    const { customer } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false); // Mobile

    const [categories, setCategories] = useState<{ _id: string; title?: string; name: string }[]>([]);
    const [settings, setSettings] = useState<Record<string, string> | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNavData = async () => {
            try {
                const [catRes, setRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/settings')
                ]);
                setCategories(catRes.data);
                setSettings(setRes.data || {});
            } catch (error) {
                console.error(error);
            }
        };
        fetchNavData();
    }, []);

    // Close menu on route change
    if (isMenuOpen && location.pathname) {
        setIsMenuOpen(false);
        setIsCategoriesExpanded(false);
    }

    if (isSearchOpen && location.pathname) {
        setIsSearchOpen(false);
        setSearchQuery('');
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
            setIsMenuOpen(false);
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>
                            {settings?.logoUrl ? (
                                <img
                                    alt="Store Logo"
                                    className="h-8 w-auto object-contain"
                                    src={`https://novatech-backend-bov0.onrender.com${settings.logoUrl}`}
                                />
                            ) : (
                                <img
                                    alt="Default Logo"
                                    className="h-8 w-auto"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCOQgTz23WUeM1iyqSxWrvX1x5gANoJxglEat90EGnWnvKF9uRVHsUQXySKU2jqiQWSpxzioPFUXkzDbq5c3J0KVImKAndla8eE-f6raFCe-IFdS6q5BSO6l6a_tUd4TGlQMYj0G35PeP36ukcWvPZ6VdlzB4VPGVg83b7irQZW9xU97mp9f0Hxk0ed7tQ9hOgtFJQVJmjsaref2LqgnnRKNof-GL6foZSTmeC6R-LaUK2wVL_DeQHk758UiOpEAkerRJSjf7R1dkI"
                                />
                            )}
                        </Link>
                        <div className="hidden md:flex gap-6 text-sm font-medium tracking-tight items-center">
                            {/* Desktop Categories Dropdown */}
                            <div className="relative group">
                                <button className="hover:text-gray-500 transition-colors text-gray-900 flex items-center gap-1 uppercase tracking-widest">
                                    Catégories <ChevronDown size={14} />
                                </button>
                                <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <div className="bg-white border border-gray-100 shadow-xl min-w-[200px] flex flex-col py-2">
                                        {categories.map(cat => (
                                            <Link
                                                key={cat._id}
                                                to={`/products?cat=${cat.name}`}
                                                className="px-6 py-3 hover:bg-gray-50 text-black text-xs uppercase tracking-widest transition-colors"
                                            >
                                                {cat.title || cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Link to="/products" className="hover:text-gray-500 transition-colors text-black font-bold tracking-widest uppercase">CATALOGUE COMPLET</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            className="hover:text-gray-500 transition-colors text-gray-900"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            {isSearchOpen ? <X size={22} strokeWidth={1.5} /> : <Search size={22} strokeWidth={1.5} />}
                        </button>
                        <Link to={customer ? "/profile" : "/auth"} className="hover:text-gray-500 transition-colors text-gray-900" onClick={() => setIsMenuOpen(false)}>
                            <User size={22} strokeWidth={1.5} />
                        </Link>
                        <Link to="/cart" className="hover:text-gray-500 transition-colors relative text-gray-900" onClick={() => setIsMenuOpen(false)}>
                            <ShoppingBag size={22} strokeWidth={1.5} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-black text-[10px] text-white font-medium w-4 h-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            className="md:hidden text-gray-900 z-50"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Search Overlay/Dropdown */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-sm z-40"
                    >
                        <div className="max-w-3xl mx-auto px-6 py-6">
                            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                                <Search size={20} className="absolute left-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 outline-none text-black pl-12 pr-4 py-4 uppercase tracking-widest text-sm focus:border-black transition-colors"
                                    autoFocus
                                />
                                <button type="submit" className="absolute right-4 text-xs font-bold text-black uppercase tracking-widest hover:text-gray-500">
                                    Rechercher
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-40 bg-white md:hidden pt-24 px-6"
                    >
                        <div className="flex flex-col gap-8 text-2xl font-serif tracking-tight text-gray-900">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-gray-100 pb-4 hover:pl-2 transition-all">
                                ACCUEIL <ChevronRight size={20} className="text-gray-400" />
                            </Link>

                            {/* Mobile Categories Accordion */}
                            <div className="border-b border-gray-100 pb-4">
                                <button
                                    onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                                    className="flex items-center justify-between w-full hover:pl-2 transition-all"
                                >
                                    CATÉGORIES
                                    <motion.div
                                        animate={{ rotate: isCategoriesExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown size={20} className="text-gray-400" />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {isCategoriesExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex flex-col gap-4 mt-6 pl-4 border-l border-gray-100 uppercase text-lg text-gray-600">
                                                {categories.map(cat => (
                                                    <Link
                                                        key={cat._id}
                                                        to={`/products?cat=${cat.name}`}
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        {cat.title || cat.name}
                                                    </Link>
                                                ))}
                                                <Link
                                                    to="/products"
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="font-bold text-black border-t border-gray-100 pt-4 mt-2"
                                                >
                                                    VOIR TOUT
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-gray-100 pb-4 text-black font-medium hover:pl-2 transition-all">
                                CATALOGUE COMPLET <ChevronRight size={20} className="text-black" />
                            </Link>
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-gray-100 pb-4 hover:pl-2 transition-all">
                                PANIER ({cartCount}) <ChevronRight size={20} className="text-gray-400" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
