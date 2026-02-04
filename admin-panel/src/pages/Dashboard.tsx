import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Users, ArrowUpRight } from 'lucide-react';
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

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-start justify-between">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord</h1>
                <p className="text-slate-400">Aperçu général de votre boutique</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Chiffre d'Affaires (Est.)"
                    value={`${stats.revenue.toLocaleString()} DZD`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Commandes"
                    value={stats.orders}
                    icon={ShoppingBag}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Panier Moyen"
                    value={`${stats.avgValue.toLocaleString()} DZD`}
                    icon={ArrowUpRight}
                    color="bg-violet-500"
                />
            </div>

            {/* Recent Orders Table could go here */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="font-bold text-white">Dernières Commandes</h3>
                </div>
                <div className="p-8 text-center text-slate-500">
                    Voir la section "Commandes" pour plus de détails.
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
