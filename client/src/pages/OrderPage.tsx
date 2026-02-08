import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, ArrowRight, Wallet } from 'lucide-react';
import api from '../api';
import { type Product, type PaymentMethod } from '../types';
import { getImageUrl } from '../utils';

const OrderPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        gameId: '',
    });

    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, methodsRes] = await Promise.all([
                    api.get(`/products/${productId}`),
                    api.get('/payment-methods')
                ]);
                setProduct(prodRes.data);
                setMethods(methodsRes.data);
            } catch (error) {
                console.error('Error', error);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !selectedMethodId) return;

        try {
            // 1. Create order in Backend
            const orderData = {
                orderItems: [{ product: product._id, qty: 1 }],
                ...formData,
                paymentMethodId: selectedMethodId
            };

            const { data: order } = await api.post('/orders', orderData);

            // 2. Generate WhatsApp Message
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
            // Replace with real number from settings if available
            const whatsappUrl = `https://wa.me/213550000000?text=${encodedMsg}`;

            window.open(whatsappUrl, '_blank');
            navigate('/success');
        } catch (error) {
            alert('Erreur lors de la commande.');
            console.error(error);
        }
    };

    if (loading) return <div className="p-10 text-center">Chargement...</div>;
    if (!product) return <div className="p-10 text-center">Produit introuvable</div>;

    const selectedMethod = methods.find(m => m._id === selectedMethodId);

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Info */}
            <div className="space-y-6">
                import {getImageUrl} from '../utils';

                // ...

                <div className="glass-panel p-2">
                    <img src={getImageUrl(product.image)} alt={product.name} className="w-full rounded-xl" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <p className="text-gray-400 mb-4">{product.description}</p>
                    <div className="text-4xl font-bold text-novatech-gold">{product.price.toLocaleString()} DZD</div>
                </div>
            </div>

            {/* Order Form */}
            <div className="glass-panel p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Wallet className="text-novatech-blue" />
                    Finaliser la commande
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <input
                            required
                            type="text"
                            placeholder="Votre Nom complet"
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:border-novatech-blue outline-none"
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        />
                        <input
                            required
                            type="email"
                            placeholder="Email"
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:border-novatech-blue outline-none"
                            value={formData.customerEmail}
                            onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                        />
                        <input
                            required
                            type="tel"
                            placeholder="Téléphone"
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:border-novatech-blue outline-none"
                            value={formData.customerPhone}
                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="ID Compte / Game ID (Optionnel)"
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:border-novatech-blue outline-none"
                            value={formData.gameId}
                            onChange={e => setFormData({ ...formData, gameId: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Moyen de paiement</label>
                        <div className="grid grid-cols-2 gap-2">
                            {methods.map(method => (
                                <button
                                    key={method._id}
                                    type="button"
                                    onClick={() => setSelectedMethodId(method._id)}
                                    className={`p-3 rounded-lg border text-left text-sm transition-all ${selectedMethodId === method._id
                                        ? 'bg-novatech-blue/20 border-novatech-blue text-white'
                                        : 'bg-white/5 border-white/10 hover:border-white/30 text-gray-400'
                                        }`}
                                >
                                    <div className="font-semibold">{method.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedMethod && (
                        <div className="bg-white/5 rounded-lg p-4 space-y-3 border border-white/10 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">{selectedMethod.accountLabel}</span>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(selectedMethod.accountValue)}
                                    className="flex items-center gap-1 text-novatech-cyan hover:text-white"
                                >
                                    <span className="font-mono bg-black/30 px-2 py-1 rounded select-all">{selectedMethod.accountValue}</span>
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            {selectedMethod.extraInfo && (
                                <div className="text-xs text-yellow-500/80 bg-yellow-500/10 p-2 rounded">
                                    ℹ️ {selectedMethod.extraInfo}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!selectedMethodId}
                        className="w-full mt-6 bg-gradient-to-r from-novatech-blue to-novatech-cyan text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Commander maintenant <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OrderPage;
