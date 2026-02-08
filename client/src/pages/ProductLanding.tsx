import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, ShoppingCart, Star, Shield, Zap, Box, ArrowRight, Truck, CreditCard, Lock, ChevronDown, ChevronUp } from 'lucide-react';
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

    // Order Form State
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        gameId: '',
    });
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'desc' | 'features'>('desc');

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

            const whatsappUrl = `https://wa.me/213550000000?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            navigate('/success');
        } catch (error) {
            alert('Erreur lors de la commande.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Chargement...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-white">Produit introuvable</div>;

    const accentColor = product.accentColor || '#3b82f6';
    const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);

    return (
        <div className="min-h-screen pb-20 bg-[#0a0a0f]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: GALLERY (Sticky) */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-24 space-y-4">
                            {/* Main Image */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="aspect-square md:aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 relative group"
                            >
                                <img
                                    src={getImageUrl(activeImage)}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4"
                                />
                                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-slate-800">
                                    {product.category?.name}
                                </div>
                            </motion.div>

                            {/* Thumbnails */}
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img!)}
                                        className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-slate-900 rounded-xl border-2 transition-all p-2 ${activeImage === img ? 'border-blue-500' : 'border-slate-800 hover:border-slate-600'}`}
                                    >
                                        <img src={getImageUrl(img!)} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>

                            {/* Desktop: Details Below Image */}
                            <div className="hidden lg:block mt-12 bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
                                <div className="flex gap-8 border-b border-slate-800 mb-6">
                                    <button
                                        onClick={() => setActiveTab('desc')}
                                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'desc' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Description
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('features')}
                                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'features' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Caractéristiques
                                    </button>
                                </div>

                                <div className="prose prose-invert max-w-none text-slate-300">
                                    {activeTab === 'desc' ? (
                                        <div className="whitespace-pre-line leading-relaxed">
                                            {product.longDescription || product.description}
                                        </div>
                                    ) : (
                                        <ul className="grid grid-cols-1 gap-4">
                                            {product.features?.map((feat, i) => (
                                                <li key={i} className="flex items-start gap-4">
                                                    <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                                                        <Zap size={16} />
                                                    </div>
                                                    <div>
                                                        <strong className="block text-white">{feat.title}</strong>
                                                        <span className="text-sm text-slate-400">{feat.description}</span>
                                                    </div>
                                                </li>
                                            ))}
                                            {(!product.features || product.features.length === 0) && <p className="text-slate-500 italic">Aucune caractéristique spécifiée.</p>}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: BUY BOX */}
                    <div className="lg:col-span-5">
                        <div className="space-y-8">

                            {/* Header Info */}
                            <div className="space-y-4 border-b border-slate-800 pb-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-white">{product.name}</h1>

                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold text-white">
                                        {product.price.toLocaleString()} <span className="text-lg text-slate-400 font-medium">DZD</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star fill="currentColor" size={16} />
                                        <Star fill="currentColor" size={16} />
                                        <Star fill="currentColor" size={16} />
                                        <Star fill="currentColor" size={16} />
                                        <Star fill="currentColor" size={16} />
                                        <span className="text-slate-500 text-sm ml-2">(4.9/5)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 flex flex-col items-center gap-1">
                                    <Truck size={20} className="text-blue-500" />
                                    <span>Livraison Rapide</span>
                                </div>
                                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 flex flex-col items-center gap-1">
                                    <Shield size={20} className="text-blue-500" />
                                    <span>Garantie 100%</span>
                                </div>
                                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 flex flex-col items-center gap-1">
                                    <Lock size={20} className="text-blue-500" />
                                    <span>Paiement Sécurisé</span>
                                </div>
                            </div>

                            {/* Order Form */}
                            <div className="bg-slate-900 rounded-2xl border border-blue-500/20 shadow-2xl overflow-hidden">
                                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                                    <span className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                                        <CreditCard size={16} className="text-blue-500" />
                                        Commander
                                    </span>
                                    <span className="text-xs text-green-400 font-mono animate-pulse">● En Stock</span>
                                </div>

                                <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Vos Informations</label>
                                        <input required placeholder="Nom complet" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input required type="email" placeholder="Email" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-all" />
                                            <input required type="tel" placeholder="Tél (WhatsApp)" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-all" />
                                        </div>
                                        <input placeholder="ID Joueur (Optionnel)" value={formData.gameId} onChange={e => setFormData({ ...formData, gameId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-all" />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Paiement</label>
                                        <div className="space-y-2">
                                            {methods.map(method => (
                                                <div key={method._id} className={`rounded-xl border transition-all ${selectedMethodId === method._id ? 'bg-blue-900/10 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedMethodId(method._id)}
                                                        className="w-full p-3 flex items-center gap-3 text-left"
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethodId === method._id ? 'border-blue-500' : 'border-slate-600'}`}>
                                                            {selectedMethodId === method._id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                                        </div>
                                                        <span className="font-medium text-white text-sm">{method.name}</span>
                                                    </button>

                                                    <AnimatePresence>
                                                        {selectedMethodId === method._id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-4 pb-3 pt-0">
                                                                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/50 flex justify-between items-center text-xs">
                                                                        <code className="text-blue-200 font-mono">{method.accountValue}</code>
                                                                        <button type="button" onClick={() => handleCopy(method.accountValue)} className="text-slate-500 hover:text-white transition-colors">
                                                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!selectedMethodId}
                                        className="w-full py-4 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-95 transition-all text-lg"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        Confirmer la commande <ArrowRight size={20} />
                                    </button>
                                </form>
                            </div>

                            {/* Mobile: Details Below Form */}
                            <div className="lg:hidden mt-12 bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                                <h3 className="font-bold text-white mb-4">Description</h3>
                                <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                                    {product.longDescription || product.description}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductLanding;
