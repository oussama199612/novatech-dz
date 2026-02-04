import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api';

const Products = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products'); // Public endpoint returns all usually or use admin specific
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };



    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Produits</h1>
                    <p className="text-slate-400">Gérez votre catalogue</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Nouveau Produit
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="table-header">Image</th>
                                <th className="table-header">Nom</th>
                                <th className="table-header">Catégorie</th>
                                <th className="table-header">Prix</th>
                                <th className="table-header">Stock</th>
                                <th className="table-header">Statut</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="table-cell">
                                        <div className="h-10 w-16 bg-slate-800 rounded overflow-hidden">
                                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="table-cell font-medium text-white">{product.name}</td>
                                    <td className="table-cell">{product.category?.name || '-'}</td>
                                    <td className="table-cell font-bold text-emerald-400">{product.price.toLocaleString()} DZD</td>
                                    <td className="table-cell">{product.stock}</td>
                                    <td className="table-cell">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${product.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {product.active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-slate-700 rounded text-blue-400">
                                                <Pencil size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-slate-700 rounded text-red-400">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Products;
