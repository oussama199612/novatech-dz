import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductLanding from './pages/ProductLanding';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-nebula-bg text-nebula-text font-sans selection:bg-nebula-violet selection:text-white">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:productId" element={<ProductLanding />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </main>

        <footer className="border-t border-white/10 mt-12 py-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Novatech. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
