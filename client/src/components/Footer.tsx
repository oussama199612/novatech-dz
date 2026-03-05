import { Facebook, Mail, Camera } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <img
                            alt="SOLACE Logo"
                            className="h-8 w-auto grayscale opacity-80"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCOQgTz23WUeM1iyqSxWrvX1x5gANoJxglEat90EGnWnvKF9uRVHsUQXySKU2jqiQWSpxzioPFUXkzDbq5c3J0KVImKAndla8eE-f6raFCe-IFdS6q5BSO6l6a_tUd4TGlQMYj0G35PeP36ukcWvPZ6VdlzB4VPGVg83b7irQZW9xU97mp9f0Hxk0ed7tQ9hOgtFJQVJmjsaref2LqgnnRKNof-GL6foZSTmeC6R-LaUK2wVL_DeQHk758UiOpEAkerRJSjf7R1dkI"
                        />
                        <p className="text-gray-500 text-sm leading-relaxed font-light">
                            Redéfinir les limites de la chaussure à travers l'innovation, la performance et le design intemporel. Rejoignez le mouvement.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all text-gray-500">
                                <Facebook size={16} strokeWidth={1.5} />
                            </a>
                            <a href="#" className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all text-gray-500">
                                <Mail size={16} strokeWidth={1.5} />
                            </a>
                            <a href="#" className="w-10 h-10 border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all text-gray-500">
                                <Camera size={16} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-serif mb-6 tracking-wider text-gray-900">BOUTIQUE</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-light">
                            <li><a href="#" className="hover:text-black hover:pl-1 transition-all">Homme</a></li>
                            <li><a href="#" className="hover:text-black hover:pl-1 transition-all">Femme</a></li>
                            <li><a href="#" className="hover:text-black hover:pl-1 transition-all">Éditions Limitées</a></li>
                            <li><a href="#" className="hover:text-black hover:pl-1 transition-all">Accessoires</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-serif mb-6 tracking-wider text-gray-900">SUPPORT</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-light">
                            <li><a href="#" className="hover:text-black hover:pl-1 transition-all">Guide des Tailles</a></li>
                            <li><a href="#" className="hover:text-black hover:pl-1 transition-all">Livraison & Retours</a></li>
                            <li><a href="#" className="hover:text-black hover:pl-1 transition-all">Politique de Confidentialité</a></li>
                            <li><a href="#" className="hover:text-black hover:pl-1 transition-all">Nous Contacter</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-serif mb-6 tracking-wider text-gray-900">NEWSLETTER</h4>
                        <p className="text-sm text-gray-500 mb-4 font-light">Inscrivez-vous pour des offres exclusives.</p>
                        <div className="flex border border-gray-200">
                            <input
                                type="email"
                                placeholder="Adresse Email"
                                className="bg-transparent border-none w-full px-4 py-3 text-sm focus:ring-1 focus:ring-black text-gray-900 font-light outline-none"
                            />
                            <button className="bg-black text-white px-6 py-3 font-medium text-xs hover:bg-gray-800 transition-colors">REJOINDRE</button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-light">
                    <p>© 2026 LA CASA TECHNOLOGY. TOUS DROITS RÉSERVÉS.</p>
                    <div className="flex gap-8">
                        <span className="cursor-pointer hover:text-black transition-colors">CONDITIONS D'UTILISATION</span>
                        <span className="cursor-pointer hover:text-black transition-colors">POLITIQUE DE COOKIES</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
