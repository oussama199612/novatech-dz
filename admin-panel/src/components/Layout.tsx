import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
    const token = localStorage.getItem('adminToken');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row md:pl-64">

            {/* Mobile Top Navbar */}
            <div className="md:hidden h-16 border-b border-purple-900/30 flex items-center justify-between px-4 sticky top-0 z-40" style={{ backgroundColor: '#110c18' }}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span className="font-bold text-white tracking-widest text-sm uppercase">Admin</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
