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
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
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
                                <Link to="/products" className="hover:text-primary transition-colors text-slate-900">MEN</Link>
                                <Link to="/products" className="hover:text-primary transition-colors text-slate-900">WOMEN</Link>
                                <Link to="/products" className="hover:text-primary transition-colors text-primary font-bold tracking-widest">LIMITED</Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="hover:text-primary transition-colors text-slate-900">
                            <Search size={24} />
                        </button>
                        <Link to={customer ? "/profile" : "/auth"} className="hover:text-primary transition-colors text-slate-900" onClick={() => setIsMenuOpen(false)}>
                            <User size={24} />
                        </Link>
                        <Link to="/cart" className="hover:text-primary transition-colors relative text-slate-900" onClick={() => setIsMenuOpen(false)}>
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            className="md:hidden text-slate-900 z-50"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                        <div className="flex flex-col gap-8 text-2xl font-bold tracking-tight">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-slate-100 pb-4">
                                HOME <ChevronRight size={20} className="text-slate-400" />
                            </Link>
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-slate-100 pb-4">
                                MEN <ChevronRight size={20} className="text-slate-400" />
                            </Link>
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-slate-100 pb-4">
                                WOMEN <ChevronRight size={20} className="text-slate-400" />
                            </Link>
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-slate-100 pb-4 text-primary">
                                LIMITED EDITION <ChevronRight size={20} className="text-primary" />
                            </Link>
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between border-b border-slate-100 pb-4">
                                CART ({cartCount}) <ChevronRight size={20} className="text-slate-400" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
