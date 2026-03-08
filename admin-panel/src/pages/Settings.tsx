import { useEffect, useState } from 'react';
import { Save, Upload, X } from 'lucide-react';
import api from '../api';
import RichTextEditor from '../components/RichTextEditor';

const Settings = () => {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data || {});
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, checked, value } = e.target;
        setSettings((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('image', file);
        try {
            const res = await api.post('/upload', data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setSettings({ ...settings, logoUrl: res.data });
        } catch (error: any) {
            alert('Erreur upload: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', settings);
            alert('Paramètres sauvegardés !');
        } catch (error) {
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Paramètres de la Boutique</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">

                {/* General Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400 border-b border-slate-800 pb-2">Informations Générales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Nom de la boutique</label>
                            <input name="shopName" value={settings.shopName || ''} onChange={handleChange} className="input-field w-full" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Devise (Suffixe)</label>
                            <input name="currency" value={settings.currency || ''} onChange={handleChange} className="input-field w-full" />
                        </div>
                    </div>
                </div>

                {/* General Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400 border-b border-slate-800 pb-2">Logo de la Marque</h3>
                    <div className="flex items-center gap-6">
                        <div className="w-32 h-32 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center relative overflow-hidden group">
                            {settings.logoUrl ? (
                                <>
                                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.logoUrl}`} alt="Logo" className="w-full h-full object-contain p-2" />
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, logoUrl: '' })}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center text-slate-500 flex flex-col items-center">
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-xs">Uploader</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                title="Changer le logo"
                            />
                        </div>
                        <div className="text-sm text-slate-400 space-y-1">
                            <p>Importez le logo officiel (PNG transparent recommandé).</p>
                            <p>Taille optimale: <strong className="text-white">500x200px</strong></p>
                        </div>
                    </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400 border-b border-slate-800 pb-2">Fonctionnalités & Modules</h3>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableMultiStore"
                                checked={settings.enableMultiStore || false}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                            />
                            <div>
                                <div className="text-white font-medium text-lg">Activer la Gestion Multi-Magasins</div>
                                <div className="text-sm text-slate-400 mt-1">
                                    Affiche l'onglet "Magasins", permet d'affecter du stock par localité et offre le choix de retrait en point de vente aux clients. <br />
                                    <strong>Si désactivé</strong>, le site bascule sur une simple gestion de "Stock Global".
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400 border-b border-slate-800 pb-2">Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email Contact</label>
                            <input name="contactEmail" value={settings.contactEmail || ''} onChange={handleChange} className="input-field w-full" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Téléphone</label>
                            <input name="contactPhone" value={settings.contactPhone || ''} onChange={handleChange} className="input-field w-full" />
                        </div>
                    </div>
                </div>

                {/* Socials */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400 border-b border-slate-800 pb-2">Réseaux Sociaux & Liens</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Instagram URL</label>
                            <input name="instagramUrl" value={settings.instagramUrl || ''} onChange={handleChange} className="input-field w-full" placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">WhatsApp URL (ex: https://wa.me/...)</label>
                            <input name="whatsappUrl" value={settings.whatsappUrl || ''} onChange={handleChange} className="input-field w-full" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Telegram URL</label>
                            <input name="telegramUrl" value={settings.telegramUrl || ''} onChange={handleChange} className="input-field w-full" />
                        </div>
                    </div>
                </div>

                {/* Information Pages */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-400 border-b border-slate-800 pb-2">Pages d'Information (Mentions Légales, etc.)</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Description du service (À Propos)</label>
                            <RichTextEditor
                                value={settings.aboutUs || ''}
                                onChange={(content) => setSettings((prev: any) => ({ ...prev, aboutUs: content }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Contact Info (Page dédiée)</label>
                            <RichTextEditor
                                value={settings.contactInfo || ''}
                                onChange={(content) => setSettings((prev: any) => ({ ...prev, contactInfo: content }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Conditions Générales de Vente & d'Utilisation (Terms of Service)</label>
                            <RichTextEditor
                                value={settings.termsOfService || ''}
                                onChange={(content) => setSettings((prev: any) => ({ ...prev, termsOfService: content }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Politique de Confidentialité (Privacy Policy)</label>
                            <RichTextEditor
                                value={settings.privacyPolicy || ''}
                                onChange={(content) => setSettings((prev: any) => ({ ...prev, privacyPolicy: content }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                    <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
                        <Save size={20} />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
