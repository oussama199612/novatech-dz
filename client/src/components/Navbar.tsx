import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/">
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
                    <button className="hover:text-primary transition-colors relative text-slate-900">
                        <ShoppingBag size={24} />
                        <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
                    </button>
                    <button className="md:hidden text-slate-900">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
