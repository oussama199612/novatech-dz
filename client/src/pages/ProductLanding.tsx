import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Star, Shield, Zap, ArrowRight, Truck, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import api from '../api';
import { getImageUrl } from '../utils';
import { type Product, type PaymentMethod } from '../types';
import { useCart } from '../context/CartContext';

const ProductLanding = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
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
    const [stores, setStores] = useState<any[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const [alternatives, setAlternatives] = useState<any[]>([]);
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
                const [prodRes, methodsRes, settingsRes, similarRes, altsRes, storesRes] = await Promise.all([
                    api.get(`/products/${productId}`),
                    api.get('/payment-methods'),
                    api.get('/settings'),
                    api.get(`/products/${productId}/similar`),
                    api.get(`/products/${productId}/alternatives`),
                    api.get('/stores/active')
                ]);
                const prod = prodRes.data;
                setProduct(prod);
                setSimilarProducts(similarRes.data);
                setAlternatives(altsRes.data);
                setMethods(methodsRes.data);
                setSettings(settingsRes.data || {});
                setStores(storesRes.data);

                if (storesRes.data && storesRes.data.length > 0) {
                    setSelectedStoreId(storesRes.data[0]._id);
                }

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
                    } : undefined,
                    options: selectedOptions // Pass the raw selected options (Size, Color, etc.)
                }],
                ...formData,
                paymentMethodId: selectedMethodId,
                ...(settings?.enableMultiStore ? { storeId: selectedStoreId } : {})
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
${settings?.enableMultiStore ? `*Magasin:* ${stores.find(s => s._id === selectedStoreId)?.name || 'Standard'}\n` : ''}------------------
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

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity, currentVariant, selectedOptions);
        // Optional: show toast/notification
        // For now, maybe just a simple alert or visual feedback?
        // Let's assume the navbar updates is enough visual feedback for "Add to Cart" usually, 
        // but a small alert is better.
        alert('Produit ajouté au panier !');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Chargement...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-white">Produit introuvable</div>;

    const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);

    const stockToDisplay = product.hasVariants ? currentVariant?.stock : product.stock;
    const isTracking = product.hasVariants ? currentVariant?.trackQuantity : product.trackQuantity;
    const isOutOfStock = isTracking && stockToDisplay === 0 && !product.continueSellingWhenOutOfStock;
    const stockStatus = isOutOfStock ? 'out_of_stock' : (isTracking && stockToDisplay !== undefined && stockToDisplay <= 5) ? 'low_stock' : 'in_stock';

    return (
        <div className="min-h-screen pb-20 bg-luxury-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: GALLERY (Sticky) */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-24 space-y-8">
                            {/* Desktop/Tablet Main Image (Hidden on Mobile) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hidden md:block aspect-[4/3] relative group overflow-hidden"
                            >
                                <img
                                    src={getImageUrl(activeImage)}
                                    alt={product.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                                />
                                {product.compareAtPrice > (currentVariant?.price || product.price) && (
                                    <div className="absolute top-0 left-0 bg-luxury-gold text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-lg">
                                        Privilège
                                    </div>
                                )}
                            </motion.div>

                            {/* Mobile Swipeable Carousel */}
                            <div className="md:hidden relative w-full aspect-square bg-white">
                                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full">
                                    {allImages.map((img, idx) => (
                                        <div key={idx} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center relative">
                                            <img
                                                src={getImageUrl(img!)}
                                                alt={`${product.name} - ${idx + 1}`}
                                                className="w-full h-full object-contain"
                                            />
                                            {idx === 0 && product.compareAtPrice > (currentVariant?.price || product.price) && (
                                                <div className="absolute top-4 left-4 bg-luxury-gold text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest shadow-lg">
                                                    Privilège
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {allImages.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className="w-1.5 h-1.5 rounded-full bg-black/20"
                                        />
                                    ))}
                                </div>
                                <div className="absolute bottom-4 right-4 bg-black/80 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                                    {allImages.length} Photos
                                </div>
                            </div>

                            {/* Thumbnails (Desktop Only) */}
                            <div className="hidden md:flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img!)}
                                        className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 transition-opacity duration-300 ${activeImage === img ? 'opacity-100 border-b-2 border-luxury-gold' : 'opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={getImageUrl(img!)} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>

                            {/* Desktop: Details Below Image */}
                            <div className="hidden lg:block mt-16 pt-8 border-t border-gray-200">
                                <div className="flex gap-12 mb-8">
                                    <button
                                        onClick={() => setActiveTab('desc')}
                                        className={`pb-2 text-sm font-serif italic tracking-wider transition-colors ${activeTab === 'desc' ? 'text-luxury-gold border-b border-luxury-gold' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        L'Expérience
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('features')}
                                        className={`pb-2 text-sm font-serif italic tracking-wider transition-colors ${activeTab === 'features' ? 'text-luxury-gold border-b border-luxury-gold' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        Détails Techniques
                                    </button>
                                </div>

                                <div className="prose prose-sm max-w-none text-gray-800">
                                    {activeTab === 'desc' ? (
                                        <div
                                            className="prose prose-headings:font-serif prose-headings:text-black prose-p:text-gray-800 prose-strong:text-black"
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
                                                        <strong className="block text-black uppercase tracking-wider text-xs mb-1">{feat.title}</strong>
                                                        <span className="text-sm text-gray-700">{feat.description}</span>
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
                            <div className="space-y-4 border-b border-gray-200 pb-8">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        {stockStatus === 'out_of_stock' && (
                                            <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded inline-block uppercase tracking-wider border border-red-100">
                                                Victime de son succès (Rupture)
                                            </span>
                                        )}
                                        {stockStatus === 'low_stock' && (
                                            <span className="bg-orange-50 text-orange-600 animate-pulse text-xs font-bold px-3 py-1 rounded inline-block uppercase tracking-wider border border-orange-100">
                                                Stock très limité : plus que {stockToDisplay}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-serif text-black leading-tight">{product.name}</h1>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold text-black">
                                        {(currentVariant?.price || product.price).toLocaleString()} <span className="text-lg text-gray-600 font-medium">DZD</span>
                                        {product.compareAtPrice > (currentVariant?.price || product.price) && (
                                            <span className="text-lg text-gray-500 line-through ml-3">
                                                {product.compareAtPrice.toLocaleString()} DZD
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-luxury-gold">
                                        <Star fill="currentColor" size={16} />
                                        <Star fill="currentColor" size={16} />
                                        <Star fill="currentColor" size={16} />
                                        <Star fill="currentColor" size={16} />
                                        <Star fill="currentColor" size={16} />
                                        <span className="text-gray-500 text-sm ml-2">(4.9/5)</span>
                                    </div>
                                </div>

                                {/* VARIANTS SELECTOR */}
                                {product.hasVariants && product.options && (
                                    <div className="space-y-4 pt-4">
                                        {product.options.map((option, idx) => {
                                            const isColor = ['couleur', 'color', 'coloris'].includes(option.name.toLowerCase());
                                            return (
                                                <div key={idx} className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                        {option.name}: <span className="text-black normal-case">{selectedOptions[option.name]}</span>
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
                                                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${isSelected ? 'border-luxury-gold scale-110' : 'border-gray-300 hover:border-gray-500'}`}
                                                                        title={val}
                                                                        style={{ backgroundColor: isValidHex ? colorHex : '#333' }}
                                                                    >
                                                                        {!isValidHex && <span className="text-xs text-black mix-blend-difference">{val.charAt(0)}</span>}
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    key={val}
                                                                    onClick={() => handleOptionChange(option.name, val)}
                                                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${isSelected
                                                                        ? 'bg-black text-white border-black'
                                                                        : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500'
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
                            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col items-center gap-1">
                                    <Truck size={20} className="text-luxury-gold" />
                                    <span className="font-medium">Livraison Rapide</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col items-center gap-1">
                                    <Shield size={20} className="text-luxury-gold" />
                                    <span className="font-medium">Garantie 100%</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col items-center gap-1">
                                    <Lock size={20} className="text-luxury-gold" />
                                    <span className="font-medium">Paiement Sécurisé</span>
                                </div>
                            </div>

                            {/* Order Form */}
                            <div className="overflow-hidden">
                                <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
                                    <span className="font-bold uppercase tracking-wider text-sm flex items-center gap-2 text-black">
                                        <CreditCard size={16} className="text-luxury-gold" />
                                        Commander
                                    </span>
                                    {product.hasVariants && !currentVariant ? (
                                        <span className="text-xs text-gray-500 font-mono">● Sélectionnez une option</span>
                                    ) : stockStatus === 'out_of_stock' ? (
                                        <span className="text-xs text-red-500 font-bold font-mono">● Rupture de stock</span>
                                    ) : (
                                        <span className="text-xs text-emerald-600 font-mono animate-pulse">● En Stock</span>
                                    )}
                                </div>

                                <form onSubmit={handleSubmitOrder} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-black uppercase tracking-widest">Vos Informations</label>
                                        <input required placeholder="Nom complet" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} className="w-full bg-white border-b-2 border-gray-200 px-0 py-3 text-black font-bold focus:outline-none focus:border-luxury-gold transition-all text-sm placeholder-gray-400" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input required type="email" placeholder="Email" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full bg-white border-b-2 border-gray-200 px-0 py-3 text-black font-bold text-sm focus:outline-none focus:border-luxury-gold transition-all placeholder-gray-400" />
                                            <input required type="tel" placeholder="Tél (WhatsApp)" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full bg-white border-b-2 border-gray-200 px-0 py-3 text-black font-bold text-sm focus:outline-none focus:border-luxury-gold transition-all placeholder-gray-400" />
                                        </div>

                                        {settings?.enableMultiStore && stores.length > 0 && (
                                            <div className="pt-2">
                                                <label className="text-xs font-bold text-black uppercase tracking-widest block mb-2">Magasin de Traitement</label>
                                                <select
                                                    value={selectedStoreId}
                                                    onChange={(e) => setSelectedStoreId(e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-none px-4 py-3 text-black font-medium focus:outline-none focus:border-luxury-gold transition-all"
                                                >
                                                    {stores.map(store => (
                                                        <option key={store._id} value={store._id}>{store.name} - {store.city}</option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Sélectionnez le magasin le plus proche de chez vous</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-black uppercase tracking-widest">Quantité & Offres</label>
                                            {product.offers && product.offers.length > 0 && (
                                                <span className="text-xs text-luxury-gold font-bold animate-pulse">
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
                                                        className={`relative p-4 border flex items-center justify-between transition-all ${quantity === offer.quantity
                                                            ? 'bg-luxury-gold/5 border-luxury-gold text-black shadow-sm'
                                                            : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${quantity === offer.quantity ? 'bg-luxury-gold text-white' : 'bg-gray-200 text-gray-600'
                                                                }`}>
                                                                {quantity === offer.quantity && <Check size={12} />}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className={`font-bold text-sm ${quantity === offer.quantity ? 'text-black' : 'text-gray-900'}`}>
                                                                    Achetez {offer.quantity}
                                                                </div>
                                                                <div className="text-[10px] uppercase tracking-wide opacity-70">{offer.label || 'Offre Spéciale'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-emerald-600 text-sm">{offer.price.toLocaleString()} DA</div>
                                                            <div className="text-[10px] text-gray-400 line-through">
                                                                {(offer.quantity * (currentVariant?.price || product.price)).toLocaleString()} DA
                                                            </div>
                                                        </div>
                                                        {offer.isBestValue && (
                                                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] uppercase font-bold px-2 py-0.5 shadow-md">
                                                                Meilleure Offre
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* STANDARD QUANTITY SELECTOR */}
                                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-bold text-black text-lg">{quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Total</div>
                                                <div className="text-2xl font-serif text-black">
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
                                                    })()} <span className="text-sm font-sans text-gray-500">DZD</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <label className="text-xs font-bold text-black uppercase tracking-widest">Paiement</label>
                                        <div className="space-y-3">
                                            {methods.map(method => (
                                                <div key={method._id} className={`border-b transition-all ${selectedMethodId === method._id ? 'border-luxury-gold pb-4' : 'border-gray-100 pb-2'}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedMethodId(method._id)}
                                                        className="w-full flex items-center gap-3 text-left py-2"
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethodId === method._id ? 'border-luxury-gold' : 'border-gray-300'}`}>
                                                            {selectedMethodId === method._id && <div className="w-2 h-2 rounded-full bg-luxury-gold" />}
                                                        </div>
                                                        <span className={`font-bold text-sm ${selectedMethodId === method._id ? 'text-black' : 'text-gray-500'}`}>{method.name}</span>
                                                    </button>

                                                    <AnimatePresence>
                                                        {selectedMethodId === method._id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="pl-7 pt-2">
                                                                    <div className="p-3 bg-gray-50 flex justify-between items-center text-xs">
                                                                        <code className="text-black font-mono font-bold">{method.accountValue}</code>
                                                                        <button type="button" onClick={() => handleCopy(method.accountValue)} className="text-gray-500 hover:text-black transition-colors">
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
                                        disabled={!selectedMethodId || (product.hasVariants && !currentVariant) || isOutOfStock}
                                        className="w-full py-5 font-bold text-white shadow-xl shadow-luxury-gold/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-95 transition-all text-lg hover:shadow-2xl hover:scale-105 uppercase tracking-widest text-sm"
                                        style={{ backgroundColor: 'black' }}
                                    >
                                        Commander <ArrowRight size={18} />
                                    </button>
                                </form>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={(product.hasVariants && !currentVariant) || isOutOfStock}
                                        className="w-full py-5 font-bold text-black border-2 border-black bg-white shadow-xl shadow-gray-200/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-95 transition-all text-lg hover:shadow-2xl hover:scale-105 uppercase tracking-widest text-sm"
                                    >
                                        Ajouter au panier <ShoppingBag size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile: Details Below Form */}
                            <div className="lg:hidden mt-16 space-y-16 border-t border-gray-200 pt-12">
                                <div>
                                    <h3 className="font-serif text-3xl text-black mb-6">L'Expérience</h3>
                                    <div
                                        className="prose prose-base max-w-none text-black prose-p:text-black prose-headings:text-black prose-strong:text-black prose-li:text-black prose-ul:text-black"
                                        dangerouslySetInnerHTML={{ __html: product.longDescription || product.description }}
                                    />
                                </div>

                                <div>
                                    <h3 className="font-serif text-3xl text-black mb-6">Détails Techniques</h3>
                                    <ul className="space-y-6">
                                        {product.features?.map((feat, i) => (
                                            <li key={i} className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-luxury-gold">
                                                    <Zap size={16} />
                                                    <strong className="uppercase tracking-widest text-sm font-bold text-black">{feat.title}</strong>
                                                </div>
                                                <span className="text-base text-black pl-7">{feat.description}</span>
                                            </li>
                                        ))}
                                        {(!product.features || product.features.length === 0) && <p className="text-black italic text-sm">Aucune caractéristique.</p>}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* ALTERNATIVES OR SIMILAR PRODUCTS */}
                {stockStatus === 'out_of_stock' && alternatives.length > 0 ? (
                    <div className="mt-24 border-t border-gray-200 pt-16">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8 text-center shadow-sm">
                            <h2 className="text-3xl font-serif text-red-700 mb-2">Victime de son succès !</h2>
                            <p className="text-red-600/80 font-medium">Ne vous inquiétez pas, voici d'excellentes alternatives actuellement disponibles :</p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {alternatives.map((p) => (
                                <div key={p._id} className="group cursor-pointer" onClick={() => navigate(`/product/${p._id}`)}>
                                    <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-4 border border-slate-100 shadow-sm">
                                        <img
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            src={getImageUrl(p.image)}
                                        />
                                    </div>
                                    <h3 className="line-clamp-1 font-bold text-sm mb-1 group-hover:text-luxury-gold transition-colors">{p.name}</h3>
                                    <p className="text-luxury-gold font-bold text-sm">{p.price.toLocaleString()} DZD</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : similarProducts.length > 0 && (
                    <div className="mt-24 border-t border-gray-200 pt-16">
                        <h2 className="text-3xl font-serif text-black mb-8 text-center">Vous aimerez aussi</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map((p) => (
                                <div key={p._id} className="group cursor-pointer" onClick={() => navigate(`/product/${p._id}`)}>
                                    <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-4 border border-slate-100 shadow-sm">
                                        <img
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            src={getImageUrl(p.image)}
                                        />
                                    </div>
                                    <h3 className="line-clamp-1 font-bold text-sm mb-1 group-hover:text-luxury-gold transition-colors">{p.name}</h3>
                                    <p className="text-luxury-gold font-bold text-sm">{p.price.toLocaleString()} DZD</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductLanding;
