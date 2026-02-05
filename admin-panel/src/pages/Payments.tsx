import { useEffect, useState } from 'react';
import { ToggleLeft, ToggleRight, Edit2 } from 'lucide-react';
import api from '../api';

const Payments = () => {
    const [methods, setMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);

    const fetchMethods = async () => {
        try {
            const { data } = await api.get('/payment-methods/all');
            setMethods(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/payment-methods/${id}`, { isActive: !currentStatus });
            fetchMethods();
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/payment-methods/${editing._id}`, editing);
            setEditing(null);
            fetchMethods();
        } catch (error) {
            alert('Erreur de sauvegarde');
        }
    };

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white mb-2">Modes de Paiement</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {methods.map((method) => (
                    <div key={method._id} className={`bg-slate-900 border ${method.isActive ? 'border-emerald-500/50' : 'border-slate-800'} rounded-xl p-6 relative overflow-hidden transition-all hover:shadow-lg`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-white flex items-center gap-2">
                                    {method.name}
                                    {method.isActive ?
                                        <span className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded font-bold">ACTIF</span> :
                                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">INACTIF</span>
                                    }
                                </h3>
                                <p className="text-sm text-slate-400 font-mono">{method.slug}</p>
                            </div>
                            <button onClick={() => toggleActive(method._id, method.isActive)} className={method.isActive ? "text-emerald-400" : "text-slate-600"}>
                                {method.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                            </button>
                        </div>

                        <div className="space-y-2 bg-slate-950 p-4 rounded-lg text-sm text-slate-300">
                            <p><span className="text-slate-500 block text-xs uppercase">Label:</span> {method.accountLabel}</p>
                            <p><span className="text-slate-500 block text-xs uppercase">Valeur/Numéro:</span> <span className="font-mono text-white">{method.accountValue}</span></p>
                            <p><span className="text-slate-500 block text-xs uppercase">Instructions:</span> {method.extraInfo}</p>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setEditing(method)} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                                <Edit2 size={16} /> Modifier les infos
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold text-white mb-6">Modifier {editing.name}</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Label du Compte (ex: CCP, Address)</label>
                                <input
                                    value={editing.accountLabel}
                                    onChange={(e) => setEditing({ ...editing, accountLabel: e.target.value })}
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Valeur / Numéro</label>
                                <input
                                    value={editing.accountValue}
                                    onChange={(e) => setEditing({ ...editing, accountValue: e.target.value })}
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Instructions supplémentaires</label>
                                <textarea
                                    value={editing.extraInfo}
                                    onChange={(e) => setEditing({ ...editing, extraInfo: e.target.value })}
                                    className="input-field w-full h-24"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditing(null)} className="flex-1 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">Annuler</button>
                                <button type="submit" className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700">Sauvegarder</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
