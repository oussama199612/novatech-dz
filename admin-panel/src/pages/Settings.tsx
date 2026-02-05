import { useEffect, useState } from 'react';
import api from '../api';

const Settings = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6 text-slate-300">
                {settings ? (
                    <pre>{JSON.stringify(settings, null, 2)}</pre>
                ) : (
                    <p>Aucun paramètre configuré.</p>
                )}
            </div>
        </div>
    );
};

export default Settings;
