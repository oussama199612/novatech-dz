import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Copy, ShoppingCart, Star, Shield, Zap, Box, ArrowRight, Wallet, Image as ImageIcon } from 'lucide-react';
import api from '../api';
import { getImageUrl } from '../utils';
import { type Product, type PaymentMethod } from '../types';

const ProductLanding = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [activeImage, setActiveImage] = useState('');
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Order Form State (Integrated)
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        gameId: '',
    });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const [prodRes, methodsRes] = await Promise.all([
                    api.get(`/products/${productId}`),
                    api.get('/payment-methods')
                ]);
                setProduct(prodRes.data);
                if (prodRes.data.image) setActiveImage(prodRes.data.image);
                setMethods(methodsRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [productId]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !selectedMethodId) return;

        try {
            const orderData = {
                orderItems: [{ product: product._id, qty: 1 }],
                ...formData,
                paymentMethodId: selectedMethodId
            };

            const { data: order } = await api.post('/orders', orderData);

            const method = methods.find(m => m._id === selectedMethodId);
            const message = `
*NOUVELLE COMMANDE* 🛍️
------------------
*Produit:* ${product.name}
*Prix:* ${product.price} DZD
*Client:* ${formData.customerName}
*ID Commande:* ${order.orderId}
------------------
*Paiement:* ${method?.name}
Merci de confirmer ma commande !
`.trim();

            const encodedMsg = encodeURIComponent(message);
            // Replace with configurable number if available
            const whatsappUrl = `https://wa.me/213550000000?text=${encodedMsg}`;

            window.open(whatsappUrl, '_blank');
            navigate('/success');
        } catch (error) {
            alert('Erreur lors de la commande. Veuillez réessayer.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Chargement...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-white">Produit introuvable</div>;

    const accentColor = product.accentColor || '#3b82f6';

    // Dynamic Icon component
    const FeatureIcon = ({ name }: { name: string }) => {
        const icons: any = { Shield, Zap, Box, Star, Check };
        const Icon = icons[name] || Star;
        return <Icon size={24} style={{ color: accentColor }} />;
    };

    return (
        <div className="min-h-screen pb-20 overflow-x-hidden">
            {/* 1. HERO SECTION */}
            <div className="relative min-h-[80vh] flex items-center">
                {/* Background Glow */}
                <div
                    className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
                    style={{ backgroundColor: accentColor }}
                />

                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6 z-10"
                    >
                        <div
                            className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border"
                            style={{ borderColor: `${accentColor}40`, color: accentColor, backgroundColor: `${accentColor}10` }}
                        >
                            {product.category?.name || 'Gaming'}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                            {product.name}
                        </h1>

                        <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
                            {product.description}
                        </p>

                        <div className="flex items-end gap-4 py-4">
                            <span className="text-5xl font-bold text-white tracking-tight">
                                {product.price.toLocaleString()} <span className="text-2xl text-slate-500 font-normal">DZD</span>
                            </span>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 transform hover:-translate-y-1 transition-all flex items-center gap-3"
                                style={{ backgroundColor: accentColor }}
                            >
                                <ShoppingCart size={20} />
                                Commander Maintenant
                            </button>
                        </div>
                    </motion.div>

                    {/* Right: Immersive Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-0"
                    >
                        <div className="relative aspect-square max-h-[600px] mx-auto">
                            <img
                                src={getImageUrl(activeImage)}
                                className="w-full h-full object-contain drop-shadow-2xl"
                                alt={product.name}
                            />
                            {/* Reflection effect */}
                            <div
                                className="absolute -bottom-8 left-0 right-0 h-24 bg-gradient-to-t from-[#020617] to-transparent z-10"
                            />
                        </div>

                        {/* Gallery Thumbs */}
                        {product.gallery && product.gallery.length > 0 && (
                            <div className="flex gap-3 justify-center mt-8 overflow-x-auto pb-4">
                                <button
                                    onClick={() => setActiveImage(product.image)}
                                    className={`w-20 h-20 rounded-lg border-2 p-1 transition-all ${activeImage === product.image ? 'border-white' : 'border-slate-800 opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={getImageUrl(product.image)} className="w-full h-full object-cover rounded" />
                                </button>
                                {product.gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-20 h-20 rounded-lg border-2 p-1 transition-all ${activeImage === img ? 'border-white' : 'border-slate-800 opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={getImageUrl(img)} className="w-full h-full object-cover rounded" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* 2. FEATURES GRID (If any) */}
            {product.features && product.features.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {product.features.map((feat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl hover:border-slate-600 transition-colors"
                            >
                                <div className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800">
                                    <FeatureIcon name={feat.icon || 'Star'} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                                <p className="text-slate-400">{feat.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. DETAILED CONTENT & CHECKOUT */}
            <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left: Long Description */}
                <div className="lg:col-span-7 space-y-8">
                    <h2 className="text-3xl font-bold text-white">À Propos</h2>
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        {product.longDescription ? (
                            <div className="whitespace-pre-line leading-relaxed">
                                {product.longDescription}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">Aucune description détaillée disponible.</p>
                        )}
                    </div>
                </div>

                {/* Right: Checkout Sticky Card */}
                <div className="lg:col-span-5 relative" id="order-section">
                    <div className="sticky top-24">
                        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
                            {/* Decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none" style={{ backgroundColor: accentColor }} />

                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Wallet className="text-slate-400" />
                                Finaliser votre commande
                            </h3>

                            <form onSubmit={handleSubmitOrder} className="space-y-4 relative z-10">
                                <div className="space-y-3">
                                    <input required placeholder="Nom complet" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                    <input required type="email" placeholder="Email" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                    <input required type="tel" placeholder="Téléphone (WhatsApp)" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                    <input placeholder="ID Joueur (si applicable)" value={formData.gameId} onChange={e => setFormData({ ...formData, gameId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                </div>

                                <div className="pt-4">
                                    <label className="text-sm font-bold text-slate-400 mb-3 block uppercase">Moyen de Paiement</label>
                                    <div className="space-y-2">
                                        {methods.map(method => (
                                            <div key={method._id}>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedMethodId(method._id)}
                                                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${selectedMethodId === method._id ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                                >
                                                    <span className="font-medium">{method.name}</span>
                                                    {selectedMethodId === method._id && <Check size={18} style={{ color: accentColor }} />}
                                                </button>
                                                {selectedMethodId === method._id && (
                                                    <div className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 text-sm flex justify-between items-center animate-in slide-in-from-top-2">
                                                        <span className="font-mono text-slate-300">{method.accountValue}</span>
                                                        <button type="button" onClick={() => handleCopy(method.accountValue)} className="text-slate-500 hover:text-white">
                                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!selectedMethodId}
                                    className="w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    style={{ backgroundColor: selectedMethodId ? accentColor : '#1e293b' }}
                                >
                                    Confirmer la Commande <ArrowRight size={20} />
                                </button>
                                <p className="text-center text-xs text-slate-500 mt-4">
                                    Paiement sécurisé et traitement rapide.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductLanding;
