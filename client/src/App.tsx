import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import GTMScript from './components/GTMScript';
import api from './api';

// Navigation pages are lazily loaded to drastically improve initial load time
const Home = React.lazy(() => import('./pages/Home'));
const ProductLanding = React.lazy(() => import('./pages/ProductLanding'));
const Catalogue = React.lazy(() => import('./pages/Catalogue'));
const Cart = React.lazy(() => import('./pages/Cart'));
const SuccessPage = React.lazy(() => import('./pages/SuccessPage'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Profile = React.lazy(() => import('./pages/Profile'));
const InfoPage = React.lazy(() => import('./pages/InfoPage'));

function App() {
  const [settings, setSettings] = React.useState<any>(null);

  React.useEffect(() => {
    // Fetch settings on initial load to grab dynamic configurations like GTM ID
    const fetchGlobalSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data || {});
      } catch (error) {
        console.error('Failed to load global settings:', error);
      }
    };
    fetchGlobalSettings();

    // Poll every 30 seconds so if Admin changes it, Storefront adjusts silently
    const interval = setInterval(fetchGlobalSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {settings?.gtmId && <GTMScript gtmId={settings.gtmId} />}
          <div className="min-h-screen bg-background-light text-slate-900 font-display selection:bg-primary selection:text-white flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Catalogue />} />
                  <Route path="/product/:productId" element={<ProductLanding />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/success" element={<SuccessPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Informational Pages */}
                  <Route path="/about" element={<InfoPage title="Notre Histoire" field="aboutUs" />} />
                  <Route path="/contact" element={<InfoPage title="Nous Contacter" field="contactInfo" />} />
                  <Route path="/terms" element={<InfoPage title="Conditions d'Utilisation" field="termsOfService" />} />
                  <Route path="/privacy" element={<InfoPage title="Politique de Confidentialité" field="privacyPolicy" />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
