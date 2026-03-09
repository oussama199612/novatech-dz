import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazily load Admin routing pages to drastically speed up initial script parsing
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Families = React.lazy(() => import('./pages/Families'));
const Stores = React.lazy(() => import('./pages/Stores'));
const Payments = React.lazy(() => import('./pages/Payments'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Chargement du panel...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/families" element={<Families />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
