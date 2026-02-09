import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-luxury-black/90 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 border border-luxury-gold flex items-center justify-center rounded-sm transition-all duration-500 group-hover:rotate-45">
                            <span className="font-serif text-luxury-gold text-2xl group-hover:-rotate-45 transition-transform duration-500">N</span>
                        </div>
                        <span className="font-serif text-2xl tracking-[0.2em] text-white">NOVATECH</span>
                    </Link>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-12">
                            <Link to="/" className="text-sm uppercase tracking-widest text-luxury-gold hover:text-white transition-colors duration-300">Boutique</Link>
                            <a href="#about" className="text-sm uppercase tracking-widest text-gray-400 hover:text-luxury-gold transition-colors duration-300">À propos</a>
                            <a href="#contact" className="text-sm uppercase tracking-widest text-gray-400 hover:text-luxury-gold transition-colors duration-300">Contact</a>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-luxury-gold p-2 hover:bg-white/5 rounded-full transition-colors">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-luxury-black border-b border-white/5"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            <Link to="/" className="block px-3 py-3 text-center text-luxury-gold border border-luxury-gold/30 rounded-none uppercase tracking-widest text-sm">Boutique</Link>
                            <a href="#about" className="block px-3 py-3 text-center text-gray-400 hover:text-white uppercase tracking-widest text-sm">À propos</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
