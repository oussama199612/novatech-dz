import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Analytics from './components/Analytics';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

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
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Analytics />
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
