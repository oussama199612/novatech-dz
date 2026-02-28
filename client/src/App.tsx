import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductLanding from './pages/ProductLanding';
import Catalogue from './pages/Catalogue';
import Cart from './pages/Cart';
import SuccessPage from './pages/SuccessPage';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-background-light text-slate-900 font-display selection:bg-primary selection:text-white">
            <Navbar />
            {/* Removed padding/max-w wrapper to allow full-width heroes */}
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Catalogue />} />
                <Route path="/product/:productId" element={<ProductLanding />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
