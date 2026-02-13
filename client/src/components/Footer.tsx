import { Facebook, Mail, Camera } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-primary/10 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <img
                            alt="SOLACE Logo"
                            className="h-8 w-auto grayscale"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE2eD5QJvb7cO4K36y8N5QxzCYMH8IRILwLttSZP5jEcYvSKp7lf5iLqDfB2Q0mvkm9xsdwa2V79ClYR1r0SNb0lXP3XtI5JDs1zyIvrVyhGPuM2Sj_8snPZOac-oFuqkzb2uQHAxY9NyjvqRBMUSb-t0hhLHPZmqg0hsdNxVUBVbeV1yjHWhDC80Vbhrwgb3i5Z_r05mNHPBk6ZTO85TJcwMlXZZ2moYItg4FlH6V6AbEVxPR0-VckRL3_Wj6tCVjg7XpchIYc6kn"
                        />
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Redefining the boundaries of footwear through innovation, performance, and sustainable design. Join the movement.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                <Mail size={16} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                <Camera size={16} />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 tracking-wider text-slate-900">SHOP</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Men's Performance</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Women's Collection</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Limited Releases</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Accessories</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 tracking-wider text-slate-900">SUPPORT</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Size Guide</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 tracking-wider text-slate-900">NEWSLETTER</h4>
                        <p className="text-sm text-slate-500 mb-4">Subscribe for early access to drops.</p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="bg-background-light border-none rounded-l-lg w-full px-4 text-sm focus:ring-1 focus:ring-primary text-slate-900"
                            />
                            <button className="bg-primary text-white px-4 py-3 rounded-r-lg font-bold text-xs">JOIN</button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-primary/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <p>© 2024 SOLACE FOOTWEAR INC. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <span>TERMS OF SERVICE</span>
                        <span>SUSTAINABILITY REPORT</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
