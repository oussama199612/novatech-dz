import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, CreditCard, Wallet, Banknote, Check, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils';
import api from '../api';
import { type PaymentMethod } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Checkout Form State
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
    });

    // Toggle Checkout Form visibility
    const [showCheckout, setShowCheckout] = useState(false);

    // Auto-fill form if user is logged in
    const { customer } = useAuth();
    useEffect(() => {
        if (showCheckout && customer) {
            setFormData({
                customerName: `${customer.firstName} ${customer.lastName}`,
                customerEmail: customer.email,
                customerPhone: customer.phone,
            });
        }
    }, [showCheckout, customer]);

    useEffect(() => {
        const fetchMethods = async () => {
            try {
                const { data } = await api.get('/payment-methods');
                setMethods(data);
            } catch (error) {
                console.error('Failed to fetch payment methods', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMethods();
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cartItems.length === 0 || !selectedMethodId) return;

        try {
            const orderItems = cartItems.map(item => ({
                product: item.productId,
                qty: item.quantity,
                variant: item.variant
            }));

            const orderData = {
                orderItems,
                ...formData,
                paymentMethodId: selectedMethodId
            };

            const { data: orderResponse } = await api.post('/orders', orderData);

            // GA4 purchase event
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'purchase', {
                    transaction_id: orderResponse.orderId,
                    value: cartTotal,
                    currency: 'DZD',
                    items: cartItems.map(item => ({
                        item_id: item.productId,
                        item_name: item.name,
                        item_variant: item.variant?.title || undefined,
                        price: item.price,
                        currency: 'DZD',
                        quantity: item.quantity
                    }))
                });
            }

            clearCart();
            navigate('/success');

        } catch (error) {
            console.error(error);
            alert((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur lors de la commande.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-light text-gray-500">Chargement...</div>;

    return (
        <div className="bg-[#FAFAFA] font-sans text-gray-900 min-h-screen border-t border-gray-100">
            <main className="py-12 lg:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl font-serif text-black mb-8 uppercase tracking-widest text-center">SHOPPING BAG</h1>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-gray-100">
                            <p className="text-gray-500 mb-8 font-light">Votre panier est vide.</p>
                            <Link to="/products" className="inline-block bg-black text-white px-8 py-3 text-sm font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors">
                                DÉCOUVRIR NOS PRODUITS
                            </Link>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-12 gap-12 items-start">
                            {/* Cart Items List */}
                            <div className="lg:col-span-8 space-y-8">
                                <AnimatePresence mode="popLayout">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            key={item.id}
                                            className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-gray-200"
                                        >
                                            <div className="w-full sm:w-32 lg:w-40 aspect-[4/5] bg-white border border-gray-100 shrink-0">
                                                <img
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    src={getImageUrl(item.image)}
                                                />
                                            </div>
                                            <div className="flex flex-col justify-between flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-serif text-black uppercase tracking-wider mb-1">{item.name}</h3>
                                                        <p className="text-gray-500 text-sm mb-4 font-light">
                                                            {item.variant ? `Variant: ${item.variant.title}` : 'Standard'}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-black transition-colors" title="Retirer">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-end mt-4 sm:mt-0">
                                                    <div className="flex items-center border border-gray-200 w-fit">
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black transition-colors border-r border-gray-200">
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-10 text-center text-sm font-medium text-black block">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black transition-colors border-l border-gray-200">
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="text-lg font-medium text-black">{item.lineTotal.toLocaleString()} <span className="text-[10px] text-gray-400 font-light">DZD</span></p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <div className="pt-4">
                                    <Link to="/products" className="inline-flex items-center gap-2 text-black text-xs font-medium uppercase tracking-widest hover:text-gray-600 transition-colors">
                                        <ArrowLeft size={16} />
                                        CONTINUE SHOPPING
                                    </Link>
                                </div>
                            </div>

                            {/* Order Summary & Checkout Form */}
                            <aside className="lg:col-span-4">
                                <div className="bg-white border border-gray-100 p-8 sticky top-28">
                                    <h2 className="text-sm font-bold mb-8 uppercase tracking-widest text-black">ORDER SUMMARY</h2>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-gray-500 text-sm">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-black">{cartTotal.toLocaleString()} DZD</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 text-sm">
                                            <span>Estimated Shipping</span>
                                            <span className="font-medium text-black">Calculated later</span>
                                        </div>
                                        <div className="h-px bg-gray-100 my-4"></div>
                                        <div className="flex justify-between text-lg font-medium text-black">
                                            <span>Grand Total</span>
                                            <span>{cartTotal.toLocaleString()} DZD</span>
                                        </div>
                                    </div>

                                    {!showCheckout ? (
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setShowCheckout(true)}
                                                className="w-full bg-black text-white hover:bg-gray-800 py-4 text-xs font-bold uppercase tracking-widest transition-colors"
                                            >
                                                CHECKOUT NOW
                                            </button>
                                            <div className="flex items-center justify-center gap-4 py-2 opacity-50 grayscale hover:grayscale-0 transition-all text-gray-400">
                                                <Banknote size={20} />
                                                <CreditCard size={20} />
                                                <Wallet size={20} />
                                            </div>
                                        </div>
                                    ) : (
                                        <motion.form
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            onSubmit={handleCheckout}
                                            className="space-y-6 pt-4 border-t border-gray-100"
                                        >
                                            <div className="space-y-4">
                                                <input
                                                    required
                                                    placeholder="Nom complet"
                                                    value={formData.customerName}
                                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                                    className="w-full bg-transparent border-b border-gray-200 px-0 py-3 text-black font-medium focus:outline-none focus:border-black transition-colors text-sm placeholder-gray-400"
                                                />
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="Email"
                                                    value={formData.customerEmail}
                                                    onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                                    className="w-full bg-transparent border-b border-gray-200 px-0 py-3 text-black font-medium focus:outline-none focus:border-black transition-colors text-sm placeholder-gray-400"
                                                />
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="Téléphone (WhatsApp)"
                                                    value={formData.customerPhone}
                                                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                                    className="w-full bg-transparent border-b border-gray-200 px-0 py-3 text-black font-medium focus:outline-none focus:border-black transition-colors text-sm placeholder-gray-400"
                                                />
                                            </div>

                                            <div className="space-y-4 pt-2">
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
                                                                        <div className="pl-6 pt-2">
                                                                            <div className="p-3 bg-gray-50 flex justify-between items-center text-xs">
                                                                                <code className="text-black font-mono font-medium">{method.accountValue}</code>
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
                                                disabled={!selectedMethodId}
                                                className="w-full bg-black hover:bg-gray-800 text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                            >
                                                CONFIRMER LA COMMANDE
                                            </button>
                                        </motion.form>
                                    )}
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Cart;
