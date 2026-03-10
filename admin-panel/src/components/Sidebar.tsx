import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, CreditCard, Layers, Store, Component } from 'lucide-react';

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
        { path: '/families', icon: Component, label: 'Familles (Marques)' },
        ...(settings.enableMultiStore ? [{ path: '/stores', icon: Store, label: 'Magasins' }] : []),
        { path: '/payments', icon: CreditCard, label: 'Paiements' },
        { path: '/settings', icon: Settings, label: 'Paramètres' },
    ];

    return (
        <div className="w-64 border-r border-purple-900/30 min-h-screen flex flex-col fixed left-0 top-0" style={{ backgroundColor: '#110c18' }}>
            <div className="h-20 flex items-center px-6 border-b border-purple-900/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-100 to-white bg-clip-text text-transparent">
                        Premium Shop
                    </span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive ? 'bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-gray-400 hover:bg-purple-900/20 hover:text-white'}
                `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={isActive ? "text-white" : "text-gray-500"} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-purple-900/30">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-pink-500 hover:bg-pink-500/10 w-full transition-colors text-sm font-medium"
                >
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
