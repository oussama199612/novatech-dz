import { useEffect, useState } from 'react';
import { Eye, CheckCircle, Clock } from 'lucide-react';
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
                {/* Orders List */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Montant</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-mono text-sm text-blue-400 w-24 truncate" title={order.orderId}>{order.orderId}</td>
                                        <td className="p-4 font-medium text-white">
                                            {order.customerName}
                                            <div className="text-xs text-slate-500">{order.customerPhone}</div>
                                        </td>
                                        <td className="p-4 text-emerald-400 font-bold">{order.totalAmount?.toLocaleString()} DA</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    order.status === 'paid' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {order.status === 'pending' ? 'En attente' :
                                                    order.status === 'paid' ? 'Payé' : 'Livré'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-blue-400 transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <div className="p-8 text-center text-slate-500">Aucune commande trouvée.</div>
                        )}
                    </div>
                </div>

                {/* Order Details Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit sticky top-6">
                    {selectedOrder ? (
                        <div className="space-y-6">
                            <div className="border-b border-slate-800 pb-4">
                                <h3 className="text-lg font-bold text-white mb-1">Détails Commande</h3>
                                <p className="text-slate-400 text-sm">#{selectedOrder.orderId}</p>
                            </div>

                            {/* Client Info */}
                            <div className="space-y-2">
                                <p className="text-sm text-slate-400">Client</p>
                                <div className="font-medium text-white">{selectedOrder.customerName}</div>
                                <div className="text-sm text-slate-300">{selectedOrder.customerPhone}</div>
                                <div className="text-sm text-slate-300">{selectedOrder.customerEmail}</div>
                                {selectedOrder.gameId && <div className="text-sm text-yellow-400 mt-1">ID Jeu: {selectedOrder.gameId}</div>}
                            </div>

                            {/* Items */}
                            <div className="space-y-3">
                                <p className="text-sm text-slate-400">Articles</p>
                                {selectedOrder.products.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 items-center bg-slate-950 p-2 rounded">
                                        {item.image && <img src={item.image} className="w-10 h-10 object-cover rounded bg-slate-800" />}
                                        <div className="text-sm flex-1">
                                            <div className="text-white line-clamp-1">{item.name}</div>
                                            <div className="text-slate-500">x{item.quantity} · {item.price} DA</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <p className="text-sm text-slate-400 mb-2">Mettre à jour le statut</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder._id, 'paid')}
                                        disabled={selectedOrder.status === 'paid' || selectedOrder.status === 'delivered'}
                                        className="btn bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle size={14} /> Payé
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder._id, 'delivered')}
                                        disabled={selectedOrder.status === 'delivered'}
                                        className="btn bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle size={14} /> Livré
                                    </button>
                                </div>
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
