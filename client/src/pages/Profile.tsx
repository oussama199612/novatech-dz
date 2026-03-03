import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Package, CheckCircle, AlertTriangle, User, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderItem {
    _id: string;
    productName: string;
}

interface Order {
    _id: string;
    orderId: string;
    status: string;
    createdAt: string;
    totalAmount: number;
    items?: OrderItem[];
    payment?: { provider?: string };
}

const Profile = () => {
    const { customer, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
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

    if (loading || !customer) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
            case 'paid': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'paid': return 'Payée';
            case 'delivered': return 'Livrée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 border-b border-gray-200 pb-6 gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 mb-2">Mon Espace</h1>
                        <p className="text-gray-500 font-light">Bienvenue, {customer.firstName}.</p>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors px-4 py-2 border border-gray-200 rounded-none hover:bg-white"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Déconnexion
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Column - User Info */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-1 space-y-6"
                    >
                        <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
                                <User size={20} className="text-gray-400" /> Profil
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Nom Complet</p>
                                    <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Adresse Email</p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-900 truncate">{customer.email}</p>
                                        {customer.isEmailVerified ? (
                                            <CheckCircle size={16} className="text-green-500 shrink-0" />
                                        ) : (
                                            <div title="Email non vérifié">
                                                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Téléphone</p>
                                    <p className={`font-medium ${!customer.phone || customer.phone === '0000000000' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                                        {(!customer.phone || customer.phone === '0000000000') ? 'Non renseigné' : customer.phone}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Orders */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-2"
                    >
                        <motion.h2 variants={itemVariants} className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                            <ShoppingBag size={24} className="text-gray-400" /> Historique des commandes
                        </motion.h2>

                        {loadingOrders ? (
                            <motion.div variants={itemVariants} className="bg-white border border-gray-100 p-12 text-center shadow-sm">
                                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-500">Récupération de vos commandes...</p>
                            </motion.div>
                        ) : orders.length === 0 ? (
                            <motion.div variants={itemVariants} className="bg-white border border-gray-100 p-12 text-center shadow-sm">
                                <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
                                <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande chez nous.</p>
                                <button
                                    onClick={() => navigate('/catalogue')}
                                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-900 transition-colors"
                                >
                                    Découvrir la collection <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <motion.div
                                        key={order._id}
                                        variants={itemVariants}
                                        className="bg-white border text-sm border-gray-100 p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center hover:shadow-lg hover:border-black/10 transition-all duration-300"
                                    >
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <span className="font-mono font-medium text-gray-900">#{order.orderId.substring(order.orderId.length - 8).toUpperCase()}</span>
                                                <span className={`px-2.5 py-1 text-xs border rounded-none font-medium ${getStatusStyle(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full" />
                                                <div>
                                                    {order.items?.length || 0} article(s)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total</p>
                                            <p className="text-lg font-serif text-gray-900">{order.totalAmount.toLocaleString()} DZD</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
