import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, ArrowUpRight } from 'lucide-react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
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

    const StatCard = ({ title, value, icon: Icon, percentage, isPositive }: any) => {
        const colorHex = isPositive ? '#22c55e' : '#ef4444'; // green-500 or red-500

        return (
            <div style={{ backgroundColor: '#1a1025' }} className="border border-purple-900/30 rounded-2xl p-6 relative overflow-hidden group hover:border-[#a855f7]/50 transition-colors duration-300 flex justify-between items-center">
                {/* Watermark Icon */}
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300">
                    <Icon size={120} />
                </div>

                <div className="relative z-10">
                    <h3 className="text-gray-400 text-sm font-medium mb-3">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                    </div>
                </div>

                {/* Progress Circle right aligned */}
                {percentage && (
                    <div className="relative z-10 w-20 h-20 ml-4 flex-shrink-0 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                        <CircularProgressbarWithChildren
                            value={parseFloat(percentage)}
                            styles={buildStyles({
                                rotation: 0.50, // Start from bottom
                                strokeLinecap: 'round',
                                pathTransitionDuration: 1.5,
                                pathColor: colorHex,
                                trailColor: 'rgba(255,255,255,0.05)',
                            })}
                        >
                            <div className="flex flex-col items-center justify-center text-center">
                                <span className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {isPositive ? '↗' : '↘'}
                                </span>
                                <span className="text-[10px] font-bold text-white tracking-tighter shadow-black drop-shadow-md">
                                    {percentage}%
                                </span>
                            </div>
                        </CircularProgressbarWithChildren>
                    </div>
                )}
            </div>
        );
    };

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
