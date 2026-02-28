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
                variant: item.variant,
                options: item.options // Pass options if backend needs them for record, though variant title usually suffices
            }));

            const orderData = {
                orderItems,
                ...formData,
                paymentMethodId: selectedMethodId
            };

            await api.post('/orders', orderData);

            clearCart();
            navigate('/success');

        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Erreur lors de la commande.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <div className="bg-background-light font-display text-slate-900 min-h-screen">
            <main className="py-12 lg:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl font-bold mb-2">SHOPPING BAG</h1>
                    <div className="h-1 w-20 bg-primary mb-12"></div>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-slate-500 mb-8">Votre panier est vide.</p>
                            <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
                                DÉCOUVRIR NOS PRODUITS
                            </Link>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-12 gap-12 items-start">
                            {/* Cart Items List */}
                            <div className="lg:col-span-8 space-y-8">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-slate-200">
                                        <div className="w-full sm:w-48 aspect-square bg-white rounded-xl overflow-hidden shrink-0">
                                            <img
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                src={getImageUrl(item.image)}
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                                                    {item.variant ? (
                                                        <p className="text-slate-500 text-sm mb-4">Variant: {item.variant.title}</p>
                                                    ) : (
                                                        <p className="text-slate-500 text-sm mb-4">Standard</p>
                                                    )}
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center mt-4 sm:mt-0">
                                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-slate-100 transition-colors border-r border-slate-200">
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-12 text-center text-sm font-bold block py-1">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-slate-100 transition-colors border-l border-slate-200">
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-xl font-bold">{(item.price * item.quantity).toLocaleString()} DZD</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-4">
                                    <Link to="/products" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                                        <ArrowLeft size={16} />
                                        CONTINUE SHOPPING
                                    </Link>
                                </div>
                            </div>

                            {/* Order Summary & Checkout Form */}
                            <aside className="lg:col-span-4">
                                <div className="bg-white border border-primary/10 rounded-2xl p-8 sticky top-28 shadow-xl shadow-primary/5">
                                    <h2 className="text-2xl font-bold mb-8">ORDER SUMMARY</h2>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-slate-900">{cartTotal.toLocaleString()} DZD</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Estimated Shipping</span>
                                            <span className="font-medium text-slate-900">Calculated later</span>
                                        </div>
                                        <div className="h-px bg-slate-200 my-4"></div>
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Grand Total</span>
                                            <span className="text-primary">{cartTotal.toLocaleString()} DZD</span>
                                        </div>
                                    </div>

                                    {!showCheckout ? (
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setShowCheckout(true)}
                                                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/20"
                                            >
                                                CHECKOUT NOW
                                            </button>
                                            <div className="flex items-center justify-center gap-4 py-2 opacity-50 grayscale hover:grayscale-0 transition-all text-slate-400">
                                                <Banknote size={24} />
                                                <CreditCard size={24} />
                                                <Wallet size={24} />
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleCheckout} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="space-y-3">
                                                <input
                                                    required
                                                    placeholder="Nom complet"
                                                    value={formData.customerName}
                                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                />
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="Email"
                                                    value={formData.customerEmail}
                                                    onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                />
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="Téléphone (WhatsApp)"
                                                    value={formData.customerPhone}
                                                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                />
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Paiement</label>
                                                <div className="space-y-2">
                                                    {methods.map(method => (
                                                        <div key={method._id} className={`border rounded-lg transition-all ${selectedMethodId === method._id ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedMethodId(method._id)}
                                                                className="w-full flex items-center gap-3 text-left p-3"
                                                            >
                                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethodId === method._id ? 'border-primary' : 'border-slate-300'}`}>
                                                                    {selectedMethodId === method._id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                                </div>
                                                                <span className={`font-bold text-sm ${selectedMethodId === method._id ? 'text-slate-900' : 'text-slate-500'}`}>{method.name}</span>
                                                            </button>
                                                            {selectedMethodId === method._id && (
                                                                <div className="px-3 pb-3 pt-0">
                                                                    <div className="p-2 bg-white rounded border border-slate-100 flex justify-between items-center text-xs">
                                                                        <code className="text-slate-900 font-mono font-bold">{method.accountValue}</code>
                                                                        <button type="button" onClick={() => handleCopy(method.accountValue)} className="text-slate-400 hover:text-primary transition-colors">
                                                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={!selectedMethodId}
                                                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                            >
                                                CONFIRMER LA COMMANDE
                                            </button>
                                        </form>
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
