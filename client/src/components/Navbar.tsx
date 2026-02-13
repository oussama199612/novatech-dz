import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm transition-transform duration-300 group-hover:rotate-6">
                            <span className="font-display text-white text-xl font-bold italic">N</span>
                        </div>
                        <span className="font-display text-2xl tracking-tighter text-black font-bold italic">NOVATECH</span>
                    </Link>

                    {/* DESKTOP MENU */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-12">
                            <Link to="/" className="text-sm font-bold uppercase tracking-wider text-black hover:text-blue-600 transition-colors">Boutique</Link>
                            <a href="#collections" className="text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors">Collections</a>
                            <a href="#about" className="text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors">À propos</a>
                        </div>
                    </div>

                    {/* CART / MOBILE */}
                    <div className="flex items-center gap-4">
                        <button className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black hover:text-blue-600 transition-colors">
                            <span>Panier (0)</span>
                        </button>

                        <div className="md:hidden">
                            <button onClick={() => setIsOpen(!isOpen)} className="text-black p-2 hover:bg-gray-100 rounded-full transition-colors">
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
                        className="md:hidden bg-white border-b border-gray-100"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            <Link to="/" className="block px-4 py-3 bg-gray-50 text-center text-black font-bold uppercase tracking-wider text-sm rounded-lg" onClick={() => setIsOpen(false)}>Boutique</Link>
                            <a href="#collections" className="block px-4 py-3 text-center text-gray-500 hover:text-black font-bold uppercase tracking-wider text-sm" onClick={() => setIsOpen(false)}>Collections</a>
                            <a href="#about" className="block px-4 py-3 text-center text-gray-500 hover:text-black font-bold uppercase tracking-wider text-sm" onClick={() => setIsOpen(false)}>À propos</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
