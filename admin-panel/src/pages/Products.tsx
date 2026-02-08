import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon, LayoutTemplate, Palette, List, Upload } from 'lucide-react';
import api from '../api';

interface ProductFeature {
    icon: string;
    title: string;
    description: string;
}

const Products = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('general');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        compareAtPrice: 0,
        description: '',
        image: '',
        category: '',
        stock: 0,
        active: true,
        // Phase 1: Organization
        vendor: '',
        productType: '',
        tags: [] as string[],
        status: 'active',
        // Media & Landing
        gallery: [] as string[],
        features: [] as ProductFeature[],
        longDescription: '',
        accentColor: '#3b82f6'
    });

    const [tagInput, setTagInput] = useState('');
    // Temp state for new feature
    const [newFeature, setNewFeature] = useState({ icon: 'Zap', title: '', description: '' });

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

    const resetForm = () => {
        setFormData({
            name: '',
            price: 0,
            compareAtPrice: 0,
            description: '',
            image: '',
            category: categories.length > 0 ? categories[0]._id : '',
            stock: 10,
            active: true,
            vendor: '',
            productType: '',
            tags: [],
            status: 'active',
            gallery: [],
            features: [],
            longDescription: '',
            accentColor: '#3b82f6'
        });
        setActiveTab('general');
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            compareAtPrice: product.compareAtPrice || 0,
            description: product.description || '',
            image: product.image || '',
            category: product.category?._id || (categories.length > 0 ? categories[0]._id : ''),
            stock: product.stock || 0,
            active: product.active,
            vendor: product.vendor || '',
            productType: product.productType || '',
            tags: product.tags || [],
            status: product.status || 'active',
            gallery: product.gallery || [],
            features: product.features || [],
            longDescription: product.longDescription || '',
            accentColor: product.accentColor || '#3b82f6'
        });
        setActiveTab('general');
        setIsModalOpen(true);
    };

    const handleUpload = async (file: File, field: 'image' | 'gallery') => {
        if (!file) return;
        const data = new FormData();
        data.append('image', file);
        try {
            const res = await api.post('/upload', data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (field === 'image') {
                setFormData(prev => ({ ...prev, image: res.data }));
            } else {
                setFormData(prev => ({ ...prev, gallery: [...prev.gallery, res.data] }));
            }
        } catch (error: any) {
            alert('Erreur upload: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleAddFeature = () => {
        if (!newFeature.title) return;
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, newFeature]
        }));
        setNewFeature({ icon: 'Zap', title: '', description: '' });
    };

    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(`Erreur sauvegarde: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Supprimer ce produit ?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchData();
            } catch (error) {
                alert('Erreur suppression');
            }
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL}${path}`;
    };

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Produits</h1>
                    <p className="text-slate-400">Gérez votre catalogue et les pages produits</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Nouveau Produit
                </button>
            </div>

            {/* List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
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
                                            <img src={getImageUrl(product.image)} className="w-full h-full object-cover" />
                                        ) : <ImageIcon size={20} className="text-slate-600" />}
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
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => openEditModal(product)} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded transition-colors"><Pencil size={18} /></button>
                                    <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-red-500/10 text-red-400 rounded transition-colors"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">

                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900 shrink-0 rounded-t-xl">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                {editingProduct ? <Pencil size={24} className="text-blue-500" /> : <Plus size={24} className="text-blue-500" />}
                                {editingProduct ? 'Modifier Produit' : 'Nouveau Produit'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-800 bg-slate-950/50 shrink-0 overflow-x-auto">
                            {[
                                { id: 'general', label: 'Général', icon: LayoutTemplate },
                                { id: 'media', label: 'Images & Galerie', icon: ImageIcon },
                                { id: 'landing', label: 'Page de Vente', icon: List },
                                { id: 'design', label: 'Design & Apparence', icon: Palette },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap
                                        ${activeTab === tab.id ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            <form onSubmit={handleSubmit} id="productForm" className="space-y-6">

                                {/* TAB: GENERAL */}
                                {activeTab === 'general' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                                        {/* Main Column (Left - 2/3) */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <div>
                                                    <label className="label">Nom du produit</label>
                                                    <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field w-full text-lg font-medium" placeholder="Ex: T-Shirt Premium" required />
                                                </div>
                                                <div>
                                                    <label className="label">Description courte</label>
                                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-field w-full h-32 resize-none" placeholder="Description pour les listes..." />
                                                </div>
                                            </div>

                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <h3 className="font-bold text-white mb-2">Prix</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label">Prix (DZD)</label>
                                                        <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="input-field w-full" />
                                                    </div>
                                                    <div>
                                                        <label className="label">Prix comparé (Promo)</label>
                                                        <input type="number" value={formData.compareAtPrice} onChange={e => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })} className="input-field w-full" placeholder="0" />
                                                        <p className="text-xs text-slate-500 mt-1">Affiché barré si supérieur au prix.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <h3 className="font-bold text-white mb-2">Inventaire</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label">Stock</label>
                                                        <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="input-field w-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sidebar (Right - 1/3) */}
                                        <div className="space-y-6">

                                            {/* Status Card */}
                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <h3 className="font-bold text-white text-sm uppercase">Statut du produit</h3>
                                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="input-field w-full">
                                                    <option value="active">Actif</option>
                                                    <option value="draft">Brouillon</option>
                                                    <option value="archived">Archivé</option>
                                                </select>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${formData.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                                                    <span className="text-sm text-slate-400 capitalize">{formData.status === 'active' ? 'En ligne' : 'Hors ligne'}</span>
                                                </div>
                                            </div>

                                            {/* Organization Card */}
                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <h3 className="font-bold text-white text-sm uppercase">Organisation</h3>

                                                <div>
                                                    <label className="label">Catégorie</label>
                                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-field w-full">
                                                        <option value="">Sélectionner...</option>
                                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="label">Type de produit</label>
                                                    <input value={formData.productType} onChange={e => setFormData({ ...formData, productType: e.target.value })} className="input-field w-full" placeholder="Ex: Chaussures" />
                                                </div>

                                                <div>
                                                    <label className="label">Vendeur (Marque)</label>
                                                    <input value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })} className="input-field w-full" placeholder="Ex: Nike" />
                                                </div>

                                                <div>
                                                    <label className="label">Tags</label>
                                                    <input
                                                        value={tagInput}
                                                        onChange={e => setTagInput(e.target.value)}
                                                        onKeyDown={handleAddTag}
                                                        className="input-field w-full"
                                                        placeholder="Entrée pour ajouter..."
                                                    />
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {formData.tags.map(tag => (
                                                            <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs flex items-center gap-1">
                                                                {tag}
                                                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={12} /></button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}

                                {/* TAB: MEDIA */}
                                {activeTab === 'media' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="space-y-4">
                                            <label className="label text-lg">Image Principale</label>
                                            <div className="flex gap-4 items-start">
                                                <div className="w-48 h-48 bg-slate-950 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative group">
                                                    {formData.image ? (
                                                        <img src={getImageUrl(formData.image)} className="w-full h-full object-contain" />
                                                    ) : <ImageIcon className="text-slate-700" size={32} />}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="btn text-sm bg-slate-800 hover:bg-slate-700 text-white cursor-pointer px-4 py-2 rounded inline-flex items-center gap-2">
                                                        <Upload size={16} /> Choisir une image
                                                        <input type="file" className="hidden" onChange={e => handleUpload(e.target.files?.[0]!, 'image')} />
                                                    </label>
                                                    <p className="text-slate-500 text-sm mt-2">Format recommandé: JPG, PNG. Max 5MB.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-800 pt-6">
                                            <label className="label text-lg mb-4 block">Galerie Photo (Slider)</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {formData.gallery.map((img, idx) => (
                                                    <div key={idx} className="aspect-square bg-slate-950 rounded-lg border border-slate-800 relative group overflow-hidden">
                                                        <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }))}
                                                            className="absolute top-2 right-2 bg-red-600 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}

                                                <div className="aspect-square bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer group relative">
                                                    <Plus className="text-slate-500 group-hover:text-blue-400 mb-2" size={32} />
                                                    <span className="text-xs text-slate-500 group-hover:text-blue-400 font-medium">Ajouter</span>
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={e => handleUpload(e.target.files?.[0]!, 'gallery')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: LANDING PAGE */}
                                {activeTab === 'landing' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="space-y-4">
                                            <label className="label">Description Détaillée (Texte Riche)</label>
                                            <textarea
                                                value={formData.longDescription}
                                                onChange={e => setFormData({ ...formData, longDescription: e.target.value })}
                                                className="input-field w-full h-64 font-mono text-sm leading-relaxed"
                                                placeholder="# Titre de section...&#10;&#10;Paragraphe de description détaillée..."
                                            />
                                            <p className="text-xs text-slate-500">Vous pouvez utiliser du texte simple pour l'instant. Le front-end le mettra en forme.</p>
                                        </div>

                                        <div className="border-t border-slate-800 pt-6">
                                            <label className="label text-lg mb-4 block">Caractéristiques Clés</label>
                                            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4">
                                                {/* Feature Input */}
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-900 p-4 rounded-lg">
                                                    <div className="md:col-span-3">
                                                        <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Titre</label>
                                                        <input
                                                            value={newFeature.title}
                                                            onChange={e => setNewFeature({ ...newFeature, title: e.target.value })}
                                                            className="input-field w-full text-sm"
                                                            placeholder="Ex: Garantie"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Icône (Lucide)</label>
                                                        <input
                                                            value={newFeature.icon}
                                                            onChange={e => setNewFeature({ ...newFeature, icon: e.target.value })}
                                                            className="input-field w-full text-sm"
                                                            placeholder="Ex: ShieldCheck"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-5">
                                                        <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Description</label>
                                                        <input
                                                            value={newFeature.description}
                                                            onChange={e => setNewFeature({ ...newFeature, description: e.target.value })}
                                                            className="input-field w-full text-sm"
                                                            placeholder="Ex: 24 mois constructeur"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddFeature}
                                                            className="w-full btn bg-blue-600 hover:bg-blue-500 text-white p-2 rounded flex items-center justify-center transition-colors"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Feature List */}
                                                <div className="space-y-2">
                                                    {formData.features.map((feat, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 p-3 bg-slate-900 border border-slate-800 rounded-lg group">
                                                            <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-blue-400">
                                                                <List size={20} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                                                                <p className="text-slate-400 text-xs">{feat.description}</p>
                                                            </div>
                                                            <div className="text-xs text-slate-600 font-mono px-2 py-1 bg-slate-950 rounded">{feat.icon}</div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFeature(idx)}
                                                                className="p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {formData.features.length === 0 && <p className="text-center text-slate-600 text-sm py-4">Aucune caractéristique ajoutée.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: DESIGN */}
                                {activeTab === 'design' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                            <label className="label text-lg mb-4 block">Couleur d'accentuation</label>
                                            <div className="flex flex-wrap gap-4">
                                                {[
                                                    '#3b82f6', // Blue
                                                    '#ef4444', // Red
                                                    '#10b981', // Emerald
                                                    '#f59e0b', // Amber
                                                    '#8b5cf6', // Violet
                                                    '#ec4899', // Pink
                                                    '#06b6d4', // Cyan
                                                ].map(color => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, accentColor: color })}
                                                        className={`w-12 h-12 rounded-full border-4 transition-transform hover:scale-110 ${formData.accentColor === color ? 'border-white ring-4 ring-white/10' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                                <input
                                                    type="color"
                                                    value={formData.accentColor}
                                                    onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                                                    className="w-12 h-12 p-0 rounded-full border-0 overflow-hidden cursor-pointer"
                                                />
                                            </div>
                                            <p className="mt-4 text-slate-400 text-sm">
                                                Cette couleur sera utilisée pour les boutons, les effets de lueur et les titres sur la page du produit.
                                            </p>
                                        </div>

                                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center justify-center">
                                            <div className="text-center space-y-4 max-w-sm">
                                                <div
                                                    className="w-full aspect-video rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${formData.accentColor}20, #000)`,
                                                        borderColor: formData.accentColor,
                                                        borderWidth: '1px'
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                                    <button
                                                        className="relative z-10 px-6 py-2 rounded-lg font-bold text-white shadow-lg transform hover:scale-105 transition-all"
                                                        style={{ backgroundColor: formData.accentColor }}
                                                    >
                                                        Acheter Maintenant
                                                    </button>
                                                </div>
                                                <p className="text-sm text-slate-500">Aperçu du style du bouton</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-800 bg-slate-900 shrink-0 rounded-b-xl flex justify-end gap-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="productForm" className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 font-bold text-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all">
                                <Save size={20} /> Enregistrer le Produit
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
