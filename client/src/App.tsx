import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductLanding from './pages/ProductLanding';
import Catalogue from './pages/Catalogue';
import SuccessPage from './pages/SuccessPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background-light text-slate-900 font-display selection:bg-primary selection:text-white">
        <Navbar />
        {/* Removed padding/max-w wrapper to allow full-width heroes */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Catalogue />} />
            <Route path="/product/:productId" element={<ProductLanding />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
