import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import api from '../api';

interface Family {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    showInHomeBar?: boolean;
}

const Families = () => {
    const [families, setFamilies] = useState<Family[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFamily, setCurrentFamily] = useState<Partial<Family> | null>(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    const getImageUrl = (path: string | undefined) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;

        const isProd = import.meta.env.PROD;
        const defaultApiUrl = isProd
            ? 'https://novatech-backend-bov0.onrender.com/api'
            : 'http://localhost:5000/api';

        const apiBase = import.meta.env.VITE_API_URL || defaultApiUrl;
        const host = apiBase.replace(/\/api\/?$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${host}${cleanPath}`;
    };

    const fetchFamilies = async () => {
        try {
            const { data } = await api.get('/families');
            setFamilies(data);
        } catch (err: any) {
            console.error('Failed to fetch families', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilies();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette famille (marque) ?')) {
            try {
                await api.delete(`/families/${id}`);
                fetchFamilies();
            } catch (err: any) {
                console.error('Failed to delete family', err);
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (currentFamily?._id) {
                await api.put(`/families/${currentFamily._id}`, currentFamily);
            } else {
                await api.post('/families', currentFamily);
            }
            setIsModalOpen(false);
            fetchFamilies();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        }
    };

    const openModal = (family: Partial<Family> | null = null) => {
        setCurrentFamily(family || { name: '', showInHomeBar: false, image: '' });
        setIsModalOpen(true);
        setError('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setCurrentFamily(prev => prev ? { ...prev, image: res.data } : null);
        } catch (err: any) {
            setError('Erreur lors du téléchargement de l\'image: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    const filteredFamilies = families.filter(family =>
        family.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Familles de Produits (Marques)</h1>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Nouvelle Famille
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher une famille..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10 w-full"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image / Nom</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sur l'Accueil</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFamilies.map((family) => (
                                <tr key={family._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                                {family.image ? (
                                                    <img className="h-full w-full object-contain" src={getImageUrl(family.image)} alt="" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                                                )}
                                            </div>
                                            <div className="font-medium text-gray-900">{family.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {family.slug}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {family.showInHomeBar ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Oui
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Non
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => openModal(family)} className="text-blue-600 hover:text-blue-900 transition-colors p-1">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(family._id)} className="text-red-600 hover:text-red-900 transition-colors p-1">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFamilies.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        Aucune famille trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentFamily?._id ? 'Modifier la Famille' : 'Nouvelle Famille'}
                            </h2>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                <AlertCircle size={18} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom de la Famille
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={currentFamily?.name || ''}
                                    onChange={(e) => setCurrentFamily({ ...currentFamily, name: e.target.value })}
                                    className="input-field w-full"
                                    placeholder="Ex: Coca-Cola"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image (Logo de la marque)
                                </label>
                                <div className="mt-1 flex items-center gap-4">
                                    <div className="h-16 w-16 bg-gray-100 border border-gray-200 rounded overflow-hidden flex-shrink-0">
                                        {currentFamily?.image ? (
                                            <img src={getImageUrl(currentFamily.image)} alt="Aperçu" className="h-full w-full object-contain" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">Aucune</div>
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        {uploading ? 'Chargement...' : 'Changer'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="showInHomeBar"
                                    type="checkbox"
                                    checked={currentFamily?.showInHomeBar || false}
                                    onChange={(e) => setCurrentFamily({ ...currentFamily, showInHomeBar: e.target.checked })}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                />
                                <label htmlFor="showInHomeBar" className="ml-2 block text-sm text-gray-900">
                                    Afficher dans la barre des marques de l'accueil
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Families;
