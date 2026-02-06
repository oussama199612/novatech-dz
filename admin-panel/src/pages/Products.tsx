import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import api from '../api';

const Products = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null); // null = create mode

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        description: '',
        image: '',
        category: '',
        stock: 0,
        active: true
    });

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            price: 0,
            description: '',
            image: '',
            category: categories.length > 0 ? categories[0]._id : '',
            stock: 10,
            active: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description || '',
            image: product.image || '',
            category: product.category?._id || (categories.length > 0 ? categories[0]._id : ''),
            stock: product.stock || 0,
            active: product.active
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                // Update
                await api.put(`/products/${editingProduct._id}`, formData);
            } else {
                // Create
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchData();
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
                <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Nouveau Produit
                </button>
            </div>

            {/* Products Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Image</th>
                                <th className="p-4">Nom</th>
                                <th className="p-4">Catégorie</th>
                                <th className="p-4">Prix</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="h-12 w-12 bg-slate-800 rounded overflow-hidden flex items-center justify-center">
                                            {product.image ? (
                                                <img
                                                    src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL}${product.image}`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon size={20} className="text-slate-600" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-white">{product.name}</td>
                                    <td className="p-4 text-slate-400">{product.category?.name || '-'}</td>
                                    <td className="p-4 font-bold text-emerald-400">{product.price.toLocaleString()} DA</td>
                                    <td className="p-4 text-slate-300">{product.stock}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${product.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {product.active ? 'Actif' : 'Caché'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEditModal(product)} className="p-2 hover:bg-blue-500/10 rounded text-blue-400 transition-colors">
                                                <Pencil size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-red-500/10 rounded text-red-400 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && <div className="p-8 text-center text-slate-500">Aucun produit.</div>}
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                            <h2 className="text-2xl font-bold text-white">{editingProduct ? 'Modifier Produit' : 'Nouveau Produit'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Nom du produit</label>
                                        <input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Prix (DZD)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="input-field w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Catégorie</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="input-field w-full"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Stock</label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                            className="input-field w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Image du produit</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                className="input-field flex-1"
                                                placeholder="URL ou Upload..."
                                                readOnly
                                            />
                                            <input
                                                type="file"
                                                id="image-file"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const data = new FormData();
                                                        data.append('image', file);
                                                        try {
                                                            const res = await api.post('/upload', data);
                                                            setFormData({ ...formData, image: res.data });
                                                        } catch (error) {
                                                            console.error(error);
                                                            alert('Erreur upload');
                                                        }
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor="image-file"
                                                className="btn bg-slate-800 hover:bg-slate-700 text-white cursor-pointer px-4 py-2 rounded border border-slate-600 flex items-center gap-2"
                                            >
                                                <ImageIcon size={18} /> Upload
                                            </label>
                                        </div>

                                        <div className="mt-2 h-32 bg-slate-950 rounded border border-slate-800 flex items-center justify-center overflow-hidden">
                                            {formData.image ? (
                                                <img
                                                    src={formData.image.startsWith('http') ? formData.image : `${import.meta.env.VITE_API_URL}${formData.image}`}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            ) : (
                                                <span className="text-slate-600 text-xs">Aperçu image</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <input
                                            type="checkbox"
                                            id="active"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="active" className="text-white font-medium select-none">Produit Actif (Visible)</label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field w-full h-32"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">
                                    Annuler
                                </button>
                                <button type="submit" className="btn-primary px-8 py-2 flex items-center gap-2">
                                    <Save size={18} /> Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
