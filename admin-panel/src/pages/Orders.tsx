import { useEffect, useState } from 'react';
import { Eye, CheckCircle, Clock, Printer } from 'lucide-react';
import api from '../api';

const Orders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data.orders || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (window.confirm(`Changer le statut en "${newStatus}" ?`)) {
            try {
                await api.put(`/orders/${id}/status`, { status: newStatus });
                fetchOrders();
                if (selectedOrder && selectedOrder._id === id) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            } catch (error) {
                alert('Erreur lors de la mise à jour');
            }
        }
    };

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">Gestion des Commandes</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders List - Takes 1/3 width on desktop (sidebar style) */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[80vh] flex flex-col print:hidden">
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        <table className="w-full text-left text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold sticky top-0 z-10">
                                <tr>
                                    <th className="p-4">Info Commande</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {orders.map((order) => (
                                    <tr
                                        key={order._id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`cursor-pointer transition-colors ${selectedOrder?._id === order._id ? 'bg-blue-900/20 border-l-4 border-blue-500' : 'hover:bg-slate-800/50 border-l-4 border-transparent'}`}
                                    >
                                        <td className="p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-mono text-sm text-blue-400" title={order.orderId}>#{order.orderId.slice(-6)}</span>
                                                <div className="flex gap-2">
                                                    {order.store && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 font-bold flex items-center gap-1">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
                                                            {order.store.name}
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        order.status === 'paid' ? 'bg-blue-500/10 text-blue-500' :
                                                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                                'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                        {order.status === 'pending' ? 'Attente' :
                                                            order.status === 'paid' ? 'Payé' :
                                                                order.status === 'delivered' ? 'Livré' : 'Annulé'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="font-medium text-white text-sm mb-0.5">{order.customerName}</div>
                                            <div className="flex justify-between items-center text-xs text-slate-500">
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span className="text-emerald-400 font-bold">{order.totalAmount?.toLocaleString()} DA</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <div className="p-8 text-center text-slate-500">Aucune commande.</div>
                        )}
                    </div>
                </div>

                {/* Order Details Panel */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit sticky top-6">
                    {selectedOrder ? (
                        <div className="space-y-6">
                            <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Détails de la commande</h3>
                                    <p className="text-slate-400 text-sm font-mono">ID: {selectedOrder.orderId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-sm">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                    {selectedOrder.store && (
                                        <p className="text-indigo-400 font-medium text-sm flex items-center justify-end gap-1 mt-1">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
                                            Magasin: {selectedOrder.store.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Client</p>
                                    <p className="font-medium text-white">{selectedOrder.customerName}</p>
                                    <p className="text-sm text-slate-400">{selectedOrder.customerPhone || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Total</p>
                                    <p className="text-xl font-bold text-emerald-400">{selectedOrder.totalAmount?.toLocaleString()} DA</p>
                                </div>
                            </div>

                            {/* Simple Items List */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Produits</h4>
                                <div className="bg-slate-800/30 rounded-lg overflow-hidden border border-slate-800">
                                    {/* Deduplicate items for display to handle legacy bad data */}
                                    {selectedOrder.products.reduce((acc: any[], item: any) => {
                                        // Create a unique key based on product ID and variant info
                                        const variantKey = item.variant?.title || (item.options ? JSON.stringify(item.options) : 'standard');
                                        const key = `${item.product}-${variantKey}`;

                                        // Check if we already have this item (naive dedupe for exact duplicates)
                                        // Note: If you have 2 identical items legitimately (unlikely in this context), this might merge them,
                                        // but it's better than the current double-display bug.
                                        // A better check is to see if one has 'variant' populated and the other doesn't (the bug case).

                                        // The bug produced one entry with NO variant info, and one WITH variant info (or just duplicates).
                                        // We prefer the one WITH keys if possible, or just unique ones.

                                        // Simple Unique Filter by comparing properties:
                                        const exists = acc.find(existing =>
                                            existing.product._id === item.product._id &&
                                            JSON.stringify(existing.variant) === JSON.stringify(item.variant) &&
                                            JSON.stringify(existing.options) === JSON.stringify(item.options)
                                        );

                                        if (!exists) {
                                            acc.push(item);
                                        }
                                        return acc;
                                    }, []).map((item: any, idx: number) => (
                                        <div key={idx} className="p-4 flex items-center gap-4 border-b border-slate-800 last:border-0">
                                            {item.image && (
                                                <img src={item.image} alt="" className="w-12 h-12 object-contain bg-white rounded" />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-bold text-white mb-0.5">{item.name}</p>
                                                {/* Enhanced Variant Display */}
                                                {(item.variant?.title || (item.options && Object.keys(item.options).length > 0)) ? (
                                                    <div className="text-sm text-novatech-blue font-medium bg-blue-900/20 px-2 py-1 rounded w-fit border border-blue-500/30">
                                                        {item.variant?.title || Object.values(item.options).join(' / ')}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic">Standard</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-mono">x{item.quantity}</p>
                                                <p className="text-sm text-slate-400">{(item.totalItemPrice || item.price * item.quantity).toLocaleString()} DA</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder._id, 'paid')}
                                    disabled={selectedOrder.status === 'paid' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                                    className="btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle size={16} /> Payé
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder._id, 'delivered')}
                                    disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle size={16} /> Livré
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder._id, 'cancelled')}
                                    disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                                    className="btn bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle size={16} /> Annuler
                                </button>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Supprimer définitivement ?')) {
                                            try {
                                                await api.delete(`/orders/${selectedOrder._id}`);
                                                setSelectedOrder(null);
                                                fetchOrders();
                                            } catch (e) { alert('Erreur'); }
                                        }
                                    }}
                                    className="btn bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Supprimer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                            <Clock size={48} className="mb-4 opacity-20" />
                            <p>Sélectionnez une commande pour voir les détails.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;
