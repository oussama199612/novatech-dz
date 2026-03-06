import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Star, Shield, Zap, ArrowRight, Truck, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import api from '../api';
import { getImageUrl } from '../utils';
import { type Product, type PaymentMethod } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReactGA from 'react-ga4';

const ProductLanding = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { customer } = useAuth();
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

    useEffect(() => {
        if (customer) {
            setFormData(prev => ({
                ...prev,
                customerName: `${customer.firstName} ${customer.lastName}`,
                customerEmail: customer.email,
                customerPhone: customer.phone,
            }));
        }
    }, [customer]);

    const [stores, setStores] = useState<{ _id: string; title?: string; name?: string; city?: string; address: string; isActive: boolean; isMain: boolean }[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const [alternatives, setAlternatives] = useState<Product[]>([]);
    const [settings, setSettings] = useState<Record<string, unknown>>({});
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'desc' | 'features'>('desc');

    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [currentVariant, setCurrentVariant] = useState<{ _id?: string; title?: string; stock?: number; price?: number; image?: string; sku?: string; trackQuantity?: boolean } | null>(null);
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
                if (prod.hasVariants && prod.options) {
                    const initial: Record<string, string> = {};
                    prod.options.forEach((opt: { name: string; values: string[] }) => {
                        if (opt.values && opt.values.length > 0) {
                            initial[opt.name] = opt.values[0];
                        }
                    });
                    setSelectedOptions(initial);
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
        const variantTitle = product.options.map((opt: { name: string }) => selectedOptions[opt.name]).join(' / ');
        const variant = product.variants.find((v: { title: string; trackQuantity?: boolean; stock?: number; price?: number; _id?: string; image?: string }) => v.title === variantTitle);

        setCurrentVariant(variant || null);
        if (variant && variant.image) {
            setActiveImage(variant.image);
        } else if (product.image) {
            setActiveImage(product.image);
        }
    }, [selectedOptions, product]);

    // GA4 view_item event hook
    useEffect(() => {
        if (product) {
            ReactGA.event('view_item', {
                currency: 'DZD',
                value: Number(currentVariant?.price || product.price),
                items: [
                    {
                        item_id: String(product._id),
                        item_name: String(product.name),
                        item_category: String(product.category?.name || ''),
                        item_variant: currentVariant?.title ? String(currentVariant.title) : undefined,
                        price: Number(currentVariant?.price || product.price),
                        quantity: 1
                    }
                ]
            });
        }
    }, [product, currentVariant]);

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

            // GA4 purchase event for direct checkout
            ReactGA.event('purchase', {
                transaction_id: String(order.orderId),
                value: Number(orderData.orderItems[0].qty * (orderData.orderItems[0].variant?.price || product.price)),
                currency: 'DZD',
                items: [
                    {
                        item_id: String(product._id),
                        item_name: String(product.name),
                        item_category: String(product.category?.name || ''),
                        item_variant: currentVariant?.title ? String(currentVariant.title) : undefined,
                        price: Number(currentVariant?.price || product.price),
                        quantity: Number(quantity)
                    }
                ]
            });

            // Brief pause to guarantee GA4 beacon dispatch before React unmounts
            setTimeout(() => {
                navigate('/success');
            }, 300);
        } catch (error) {
            console.error(error);
            alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur lors de la commande.');
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity, currentVariant, selectedOptions);

        // GA4 add_to_cart event
        ReactGA.event('add_to_cart', {
            currency: 'DZD',
            value: Number((currentVariant?.price || product.price) * quantity),
            items: [
                {
                    item_id: String(product._id),
                    item_name: String(product.name),
                    item_category: String(product.category?.name || ''),
                    item_variant: currentVariant?.title ? String(currentVariant.title) : undefined,
                    price: Number(currentVariant?.price || product.price),
                    quantity: Number(quantity)
                }
            ]
        });

        alert('Produit ajouté au panier !');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-light">Chargement...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-light">Produit introuvable</div>;

    const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);

    const stockToDisplay = product.hasVariants ? currentVariant?.stock : product.stock;
    const isTracking = product.hasVariants ? currentVariant?.trackQuantity : product.trackQuantity;
    const isOutOfStock = isTracking && stockToDisplay === 0 && !product.continueSellingWhenOutOfStock;
    const stockStatus = isOutOfStock ? 'out_of_stock' : (isTracking && stockToDisplay !== undefined && stockToDisplay <= 5) ? 'low_stock' : 'in_stock';

    return (
        <div className="min-h-screen pb-20 bg-white font-sans text-gray-900 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: GALLERY (Sticky) */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-24 space-y-8">
                            {/* Desktop/Tablet Main Image (Hidden on Mobile) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hidden md:block aspect-[4/3] relative group overflow-hidden bg-[#FAFAFA] border border-gray-100"
                            >
                                <img
                                    src={getImageUrl(activeImage)}
                                    alt={product.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                                />
                                {product.compareAtPrice > (currentVariant?.price || product.price) && (
                                    <div className="absolute top-4 right-4 bg-black text-white text-[10px] font-medium px-3 py-1 uppercase tracking-widest">
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
                                        className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 transition-opacity duration-300 border bg-[#FAFAFA] ${activeImage === img ? 'opacity-100 border-black' : 'opacity-60 border-transparent hover:opacity-100'}`}
                                    >
                                        <img src={getImageUrl(img!)} className="w-full h-full object-contain mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>

                            {/* Desktop: Details Below Image */}
                            <div className="hidden lg:block mt-16 pt-8 border-t border-gray-100">
                                <div className="flex gap-12 mb-8">
                                    <button
                                        onClick={() => setActiveTab('desc')}
                                        className={`pb-2 text-sm font-sans tracking-widest uppercase transition-colors ${activeTab === 'desc' ? 'text-black border-b border-black' : 'text-gray-400 hover:text-gray-800'}`}
                                    >
                                        L'Expérience
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('features')}
                                        className={`pb-2 text-sm font-sans tracking-widest uppercase transition-colors ${activeTab === 'features' ? 'text-black border-b border-black' : 'text-gray-400 hover:text-gray-800'}`}
                                    >
                                        Détails Techniques
                                    </button>
                                </div>

                                <div className="prose prose-sm max-w-none text-gray-600 font-light">
                                    {activeTab === 'desc' ? (
                                        <div
                                            className="prose prose-headings:font-serif prose-headings:text-black prose-p:text-gray-600 prose-strong:text-black prose-strong:font-medium"
                                            dangerouslySetInnerHTML={{ __html: product.longDescription || product.description }}
                                        />
                                    ) : (
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            {product.features?.map((feat, i) => (
                                                <li key={i} className="flex items-start gap-4">
                                                    <div className="p-1 text-black shrink-0 mt-1">
                                                        <Zap size={14} />
                                                    </div>
                                                    <div>
                                                        <strong className="block text-black uppercase tracking-widest text-xs mb-1 font-medium">{feat.title}</strong>
                                                        <span className="text-sm text-gray-500">{feat.description}</span>
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
                            <div className="space-y-4 border-b border-gray-100 pb-8">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        {stockStatus === 'out_of_stock' && (
                                            <span className="bg-white text-red-600 text-[10px] font-medium px-2 py-1 uppercase tracking-widest border border-red-100">
                                                Victime de son succès (Rupture)
                                            </span>
                                        )}
                                        {stockStatus === 'low_stock' && (
                                            <span className="bg-white text-orange-600 animate-pulse text-[10px] font-medium px-2 py-1 uppercase tracking-widest border border-orange-100">
                                                Stock très limité : plus que {stockToDisplay}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-serif text-black leading-tight uppercase tracking-tight">{product.name}</h1>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-medium text-black">
                                        {(currentVariant?.price || product.price).toLocaleString()} <span className="text-sm text-gray-400 font-light">DZD</span>
                                        {product.compareAtPrice > (currentVariant?.price || product.price) && (
                                            <span className="text-sm text-gray-400 line-through ml-3">
                                                {product.compareAtPrice.toLocaleString()} DZD
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-black">
                                        <Star fill="currentColor" size={14} />
                                        <Star fill="currentColor" size={14} />
                                        <Star fill="currentColor" size={14} />
                                        <Star fill="currentColor" size={14} />
                                        <Star fill="currentColor" size={14} />
                                        <span className="text-gray-400 text-xs ml-2 font-light">(4.9/5)</span>
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
                                                                        className={`w-8 h-8 rounded-none border flex items-center justify-center transition-all ${isSelected ? 'ring-1 ring-black border-black' : 'border-gray-200 hover:border-gray-400'}`}
                                                                        title={val}
                                                                        style={{ backgroundColor: isValidHex ? colorHex : '#eee' }}
                                                                    >
                                                                        {!isValidHex && <span className="text-[10px] text-black">{val.charAt(0)}</span>}
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    key={val}
                                                                    onClick={() => handleOptionChange(option.name, val)}
                                                                    className={`px-4 py-2 border text-[11px] font-medium tracking-widest uppercase transition-all ${isSelected
                                                                        ? 'bg-black text-white border-black'
                                                                        : 'bg-transparent text-gray-600 border-gray-200 hover:border-black hover:text-black'
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
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-gray-500 uppercase tracking-widest pt-4">
                                <div className="p-3 border border-gray-100 flex flex-col items-center gap-2">
                                    <Truck size={16} className="text-gray-900" />
                                    <span>Livraison Rapide</span>
                                </div>
                                <div className="p-3 border border-gray-100 flex flex-col items-center gap-2">
                                    <Shield size={16} className="text-gray-900" />
                                    <span>Garantie 100%</span>
                                </div>
                                <div className="p-3 border border-gray-100 flex flex-col items-center gap-2">
                                    <Lock size={16} className="text-gray-900" />
                                    <span>Paiement Sécurisé</span>
                                </div>
                            </div>

                            {/* Order Form */}
                            <div className="overflow-hidden mt-8">
                                <div className="border-b border-gray-100 pb-4 mb-6 flex items-center justify-between">
                                    <span className="font-medium uppercase tracking-widest text-[11px] flex items-center gap-2 text-black">
                                        <CreditCard size={14} className="text-black" />
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
                                        <label className="text-[10px] text-gray-400 uppercase tracking-widest">Vos Informations</label>
                                        <input required placeholder="Nom complet" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} className="w-full bg-transparent border-b border-gray-200 px-0 py-3 text-black font-medium focus:outline-none focus:border-black transition-colors text-sm placeholder-gray-300" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input required type="email" placeholder="Email" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full bg-transparent border-b border-gray-200 px-0 py-3 text-black font-medium text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300" />
                                            <input required type="tel" placeholder="Tél (WhatsApp)" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full bg-transparent border-b border-gray-200 px-0 py-3 text-black font-medium text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300" />
                                        </div>

                                        {Boolean(settings?.enableMultiStore) && stores.length > 0 && (
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
                                            <label className="text-[10px] text-gray-400 uppercase tracking-widest">Quantité & Offres</label>
                                            {product.offers && product.offers.length > 0 && (
                                                <span className="text-[10px] text-black font-medium">
                                                    Offres disponibles
                                                </span>
                                            )}
                                        </div>

                                        {/* OFFERS SELECTION */}
                                        {product.offers && product.offers.length > 0 && (
                                            <div className="grid grid-cols-1 gap-3 mb-4">
                                                {product.offers.sort((a: { quantity: number; price: number }, b: { quantity: number; price: number }) => a.quantity - b.quantity).map((offer: { quantity: number; price: number; label?: string; isBestValue?: boolean }, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setQuantity(offer.quantity)}
                                                        className={`relative p-4 border flex items-center justify-between transition-colors ${quantity === offer.quantity
                                                            ? 'border-black text-black'
                                                            : 'bg-transparent border-gray-200 text-gray-600 hover:border-black'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-none border flex items-center justify-center text-[10px] ${quantity === offer.quantity ? 'bg-black border-black text-white' : 'border-gray-300'
                                                                }`}>
                                                                {quantity === offer.quantity && <Check size={10} />}
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
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mt-6">
                                            <div className="flex items-center border border-gray-200 w-fit">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-10 text-center font-medium text-black text-sm">{quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
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
                                                            const sortedOffers = [...product.offers].sort((a: { quantity: number; price: number }, b: { quantity: number; price: number }) => b.quantity - a.quantity);
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
                                        <label className="text-[10px] text-gray-400 uppercase tracking-widest">Paiement</label>
                                        <div className="space-y-3">
                                            {methods.map(method => (
                                                <div key={method._id} className={`border-b transition-all ${selectedMethodId === method._id ? 'border-black pb-4' : 'border-gray-100 pb-2'}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedMethodId(method._id)}
                                                        className="w-full flex items-center gap-3 text-left py-2"
                                                    >
                                                        <div className={`w-3 h-3 rounded-none border flex items-center justify-center ${selectedMethodId === method._id ? 'border-black' : 'border-gray-300'}`}>
                                                            {selectedMethodId === method._id && <div className="w-1.5 h-1.5 bg-black" />}
                                                        </div>
                                                        <span className={`font-medium text-sm ${selectedMethodId === method._id ? 'text-black' : 'text-gray-500'}`}>{method.name}</span>
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
                                        className="w-full py-4 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm hover:bg-gray-800 transition-colors uppercase tracking-widest"
                                        style={{ backgroundColor: 'black' }}
                                    >
                                        Commander <ArrowRight size={16} />
                                    </button>
                                </form>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={(product.hasVariants && !currentVariant) || isOutOfStock}
                                        className="w-full py-4 font-medium text-black border border-black bg-white disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm hover:bg-gray-50 transition-colors uppercase tracking-widest"
                                    >
                                        Ajouter au panier <ShoppingBag size={16} />
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
                                                <div className="flex items-center gap-2 text-black">
                                                    <Zap size={16} />
                                                    <strong className="uppercase tracking-widest text-sm font-medium text-black">{feat.title}</strong>
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
                    <div className="mt-24 border-t border-gray-100 pt-16">
                        <div className="bg-white border border-gray-100 p-8 mb-8 text-center">
                            <h2 className="text-3xl font-serif text-gray-900 mb-2">Victime de son succès !</h2>
                            <p className="text-gray-500 font-light text-sm">Ne vous inquiétez pas, voici d'excellentes alternatives actuellement disponibles :</p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {alternatives.map((p) => (
                                <div key={p._id} className="group cursor-pointer" onClick={() => navigate(`/product/${p._id}`)}>
                                    <div className="relative aspect-[4/5] bg-white overflow-hidden mb-4 border border-gray-100">
                                        <img
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            src={getImageUrl(p.image)}
                                        />
                                    </div>
                                    <h3 className="line-clamp-1 font-medium text-sm mb-1 group-hover:text-gray-500 transition-colors">{p.name}</h3>
                                    <p className="text-gray-900 font-medium text-sm">{p.price.toLocaleString()} DZD</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : similarProducts.length > 0 && (
                    <div className="mt-24 border-t border-gray-100 pt-16">
                        <h2 className="text-3xl font-serif text-black mb-12 text-center uppercase tracking-widest text-sm">Vous aimerez aussi</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map((p) => (
                                <div key={p._id} className="group cursor-pointer" onClick={() => navigate(`/product/${p._id}`)}>
                                    <div className="relative aspect-[4/5] bg-white overflow-hidden mb-4 border border-gray-100">
                                        <img
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            src={getImageUrl(p.image)}
                                        />
                                    </div>
                                    <h3 className="line-clamp-1 font-medium text-sm mb-1 group-hover:text-gray-500 transition-colors">{p.name}</h3>
                                    <p className="text-gray-900 font-medium text-sm">{p.price.toLocaleString()} DZD</p>
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
