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
                                                    order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                        'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {order.status === 'pending' ? 'En attente' :
                                                    order.status === 'paid' ? 'Payé' :
                                                        order.status === 'delivered' ? 'Livré' : 'Annulé'}
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
                        <>
                            {/* Invoice Header */}
                            <div className="bg-white p-6 rounded-t-lg border-b border-slate-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">FACTURE</h2>
                                        <p className="text-sm text-slate-500 font-mono mt-1">#{selectedOrder.orderId}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</div>
                                        <div className="text-slate-700 font-medium">
                                            {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 text-sm">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Facturé à</div>
                                        <div className="font-bold text-slate-900">{selectedOrder.customerName}</div>
                                        <div className="text-slate-600">{selectedOrder.customerPhone}</div>
                                        <div className="text-slate-600">{selectedOrder.customerEmail}</div>
                                        {selectedOrder.gameId && (
                                            <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block font-bold">
                                                ID Jeu: {selectedOrder.gameId}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paiement</div>
                                        <div className="font-medium text-slate-900">{selectedOrder?.paymentMethodSnapshot?.name || 'Standard'}</div>
                                        <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase ${selectedOrder.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                            selectedOrder.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                                                selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {selectedOrder.status === 'pending' ? 'En attente' :
                                                selectedOrder.status === 'paid' ? 'Payé' :
                                                    selectedOrder.status === 'delivered' ? 'Livré' : 'Annulé'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Table */}
                            <div className="bg-white rounded-b-lg overflow-hidden border-t-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                        <tr>
                                            <th className="py-3 px-6 w-1/2">Description</th>
                                            <th className="py-3 px-4 text-center">Qté</th>
                                            <th className="py-3 px-6 text-right">Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {selectedOrder.products.map((item: any, idx: number) => {
                                            // Fallback logic for old orders that didn't have totalItemPrice
                                            const itemTotal = item.totalItemPrice || (item.price * item.quantity);

                                            // Variant formatting
                                            let variantText = '';
                                            if (item.variant?.title) {
                                                variantText = item.variant.title; // e.g., "Noir / 42"
                                            } else if (item.options) {
                                                variantText = Object.values(item.options).join(' / ');
                                            }

                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            {item.image && (
                                                                <div className="w-12 h-12 rounded-lg border border-slate-100 overflow-hidden flex-shrink-0 bg-white p-1">
                                                                    <img src={item.image} className="w-full h-full object-contain" alt="" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-bold text-slate-900">{item.name}</div>
                                                                {variantText && (
                                                                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                                                                        Variante: <span className="text-slate-700">{variantText}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center font-mono text-slate-600">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-4 px-6 text-right font-medium text-slate-900">
                                                        {itemTotal.toLocaleString()} <span className="text-xs text-slate-400">DA</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-50/50 border-t border-slate-100">
                                        <tr>
                                            <td className="py-4 px-6 text-right font-medium text-slate-500" colSpan={2}>Total Commande</td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-xl font-bold text-slate-900">
                                                    {selectedOrder.totalAmount?.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-medium text-slate-500 ml-1">DA</span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder._id, 'paid')}
                                    disabled={selectedOrder.status === 'paid' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                                    className="btn bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle size={14} /> Payé
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder._id, 'delivered')}
                                    disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle size={14} /> Livré
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedOrder._id, 'cancelled')}
                                    disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                                    className="btn bg-slate-600 hover:bg-slate-700 text-white py-2 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle size={14} /> Annuler
                                </button>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Êtes-vous sûr de vouloir SUPPRIMER cette commande définitivement ?')) {
                                            try {
                                                await api.delete(`/orders/${selectedOrder._id}`);
                                                setSelectedOrder(null);
                                                fetchOrders();
                                            } catch (error) {
                                                alert('Erreur lors de la suppression');
                                            }
                                        }
                                    }}
                                    className="btn bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={14} /> Supprimer
                                </button>
                            </div>
                        </>
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
