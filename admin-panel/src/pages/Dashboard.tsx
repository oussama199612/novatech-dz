import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, ArrowUpRight } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
    // Mock data for initial render, real data would come from an analytics endpoint (not yet implemented)
    // or by fetching orders and calculating client-side (easier for MVP).
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        avgValue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/orders');
                // data = { orders: [], page, pages }
                const orders = data.orders || [];
                const totalRevenue = orders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);

                setStats({
                    revenue: totalRevenue,
                    orders: orders.length,
                    avgValue: orders.length ? Math.round(totalRevenue / orders.length) : 0
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, percentage, isPositive }: any) => (
        <div style={{ backgroundColor: '#1a1025' }} className="border border-purple-900/30 rounded-2xl p-6 relative overflow-hidden group hover:border-[#a855f7]/50 transition-colors duration-300">
            {/* Watermark Icon */}
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300">
                <Icon size={120} />
            </div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-3">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                    </div>
                    {percentage && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className={`px-2 py-1 rounded bg-opacity-10 text-xs font-bold flex items-center gap-1 ${isPositive ? 'bg-green-500 text-green-400' : 'bg-red-500 text-red-500'}`}>
                                {isPositive ? '↗' : '↘'} {percentage}%
                            </span>
                            <span className="text-gray-500 text-xs">vs last month</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                    <Icon size={24} className="text-purple-400 opacity-80" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Dashboard</h1>
                    <p className="text-gray-400">Aperçu général de votre boutique</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Chiffre d'Affaires (Est.)"
                    value={`${stats.revenue.toLocaleString()} DZD`}
                    icon={DollarSign}
                    percentage="12.5"
                    isPositive={true}
                />
                <StatCard
                    title="Commandes"
                    value={stats.orders}
                    icon={ShoppingBag}
                    percentage="8.2"
                    isPositive={true}
                />
                <StatCard
                    title="Panier Moyen"
                    value={`${stats.avgValue.toLocaleString()} DZD`}
                    icon={ArrowUpRight}
                    percentage="2.1"
                    isPositive={false}
                />
            </div>

            <div style={{ backgroundColor: '#1a1025' }} className="border border-purple-900/30 rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-purple-900/30 flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Dernières Commandes</h3>
                    <a href="/orders" className="text-[#a855f7] hover:text-[#b026ff] text-sm font-medium transition-colors">Voir tout</a>
                </div>
                <div className="p-8 text-center text-gray-500 text-sm">
                    Aperçu des commandes réelles à intégrer ici.
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
