import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, ChevronRight, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const Navbar = () => {
    const { cartCount } = useCart();
    const { customer } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Close menu on route change
    if (isMenuOpen && location.pathname) {
        setIsMenuOpen(false);
    }

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>
                            <img
                                alt="SOLACE Logo"
                                className="h-8 w-auto"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCOQgTz23WUeM1iyqSxWrvX1x5gANoJxglEat90EGnWnvKF9uRVHsUQXySKU2jqiQWSpxzioPFUXkzDbq5c3J0KVImKAndla8eE-f6raFCe-IFdS6q5BSO6l6a_tUd4TGlQMYj0G35PeP36ukcWvPZ6VdlzB4VPGVg83b7irQZW9xU97mp9f0Hxk0ed7tQ9hOgtFJQVJmjsaref2LqgnnRKNof-GL6foZSTmeC6R-LaUK2wVL_DeQHk758UiOpEAkerRJSjf7R1dkI"
                            />
                        </Link>
                        <div className="hidden md:flex gap-6 text-sm font-medium tracking-tight">
                            <div className="hidden md:flex gap-6 text-sm font-medium tracking-tight">
                                <Link to="/products" className="hover:text-gray-500 transition-colors text-gray-900">MEN</Link>
                                <Link to="/products" className="hover:text-gray-500 transition-colors text-gray-900">WOMEN</Link>
                                <Link to="/products" className="hover:text-gray-500 transition-colors text-black font-bold tracking-widest">LIMITED</Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="hover:text-gray-500 transition-colors text-gray-900">
                            <Search size={22} strokeWidth={1.5} />
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
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-gray-100 pb-4 hover:pl-2 transition-all">
                                HOMME <ChevronRight size={20} className="text-gray-400" />
                            </Link>
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-gray-100 pb-4 hover:pl-2 transition-all">
                                FEMME <ChevronRight size={20} className="text-gray-400" />
                            </Link>
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-gray-100 pb-4 text-black font-medium hover:pl-2 transition-all">
                                ÉDITION LIMITÉE <ChevronRight size={20} className="text-black" />
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
