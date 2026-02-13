import React from 'react';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                            <span className="font-display text-white font-bold">N</span>
                        </div>
                        <span className="font-display text-xl tracking-tight text-slate-900 dark:text-white font-bold">NEBULA</span>
                    </Link>

                    {/* DESKTOP MENU */}
                    <div className="hidden md:flex gap-6 text-sm font-medium tracking-tight">
                        <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">MEN</Link>
                        <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">WOMEN</Link>
                        <Link to="/" className="text-primary font-bold tracking-widest hover:text-primary/80 transition-colors">LIMITED</Link>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-6">
                    <button className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                        <Search size={20} />
                    </button>
                    <button className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors relative">
                        <ShoppingBag size={20} />
                        <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
                    </button>
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-background-dark border-b border-primary/10 overflow-hidden"
                    >
                        <div className="px-6 py-6 space-y-4">
                            <Link to="/" className="block text-slate-900 dark:text-white font-bold hover:text-primary" onClick={() => setIsOpen(false)}>MEN</Link>
                            <Link to="/" className="block text-slate-900 dark:text-white font-bold hover:text-primary" onClick={() => setIsOpen(false)}>WOMEN</Link>
                            <Link to="/" className="block text-primary font-bold hover:text-primary/80" onClick={() => setIsOpen(false)}>LIMITED</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
