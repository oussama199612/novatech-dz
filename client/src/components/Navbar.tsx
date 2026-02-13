import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-nebula-bg/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-nebula-gradient flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.8)] transition-all duration-300">
                            <span className="font-display text-white text-xl font-bold">N</span>
                        </div>
                        <span className="font-display text-2xl tracking-widest text-white font-bold">NEBULA</span>
                    </Link>

                    {/* DESKTOP MENU */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-10">
                            <Link to="/" className="text-sm font-medium text-white hover:text-transparent hover:bg-clip-text hover:bg-nebula-gradient transition-all duration-300 relative group">
                                Boutique
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-nebula-gradient transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                            <button onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-nebula-muted hover:text-white transition-colors duration-300">Collections</button>
                            <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-nebula-muted hover:text-white transition-colors duration-300">Catalogue</button>
                        </div>
                    </div>

                    {/* CART / MOBILE */}
                    <div className="flex items-center gap-6">
                        <button className="hidden md:flex items-center gap-2 text-sm font-bold text-white hover:text-nebula-cyan transition-colors group">
                            <span className="bg-nebula-surface border border-white/10 p-2 rounded-lg group-hover:border-nebula-cyan/50 transition-colors">
                                Panier (0)
                            </span>
                        </button>

                        <div className="md:hidden">
                            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-nebula-surface border-b border-white/5 overflow-hidden"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            <Link to="/" className="block px-4 py-3 bg-white/5 text-center text-white font-display font-medium rounded-lg border border-white/5" onClick={() => setIsOpen(false)}>Boutique</Link>
                            <a href="#collections" className="block px-4 py-3 text-center text-nebula-muted hover:text-white font-medium" onClick={() => setIsOpen(false)}>Collections</a>
                            <a href="#about" className="block px-4 py-3 text-center text-nebula-muted hover:text-white font-medium" onClick={() => setIsOpen(false)}>À propos</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
