import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import api from '../api';

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
        setSettings({ ...settings, [e.target.name]: e.target.value });
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
