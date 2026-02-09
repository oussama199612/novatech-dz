import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon, LayoutTemplate, Palette, List, Upload, ChevronDown } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../api';
import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded text-red-200">
                    <h3 className="font-bold">Erreur de chargement de l'éditeur</h3>
                    <p className="text-sm opacity-80">{this.state.error?.toString()}</p>
                    <div className="mt-4 text-xs font-mono whitespace-pre-wrap bg-black/50 p-2 rounded">
                        {this.props.fallback}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

interface ProductFeature {
    icon: string;
    title: string;
    description: string;
}

interface ProductOption {
    name: string;
    values: string[];
}

interface ProductVariant {
    title: string;
    price: number;
    compareAtPrice: number;
    costPerItem: number;
    sku: string;
    barcode: string;
    stock: number;
    trackQuantity: boolean;
    image: string;
}

interface ProductOffer {
    quantity: number;
    price: number;
    label: string;
    isBestValue: boolean;
}

const PREDEFINED_COLORS: Record<string, string> = {
    'Noir': '#000000', 'Blanc': '#FFFFFF', 'Rouge': '#FF0000', 'Bleu': '#0000FF',
    'Vert': '#008000', 'Jaune': '#FFFF00', 'Orange': '#FFA500', 'Violet': '#800080',
    'Rose': '#FFC0CB', 'Gris': '#808080', 'Marron': '#A52A2A', 'Beige': '#F5F5DC',
    'Marine': '#000080', 'Kaki': '#F0E68C', 'Bordeaux': '#800000', 'Turquoise': '#40E0D0'
};

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
        costPerItem: 0,
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
        // Phase 2: Inventory & Shipping
        sku: '',
        barcode: '',
        trackQuantity: true,
        continueSellingWhenOutOfStock: false,
        weight: 0,
        weightUnit: 'kg',
        // Phase 3: Variants
        hasVariants: false,
        options: [] as ProductOption[],
        variants: [] as ProductVariant[],
        // Phase 5: Offers
        offers: [] as ProductOffer[],
        // Media & Landing
        gallery: [] as string[],
        features: [] as ProductFeature[],
        longDescription: '',
        accentColor: '#3b82f6'
    });

    const [tagInput, setTagInput] = useState('');
    // Temp state for new feature
    const [newFeature, setNewFeature] = useState({ icon: 'Zap', title: '', description: '' });
    // Temp state for new offer
    const [newOffer, setNewOffer] = useState({ quantity: 2, price: 0, label: '', isBestValue: false });

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
            costPerItem: 0,
            description: '',
            image: '',
            category: categories.length > 0 ? categories[0]._id : '',
            stock: 10,
            active: true,
            vendor: '',
            productType: '',
            tags: [],
            status: 'active',
            sku: '',
            barcode: '',
            trackQuantity: true,
            continueSellingWhenOutOfStock: false,
            weight: 0,
            weightUnit: 'kg',
            hasVariants: false,
            options: [],
            variants: [],
            offers: [], // Phase 5
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
            costPerItem: product.costPerItem || 0,
            description: product.description || '',
            image: product.image || '',
            category: product.category?._id || (categories.length > 0 ? categories[0]._id : ''),
            stock: product.stock || 0,
            active: product.active,
            vendor: product.vendor || '',
            productType: product.productType || '',
            tags: product.tags || [],
            status: product.status || 'active',
            sku: product.sku || '',
            barcode: product.barcode || '',
            trackQuantity: product.trackQuantity !== undefined ? product.trackQuantity : true,
            continueSellingWhenOutOfStock: product.continueSellingWhenOutOfStock || false,
            weight: product.weight || 0,
            weightUnit: product.weightUnit || 'kg',
            hasVariants: product.hasVariants || false,
            options: product.options || [],
            variants: product.variants || [],
            offers: product.offers || [],
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

    // Calculate Profit & Margin
    const profit = formData.price - formData.costPerItem;
    const margin = formData.price > 0 ? ((profit / formData.price) * 100).toFixed(1) : 0;

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

                                            {/* PRICING CARD */}
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
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="label">Coût par article</label>
                                                        <input type="number" value={formData.costPerItem} onChange={e => setFormData({ ...formData, costPerItem: Number(e.target.value) })} className="input-field w-full" placeholder="0" />
                                                        <p className="text-xs text-slate-500 mt-1">Non visible par les clients.</p>
                                                    </div>
                                                    <div className="col-span-2 flex items-center gap-8 px-4">
                                                        <div>
                                                            <div className="text-xs text-slate-500 uppercase">Marge</div>
                                                            <div className="text-white font-mono">{margin}%</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-500 uppercase">Profit</div>
                                                            <div className="text-white font-mono">{profit.toLocaleString()} DA</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* VARIANTS CARD */}
                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-bold text-white">Variantes</h3>
                                                    {!formData.hasVariants && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, hasVariants: true, options: [{ name: 'Couleur', values: [] }] })}
                                                            className="text-blue-400 text-sm hover:underline"
                                                        >
                                                            + Ajouter des options (taille ou couleur)
                                                        </button>
                                                    )}
                                                </div>

                                                {formData.hasVariants && (
                                                    <div className="space-y-6">
                                                        {/* Options List */}
                                                        {formData.options.map((option, idx) => {
                                                            const isColorOption = ['couleur', 'color', 'coloris'].includes(option.name.toLowerCase());

                                                            return (
                                                                <div key={idx} className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3 relative">
                                                                    <div className="flex justify-between items-center">
                                                                        <label className="text-sm font-bold text-slate-300">Nom de l'option</label>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newOptions = formData.options.filter((_, i) => i !== idx);
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    options: newOptions,
                                                                                    hasVariants: newOptions.length > 0
                                                                                });
                                                                            }}
                                                                            className="text-red-400 hover:text-red-300 text-xs"
                                                                        >
                                                                            Supprimer
                                                                        </button>
                                                                    </div>
                                                                    <div className="relative">
                                                                        <input
                                                                            value={option.name}
                                                                            onChange={e => {
                                                                                const newOptions = [...formData.options];
                                                                                newOptions[idx].name = e.target.value;
                                                                                setFormData({ ...formData, options: newOptions });
                                                                            }}
                                                                            className="input-field w-full mb-2"
                                                                            placeholder="Ex: Taille, Couleur..."
                                                                            list={`option-suggestions-${idx}`}
                                                                        />
                                                                        <datalist id={`option-suggestions-${idx}`}>
                                                                            <option value="Taille" />
                                                                            <option value="Couleur" />
                                                                            <option value="Matière" />
                                                                            <option value="Style" />
                                                                        </datalist>
                                                                    </div>

                                                                    <label className="text-sm font-bold text-slate-300">Valeurs de l'option</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            onKeyDown={e => {
                                                                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                                                    e.preventDefault();
                                                                                    const val = e.currentTarget.value.trim();
                                                                                    const newOptions = [...formData.options];
                                                                                    if (!newOptions[idx].values.includes(val)) {
                                                                                        newOptions[idx].values.push(val);
                                                                                    }
                                                                                    setFormData({ ...formData, options: newOptions });
                                                                                    e.currentTarget.value = '';
                                                                                }
                                                                            }}
                                                                            className="input-field w-full"
                                                                            placeholder={isColorOption ? "Ex: Noir, Rouge... (Entrée)" : "Entrée pour ajouter (ex: S, M, L)..."}
                                                                            list={isColorOption ? `color-suggestions-${idx}` : undefined}
                                                                        />
                                                                        {isColorOption && (
                                                                            <datalist id={`color-suggestions-${idx}`}>
                                                                                {Object.keys(PREDEFINED_COLORS).map(color => (
                                                                                    <option key={color} value={color} />
                                                                                ))}
                                                                            </datalist>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                                        {option.values.map(val => {
                                                                            const colorHex = isColorOption ? (PREDEFINED_COLORS[val] || val) : null;
                                                                            const isValidColor = /^#([0-9A-F]{3}){1,2}$/i.test(colorHex || '');

                                                                            return (
                                                                                <span key={val} className="bg-slate-800 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border border-slate-700 transition-all hover:border-blue-500">
                                                                                    {isColorOption && (
                                                                                        <span
                                                                                            className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                                                                                            style={{ backgroundColor: isValidColor ? colorHex! : '#ccc' }}
                                                                                            title={val}
                                                                                        />
                                                                                    )}
                                                                                    {val}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const newOptions = [...formData.options];
                                                                                            newOptions[idx].values = newOptions[idx].values.filter(v => v !== val);
                                                                                            setFormData({ ...formData, options: newOptions });
                                                                                        }}
                                                                                        className="hover:text-red-400 ml-1 p-0.5 rounded-full hover:bg-slate-700"
                                                                                    >
                                                                                        <X size={12} />
                                                                                    </button>
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}

                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, options: [...formData.options, { name: '', values: [] }] })}
                                                            className="btn bg-slate-800 text-white w-full py-2 text-sm border border-slate-700 hover:bg-slate-700 dashed"
                                                        >
                                                            + Ajouter une autre option
                                                        </button>

                                                        {/* Variants Generation & List */}
                                                        <div className="border-t border-slate-800 pt-4 space-y-4">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="font-bold text-white">Aperçu des Variantes</h4>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        // Cartesian Product Generator
                                                                        const combinations = (options: ProductOption[], index = 0): string[] => {
                                                                            if (index === options.length) return [''];
                                                                            const rest = combinations(options, index + 1);
                                                                            const current = options[index].values;
                                                                            if (current.length === 0) return rest;

                                                                            const result: string[] = [];
                                                                            current.forEach(val => {
                                                                                rest.forEach(r => {
                                                                                    result.push(val + (r ? ' / ' + r : ''));
                                                                                });
                                                                            });
                                                                            return result;
                                                                        };

                                                                        const variantTitles = combinations(formData.options);
                                                                        const newVariants = variantTitles.map(title => {
                                                                            const existing = formData.variants.find(v => v.title === title);
                                                                            if (existing) return existing;
                                                                            return {
                                                                                title,
                                                                                price: formData.price,
                                                                                compareAtPrice: formData.compareAtPrice,
                                                                                costPerItem: formData.costPerItem,
                                                                                sku: formData.sku ? `${formData.sku}-${title.replace(/\s/g, '').replace(/\//g, '-')}`.toUpperCase() : '',
                                                                                barcode: '',
                                                                                stock: 0,
                                                                                trackQuantity: true,
                                                                                image: ''
                                                                            };
                                                                        });
                                                                        setFormData({ ...formData, variants: newVariants });
                                                                    }}
                                                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                                                >
                                                                    Actualiser les variantes
                                                                </button>
                                                            </div>

                                                            {/* Grouped Variants View */}
                                                            {formData.variants.length > 0 && (
                                                                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
                                                                    {Object.entries(
                                                                        formData.variants.reduce((acc, variant) => {
                                                                            const groupName = variant.title.split(' / ')[0]; // Group by first option value (e.g., Color)
                                                                            if (!acc[groupName]) acc[groupName] = [];
                                                                            acc[groupName].push(variant);
                                                                            return acc;
                                                                        }, {} as Record<string, ProductVariant[]>)
                                                                    ).map(([groupName, variants], groupIdx) => (
                                                                        <details key={groupIdx} className="group border-b border-slate-800 last:border-0" open>
                                                                            <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-900 hover:bg-slate-800 transition-colors select-none">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
                                                                                        {/* Show color swatch if valid */}
                                                                                        {formData.options[0]?.name.match(/couleur|color/i) ? (
                                                                                            <div
                                                                                                className="w-full h-full rounded"
                                                                                                style={{
                                                                                                    backgroundColor:
                                                                                                        PREDEFINED_COLORS[groupName] || groupName // Use predefined or raw value
                                                                                                }}
                                                                                            />
                                                                                        ) : (
                                                                                            <span className="text-xs font-bold text-slate-500">{variants.length}</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="font-bold text-white">{groupName}</span>
                                                                                        <span className="text-slate-500 text-sm ml-2">({variants.length} variantes)</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-4">
                                                                                    {/* Batch Edit Inputs (Optional, can be added here) */}
                                                                                    <ChevronDown className="text-slate-500 transition-transform group-open:rotate-180" size={20} />
                                                                                </div>
                                                                            </summary>

                                                                            <div className="p-3 bg-slate-950/30 border-b border-slate-800 flex items-center justify-end gap-3">
                                                                                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium mr-2">Modifier le groupe :</span>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs text-slate-400">Prix</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        placeholder="-"
                                                                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-24 text-xs text-white text-right focus:border-blue-500 outline-none placeholder:text-slate-600"
                                                                                        onChange={(e) => {
                                                                                            if (!e.target.value) return;
                                                                                            const price = Number(e.target.value);
                                                                                            const newVariants = [...formData.variants];
                                                                                            variants.forEach(v => {
                                                                                                const realIndex = newVariants.indexOf(v);
                                                                                                if (realIndex !== -1) newVariants[realIndex].price = price;
                                                                                            });
                                                                                            setFormData({ ...formData, variants: newVariants });
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs text-slate-400">Stock</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        placeholder="-"
                                                                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-20 text-xs text-white text-center focus:border-blue-500 outline-none placeholder:text-slate-600"
                                                                                        onChange={(e) => {
                                                                                            if (!e.target.value) return;
                                                                                            const stock = Number(e.target.value);
                                                                                            const newVariants = [...formData.variants];
                                                                                            variants.forEach(v => {
                                                                                                const realIndex = newVariants.indexOf(v);
                                                                                                if (realIndex !== -1) newVariants[realIndex].stock = stock;
                                                                                            });
                                                                                            setFormData({ ...formData, variants: newVariants });
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            <div className="p-0 bg-slate-950/50">
                                                                                <table className="w-full text-left text-sm text-slate-300">
                                                                                    <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-medium">
                                                                                        <tr>
                                                                                            <th className="p-3 w-16 pl-12">Variante</th> {/* Indented */}
                                                                                            <th className="p-3 w-28">Prix</th>
                                                                                            <th className="p-3 w-24">Stock</th>
                                                                                            <th className="p-3">SKU</th>
                                                                                            <th className="p-3 w-16">Image</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-slate-800/50">
                                                                                        {variants.map((variant, vIdx) => {
                                                                                            // Find true index in main variants array to update correct item
                                                                                            const realIndex = formData.variants.findIndex(v => v === variant);

                                                                                            return (
                                                                                                <tr key={vIdx} className="hover:bg-slate-900/50 transition-colors">
                                                                                                    <td className="p-3 pl-12 font-medium text-white">{variant.title.split(' / ').slice(1).join(' / ') || variant.title}</td>
                                                                                                    <td className="p-3">
                                                                                                        <div className="relative">
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                value={variant.price}
                                                                                                                onChange={e => {
                                                                                                                    const newVariants = [...formData.variants];
                                                                                                                    newVariants[realIndex].price = Number(e.target.value);
                                                                                                                    setFormData({ ...formData, variants: newVariants });
                                                                                                                }}
                                                                                                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full text-white text-right focus:border-blue-500 outline-none"
                                                                                                            />
                                                                                                            <span className="absolute right-7 top-1 text-slate-500 text-xs hidden">DZD</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        <input
                                                                                                            type="number"
                                                                                                            value={variant.stock}
                                                                                                            onChange={e => {
                                                                                                                const newVariants = [...formData.variants];
                                                                                                                newVariants[realIndex].stock = Number(e.target.value);
                                                                                                                setFormData({ ...formData, variants: newVariants });
                                                                                                            }}
                                                                                                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-full text-white text-center focus:border-blue-500 outline-none"
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        <input
                                                                                                            value={variant.sku}
                                                                                                            onChange={e => {
                                                                                                                const newVariants = [...formData.variants];
                                                                                                                newVariants[realIndex].sku = e.target.value;
                                                                                                                setFormData({ ...formData, variants: newVariants });
                                                                                                            }}
                                                                                                            className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 w-full text-xs text-slate-400 focus:text-white outline-none transition-colors"
                                                                                                        />
                                                                                                    </td>
                                                                                                    <td className="p-3">
                                                                                                        <div className="relative w-8 h-8 bg-slate-800 rounded border border-slate-700 hover:border-blue-500 cursor-pointer overflow-hidden group/img">
                                                                                                            {variant.image ? (
                                                                                                                <img src={getImageUrl(variant.image)} className="w-full h-full object-cover" />
                                                                                                            ) : (
                                                                                                                <ImageIcon className="text-slate-600 m-auto mt-2" size={14} />
                                                                                                            )}
                                                                                                            {formData.gallery.length > 0 && (
                                                                                                                <select
                                                                                                                    value={variant.image}
                                                                                                                    onChange={e => {
                                                                                                                        const newVariants = [...formData.variants];
                                                                                                                        newVariants[realIndex].image = e.target.value;
                                                                                                                        setFormData({ ...formData, variants: newVariants });
                                                                                                                    }}
                                                                                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                                                                                >
                                                                                                                    <option value="">Aucune</option>
                                                                                                                    {formData.gallery.map((img, i) => (
                                                                                                                        <option key={i} value={img}>Image {i + 1}</option>
                                                                                                                    ))}
                                                                                                                </select>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            );
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </details>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* OFFERS / MULTI-BUY CARD */}
                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-bold text-white">Offres Spéciales (Multi-Achat)</h3>
                                                    <span className="text-xs text-slate-500">Encouragez l'achat en volume</span>
                                                </div>

                                                <div className="space-y-3">
                                                    {formData.offers.map((offer, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                                                                    x{offer.quantity}
                                                                </div>
                                                                <div>
                                                                    <div className="text-white font-bold">{offer.price.toLocaleString()} DZD</div>
                                                                    {offer.label && <div className="text-xs text-slate-400">{offer.label}</div>}
                                                                </div>
                                                                {offer.isBestValue && (
                                                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase rounded-full">
                                                                        Best Value
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newOffers = formData.offers.filter((_, i) => i !== idx);
                                                                    setFormData({ ...formData, offers: newOffers });
                                                                }}
                                                                className="text-slate-500 hover:text-red-400 p-2"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {formData.offers.length === 0 && (
                                                        <p className="text-sm text-slate-500 italic text-center py-2">Aucune offre configurée.</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-12 gap-3 items-end pt-4 border-t border-slate-800">
                                                    <div className="col-span-2">
                                                        <label className="text-xs text-slate-400 block mb-1">Qté</label>
                                                        <input
                                                            type="number"
                                                            value={newOffer.quantity}
                                                            onChange={e => setNewOffer({ ...newOffer, quantity: Number(e.target.value) })}
                                                            className="input-field w-full text-center"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <label className="text-xs text-slate-400 block mb-1">Prix (DZD)</label>
                                                        <input
                                                            type="number"
                                                            value={newOffer.price}
                                                            onChange={e => setNewOffer({ ...newOffer, price: Number(e.target.value) })}
                                                            className="input-field w-full"
                                                        />
                                                    </div>
                                                    <div className="col-span-4">
                                                        <label className="text-xs text-slate-400 block mb-1">Label (ex: Pack Eco)</label>
                                                        <input
                                                            type="text"
                                                            value={newOffer.label}
                                                            onChange={e => setNewOffer({ ...newOffer, label: e.target.value })}
                                                            className="input-field w-full"
                                                            placeholder="Optionnel"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (newOffer.quantity > 1 && newOffer.price > 0) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        offers: [...formData.offers, newOffer].sort((a, b) => a.quantity - b.quantity)
                                                                    });
                                                                    setNewOffer({ quantity: newOffer.quantity + 1, price: 0, label: '', isBestValue: false });
                                                                }
                                                            }}
                                                            className="btn bg-blue-600 hover:bg-blue-500 text-white w-full py-2.5 text-sm font-bold flex justify-center items-center gap-1"
                                                        >
                                                            <Plus size={16} /> Ajouter
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={newOffer.isBestValue}
                                                        onChange={e => setNewOffer({ ...newOffer, isBestValue: e.target.checked })}
                                                        className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                                                    />
                                                    <label className="text-xs text-slate-400">Marquer comme "Meilleure Valeur"</label>
                                                </div>
                                            </div>

                                            {/* INVENTORY CARD */}
                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <h3 className="font-bold text-white mb-2">Inventaire</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label">SKU (Réf. Stock)</label>
                                                        <input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="input-field w-full" />
                                                    </div>
                                                    <div>
                                                        <label className="label">Code-barres (ISBN, UPC...)</label>
                                                        <input value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className="input-field w-full" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.trackQuantity}
                                                        onChange={e => setFormData({ ...formData, trackQuantity: e.target.checked })}
                                                        className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                                                    />
                                                    <label className="text-sm text-slate-300">Suivre la quantité</label>
                                                </div>
                                                {formData.trackQuantity && (
                                                    <div className="pt-2 border-t border-slate-800">
                                                        <label className="label">Quantité en stock</label>
                                                        <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="input-field w-full md:w-1/3" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* SHIPPING CARD */}
                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <h3 className="font-bold text-white mb-2">Expédition</h3>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="label">Poids</label>
                                                        <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })} className="input-field w-full" />
                                                    </div>
                                                    <div className="w-1/3">
                                                        <label className="label">Unité</label>
                                                        <select value={formData.weightUnit} onChange={e => setFormData({ ...formData, weightUnit: e.target.value })} className="input-field w-full">
                                                            <option value="kg">kg</option>
                                                            <option value="g">g</option>
                                                            <option value="lb">lb</option>
                                                            <option value="oz">oz</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sidebar (Right - 1/3) */}
                                        <div className="space-y-6">

                                            {/* Status Card */}
                                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                                                <h3 className="font-bold text-white text-sm uppercase">Statut du produit</h3>
                                                <select
                                                    value={formData.status}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        status: e.target.value,
                                                        active: e.target.value === 'active'
                                                    })}
                                                    className="input-field w-full"
                                                >
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
                                            <ErrorBoundary fallback={<textarea
                                                className="input-field w-full h-64 font-mono text-sm"
                                                value={formData.longDescription}
                                                onChange={e => setFormData({ ...formData, longDescription: e.target.value })}
                                            />}>
                                                <ReactQuill
                                                    theme="snow"
                                                    value={formData.longDescription}
                                                    onChange={(content: string) => setFormData({ ...formData, longDescription: content })}
                                                    className="bg-white text-black h-64 mb-12 rounded-lg overflow-hidden"
                                                    modules={{
                                                        toolbar: [
                                                            [{ 'header': [1, 2, 3, false] }],
                                                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                            ['link', 'image'],
                                                            ['clean']
                                                        ],
                                                    }}
                                                />
                                            </ErrorBoundary>
                                            <p className="text-xs text-slate-500 pt-2">Utilisez la barre d'outils pour mettre en forme votre texte (Titres, Listes, Images...).</p>
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
                </div >
            )}
        </div >
    );
};

export default Products;
