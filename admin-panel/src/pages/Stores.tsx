import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Store as StoreIcon } from 'lucide-react';
import api from '../api';

interface Store {
    _id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    active: boolean;
    createdAt: string;
}

const Stores = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        phone: '',
        active: true
    });

    const fetchStores = async () => {
        try {
            const { data } = await api.get('/stores');
            setStores(data);
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', address: '', city: '', phone: '', active: true });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (store: Store) => {
        setFormData({
            name: store.name || '',
            address: store.address || '',
            city: store.city || '',
            phone: store.phone || '',
            active: store.active !== undefined ? store.active : true
        });
        setEditingId(store._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce magasin ?')) {
            try {
                await api.delete(`/stores/${id}`);
                setStores(stores.filter(s => s._id !== id));
            } catch (error) {
                console.error('Error deleting store:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/stores/${editingId}`, formData);
            } else {
                await api.post('/stores', formData);
            }
            fetchStores();
            resetForm();
        } catch (error) {
            console.error('Error saving store:', error);
            alert('Erreur lors de l\'enregistrement du magasin.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-display font-bold text-slate-800">Magasins & Points de vente</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Nouveau Magasin</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Nom</th>
                                <th className="p-4 font-semibold">Adresse</th>
                                <th className="p-4 font-semibold">Ville</th>
                                <th className="p-4 font-semibold">Téléphone</th>
                                <th className="p-4 font-semibold">Statut</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stores.map(store => (
                                <tr key={store._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <StoreIcon size={20} />
                                            </div>
                                            <span className="font-medium text-slate-800">{store.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">{store.address}</td>
                                    <td className="p-4 text-slate-600">{store.city}</td>
                                    <td className="p-4 text-slate-600">{store.phone}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${store.active
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {store.active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(store)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(store._id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {stores.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        Aucun magasin trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingId ? 'Modifier le magasin' : 'Nouveau magasin'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nom du magasin
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field w-full"
                                    placeholder="Ex: Boutique Alger Centre"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Adresse complète
                                </label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="input-field w-full h-24 resize-none"
                                    placeholder="Adresse détaillée..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Ville
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="Ex: Alger"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="05..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="active" className="text-sm font-medium text-slate-700">
                                    Magasin actif
                                </label>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary"
                                >
                                    {editingId ? 'Enregistrer' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stores;
