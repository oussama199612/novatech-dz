import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Package, CheckCircle, AlertTriangle } from 'lucide-react';

const Profile = () => {
    const { customer, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!loading && !customer) {
            navigate('/auth');
        } else if (customer) {
            // Fetch orders
            api.get('/orders/myorders')
                .then(res => {
                    setOrders(res.data);
                })
                .catch(err => console.error("Could not fetch orders", err))
                .finally(() => setLoadingOrders(false));
        }
    }, [customer, loading, navigate]);

    if (loading || !customer) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="bg-black px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
                                <p className="text-gray-300 mt-1">Gérez vos informations et commandes.</p>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <LogOut size={20} />
                                Déconnexion
                            </button>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Personnelles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500">Nom Complet</p>
                                <p className="font-bold text-gray-900">{customer.firstName} {customer.lastName}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500">Email</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900">{customer.email}</p>
                                    {customer.isEmailVerified ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                        <div title="Email non vérifié">
                                            <AlertTriangle size={16} className="text-amber-500" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500">Téléphone</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900">{customer.phone}</p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={24} /> Mes Commandes
                        </h2>

                        {loadingOrders ? (
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                                <p className="text-gray-500">Chargement de votre historique...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                                <p className="text-gray-500">Votre historique de commandes apparaîtra ici.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order._id} className="bg-white border text-sm border-gray-200 rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono font-bold text-gray-900">{order.orderId}</span>
                                                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {order.status === 'pending' ? 'En attente' :
                                                        order.status === 'paid' ? 'Payée' :
                                                            order.status === 'delivered' ? 'Livrée' : 'Annulée'}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 mb-1">{new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}</p>
                                            <div className="text-gray-600">
                                                {order.products.length} article(s) - Paiement: {order.paymentMethodSnapshot?.name || 'Inconnu'}
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-lg font-bold text-gray-900">{order.totalAmount.toLocaleString()} DZD</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
