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
    const [settings, setSettings] = useState<any>({});
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'desc' | 'features'>('desc');

    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [currentVariant, setCurrentVariant] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const [prodRes, methodsRes, settingsRes] = await Promise.all([
                    api.get(`/products/${productId}`),
                    api.get('/payment-methods'),
                    api.get('/settings')
                ]);
                const prod = prodRes.data;
                setProduct(prod);
                setMethods(methodsRes.data);
                setSettings(settingsRes.data || {});

                // Init Variants
                if (prod.hasVariants && prod.options?.length > 0) {
                    const defaults: Record<string, string> = {};
                    prod.options.forEach((opt: any) => {
                        defaults[opt.name] = opt.values[0];
                    });
                    setSelectedOptions(defaults);
                } else if (prod.image) {
                    setActiveImage(prod.image);
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [productId]);

    // Update Current Variant when options change
    useEffect(() => {
        if (!product || !product.hasVariants) return;

        // Find variant matching all selected options
        // Variant title format: "Value1 / Value2" or just "Value1"
        // We need to match the combination.
        // Simplest way: Construct the title from selected options in order of product.options
        const variantTitle = product.options.map(opt => selectedOptions[opt.name]).join(' / ');
        const variant = product.variants.find((v: any) => v.title === variantTitle);

        setCurrentVariant(variant || null);
        if (variant && variant.image) {
            setActiveImage(variant.image);
        } else if (product.image) {
            setActiveImage(product.image);
        }
    }, [selectedOptions, product]);

    const handleOptionChange = (option: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [option]: value }));
    };

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
                orderItems: [{
                    product: product._id,
                    qty: quantity,
                    variant: currentVariant ? {
                        title: currentVariant.title,
                        price: currentVariant.price,
                        sku: currentVariant.sku
                    } : undefined
                }],
                ...formData,
                paymentMethodId: selectedMethodId
            };

            const { data: order } = await api.post('/orders', orderData);

            const method = methods.find(m => m._id === selectedMethodId);
            const price = currentVariant?.price || product.price;
            const total = price * quantity;

            const message = `
*NOUVELLE COMMANDE* 🛍️
------------------
*Produit:* ${product.name}
${currentVariant ? `*Variante:* ${currentVariant.title}\n` : ''}*Qté:* ${quantity}
*Prix:* ${price.toLocaleString()} DZD
*Total:* ${total.toLocaleString()} DZD
*Client:* ${formData.customerName}
*ID Commande:* ${order.orderId}
------------------
*Paiement:* ${method?.name}
Merci de confirmer ma commande !
`.trim();

            const baseUrl = settings.whatsappUrl || 'https://wa.me/213550000000';
            // Clean url to ensure we can append params
            const cleanUrl = baseUrl.split('?')[0];
            const whatsappUrl = `${cleanUrl}?text=${encodeURIComponent(message)}`;

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
                        <div className="sticky top-24 space-y-8">
                            {/* Main Image */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="aspect-square md:aspect-[4/3] relative group overflow-hidden"
                            >
                                <img
                                    src={getImageUrl(activeImage)}
                                    alt={product.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                                />
                                {product.compareAtPrice > (currentVariant?.price || product.price) && (
                                    <div className="absolute top-0 left-0 bg-luxury-gold text-luxury-black text-xs font-bold px-3 py-1 uppercase tracking-widest">
                                        Privilège
                                    </div>
                                )}
                            </motion.div>

                            {/* Thumbnails */}
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img!)}
                                        className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 transition-opacity duration-300 ${activeImage === img ? 'opacity-100 border-b-2 border-luxury-gold' : 'opacity-50 hover:opacity-80'}`}
                                    >
                                        <img src={getImageUrl(img!)} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>

                            {/* Desktop: Details Below Image */}
                            <div className="hidden lg:block mt-16 pt-8 border-t border-white/5">
                                <div className="flex gap-12 mb-8">
                                    <button
                                        onClick={() => setActiveTab('desc')}
                                        className={`pb-2 text-sm font-serif italic tracking-wider transition-colors ${activeTab === 'desc' ? 'text-luxury-gold border-b border-luxury-gold' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        L'Expérience
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('features')}
                                        className={`pb-2 text-sm font-serif italic tracking-wider transition-colors ${activeTab === 'features' ? 'text-luxury-gold border-b border-luxury-gold' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Détails Techniques
                                    </button>
                                </div>

                                <div className="prose prose-invert max-w-none text-gray-300">
                                    {activeTab === 'desc' ? (
                                        <div
                                            className="prose prose-invert prose-p:text-gray-300 prose-headings:font-serif prose-headings:text-white"
                                            dangerouslySetInnerHTML={{ __html: product.longDescription || product.description }}
                                        />
                                    ) : (
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            {product.features?.map((feat, i) => (
                                                <li key={i} className="flex items-start gap-4">
                                                    <div className="p-1 text-luxury-gold shrink-0 mt-1">
                                                        <Zap size={14} />
                                                    </div>
                                                    <div>
                                                        <strong className="block text-white uppercase tracking-wider text-xs mb-1">{feat.title}</strong>
                                                        <span className="text-sm text-gray-400 font-light">{feat.description}</span>
                                                    </div>
                                                </li>
                                            ))}
                                            {(!product.features || product.features.length === 0) && <p className="text-gray-500 italic">Aucune caractéristique spécifiée.</p>}
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
                                        {(currentVariant?.price || product.price).toLocaleString()} <span className="text-lg text-slate-400 font-medium">DZD</span>
                                        {product.compareAtPrice > (currentVariant?.price || product.price) && (
                                            <span className="text-lg text-slate-500 line-through ml-3">
                                                {product.compareAtPrice.toLocaleString()} DZD
                                            </span>
                                        )}
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

                                {/* VARIANTS SELECTOR */}
                                {product.hasVariants && product.options && (
                                    <div className="space-y-4 pt-4">
                                        {product.options.map((option, idx) => {
                                            const isColor = ['couleur', 'color', 'coloris'].includes(option.name.toLowerCase());
                                            return (
                                                <div key={idx} className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                                        {option.name}: <span className="text-white normal-case">{selectedOptions[option.name]}</span>
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {option.values.map(val => {
                                                            const isSelected = selectedOptions[option.name] === val;

                                                            if (isColor) {
                                                                const PREDEFINED_COLORS: Record<string, string> = {
                                                                    'Noir': '#000000', 'Blanc': '#FFFFFF', 'Rouge': '#FF0000', 'Bleu': '#0000FF',
                                                                    'Vert': '#008000', 'Jaune': '#FFFF00', 'Orange': '#FFA500', 'Violet': '#800080',
                                                                    'Rose': '#FFC0CB', 'Gris': '#808080', 'Marron': '#A52A2A', 'Beige': '#F5F5DC',
                                                                    'Marine': '#000080', 'Kaki': '#F0E68C', 'Bordeaux': '#800000', 'Turquoise': '#40E0D0'
                                                                };
                                                                const colorHex = PREDEFINED_COLORS[val] || val;
                                                                const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(colorHex);

                                                                return (
                                                                    <button
                                                                        key={val}
                                                                        onClick={() => handleOptionChange(option.name, val)}
                                                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-500 scale-110' : 'border-slate-700 hover:border-slate-500'}`}
                                                                        title={val}
                                                                        style={{ backgroundColor: isValidHex ? colorHex : '#333' }}
                                                                    >
                                                                        {!isValidHex && <span className="text-xs text-white">{val.charAt(0)}</span>}
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    key={val}
                                                                    onClick={() => handleOptionChange(option.name, val)}
                                                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${isSelected
                                                                        ? 'bg-blue-600 text-white border-blue-500'
                                                                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                                                                        }`}
                                                                >
                                                                    {val}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
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
                                    {currentVariant?.stock === 0 ? (
                                        <span className="text-xs text-red-400 font-mono">● Rupture de stock</span>
                                    ) : (
                                        <span className="text-xs text-green-400 font-mono animate-pulse">● En Stock</span>
                                    )}
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

                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Quantité & Offres</label>
                                            {product.offers && product.offers.length > 0 && (
                                                <span className="text-xs text-blue-400 font-bold animate-pulse">
                                                    Offres disponibles !
                                                </span>
                                            )}
                                        </div>

                                        {/* OFFERS SELECTION */}
                                        {product.offers && product.offers.length > 0 && (
                                            <div className="grid grid-cols-1 gap-3 mb-4">
                                                {product.offers.sort((a: any, b: any) => a.quantity - b.quantity).map((offer: any, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setQuantity(offer.quantity)}
                                                        className={`relative p-3 rounded-lg border-2 flex items-center justify-between transition-all ${quantity === offer.quantity
                                                            ? 'bg-blue-600/10 border-blue-500 text-white'
                                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${quantity === offer.quantity ? 'bg-blue-500 text-white' : 'bg-slate-800'
                                                                }`}>
                                                                {quantity === offer.quantity && <Check size={14} />}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className={`font-bold ${quantity === offer.quantity ? 'text-blue-400' : 'text-white'}`}>
                                                                    Achetez {offer.quantity}
                                                                </div>
                                                                <div className="text-xs opacity-70">{offer.label || 'Offre Spéciale'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-emerald-400">{offer.price.toLocaleString()} DA</div>
                                                            <div className="text-xs text-slate-500 line-through">
                                                                {(offer.quantity * (currentVariant?.price || product.price)).toLocaleString()} DA
                                                            </div>
                                                        </div>
                                                        {offer.isBestValue && (
                                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-lg">
                                                                Meilleure Offre
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* STANDARD QUANTITY SELECTOR */}
                                        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-1">
                                            <div className="flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-10 text-center font-bold text-white">{quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="px-4 text-right">
                                                <div className="text-xs text-slate-500 uppercase">Total à payer</div>
                                                <div className="text-xl font-bold text-emerald-400">
                                                    {(() => {
                                                        const basePrice = currentVariant?.price || product.price;
                                                        let finalPrice = 0;
                                                        let remaining = quantity;

                                                        // Calculate Best Price (Greedy Algorithm matching Backend)
                                                        if (product.offers && product.offers.length > 0) {
                                                            const sortedOffers = [...product.offers].sort((a: any, b: any) => b.quantity - a.quantity);
                                                            for (const offer of sortedOffers) {
                                                                while (remaining >= offer.quantity) {
                                                                    finalPrice += offer.price;
                                                                    remaining -= offer.quantity;
                                                                }
                                                            }
                                                        }
                                                        finalPrice += remaining * basePrice;

                                                        return finalPrice.toLocaleString();
                                                    })()} <span className="text-sm text-emerald-600">DZD</span>
                                                </div>
                                            </div>
                                        </div>
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
                                        disabled={!selectedMethodId || (currentVariant?.stock === 0 && currentVariant?.trackQuantity)}
                                        className="w-full py-4 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-95 transition-all text-lg"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        Commander <ArrowRight size={20} />
                                    </button>
                                </form>
                            </div>

                            {/* Mobile: Details Below Form */}
                            <div className="lg:hidden mt-12 space-y-12 border-t border-white/5 pt-8">
                                <div>
                                    <h3 className="font-serif text-2xl text-white mb-6">L'Expérience</h3>
                                    <div
                                        className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-white prose-img:rounded-none prose-img:w-full"
                                        dangerouslySetInnerHTML={{ __html: product.longDescription || product.description }}
                                    />
                                </div>

                                <div>
                                    <h3 className="font-serif text-2xl text-white mb-6">Détails Techniques</h3>
                                    <ul className="space-y-6">
                                        {product.features?.map((feat, i) => (
                                            <li key={i} className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-luxury-gold mb-1">
                                                    <Zap size={14} />
                                                    <strong className="uppercase tracking-widest text-xs">{feat.title}</strong>
                                                </div>
                                                <span className="text-sm text-gray-400 font-light pl-6 border-l border-white/10">{feat.description}</span>
                                            </li>
                                        ))}
                                        {(!product.features || product.features.length === 0) && <p className="text-gray-500 italic text-xs">Aucune caractéristique.</p>}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductLanding;
