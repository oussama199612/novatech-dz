import { useEffect, useState } from 'react';
import api from '../api';

const Orders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">Commandes</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6 text-slate-300">
                {orders.length === 0 ? (
                    <p>Aucune commande pour le moment.</p>
                ) : (
                    <ul>
                        {orders.map((order) => (
                            <li key={order._id} className="mb-2">{order._id} - {order.totalPrice} DZD</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Orders;
