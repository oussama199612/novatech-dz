import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, CreditCard, Layers, Store } from 'lucide-react';

import api from '../api';

const Sidebar = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<any>({});

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data)).catch(console.error);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/orders', icon: ShoppingBag, label: 'Commandes' },
        { path: '/products', icon: Package, label: 'Produits' },
        { path: '/categories', icon: Layers, label: 'Catégories' },
        ...(settings.enableMultiStore ? [{ path: '/stores', icon: Store, label: 'Magasins' }] : []),
        { path: '/payments', icon: CreditCard, label: 'Paiements' },
        { path: '/settings', icon: Settings, label: 'Paramètres' },
    ];

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen flex flex-col fixed left-0 top-0">
            <div className="h-16 flex items-center justify-center border-b border-slate-800">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    NOVATECH ADMIN
                </span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Déconnexion</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
