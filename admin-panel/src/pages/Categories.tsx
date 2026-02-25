import { useEffect, useState } from 'react';
import { Trash2, Plus, Layers } from 'lucide-react';
import api from '../api';

const Categories = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [newIcon, setNewIcon] = useState('');
    const [newParentCategory, setNewParentCategory] = useState('');

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name: newName, slug: newSlug, icon: newIcon, parentCategory: newParentCategory || null });
            setNewName('');
            setNewSlug('');
            setNewIcon('');
            setNewParentCategory('');
            fetchCategories();
        } catch (error) {
            alert('Erreur: Vérifiez que le slug est unique.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Supprimer cette catégorie ?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white mb-2">Gestion des Catégories</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulaire Création */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-blue-500" />
                        Nouvelle Catégorie
                    </h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Nom</label>
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="input-field w-full"
                                placeholder="Ex: PC Gamer"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Slug (URL)</label>
                            <input
                                value={newSlug}
                                onChange={(e) => setNewSlug(e.target.value)}
                                className="input-field w-full"
                                placeholder="ex: pc-gamer"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Icône (Lucide Name)</label>
                            <input
                                value={newIcon}
                                onChange={(e) => setNewIcon(e.target.value)}
                                className="input-field w-full"
                                placeholder="ex: Monitor"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Catégorie Parente</label>
                            <select
                                value={newParentCategory}
                                onChange={(e) => setNewParentCategory(e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="">Aucune (Catégorie Principale)</option>
                                {categories.filter(c => !c.parentCategory).map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn-primary w-full py-2">Ajouter</button>
                    </form>
                </div>

                {/* Liste */}
                <div className="md:col-span-2 space-y-4">
                    {categories.map((cat) => (
                        <div key={cat._id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-blue-500/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500/10 group-hover:text-blue-300">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">
                                        {cat.parentCategory && <span className="text-slate-500 mr-2 text-sm">↳ {cat.parentCategory.name} /</span>}
                                        {cat.name}
                                    </h4>
                                    <div className="text-sm text-slate-500 font-mono">/{cat.slug}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(cat._id)}
                                className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}

                    {categories.length === 0 && <div className="text-slate-500 text-center">Aucune catégorie.</div>}
                </div>
            </div>
        </div>
    );
};

export default Categories;
