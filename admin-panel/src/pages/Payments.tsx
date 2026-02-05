import { useEffect, useState } from 'react';
import api from '../api';

const Payments = () => {
    const [methods, setMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMethods = async () => {
            try {
                const { data } = await api.get('/payment-methods');
                setMethods(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMethods();
    }, []);

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">Modes de Paiement</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6 text-slate-300">
                {methods.length === 0 ? (
                    <p>Aucun mode de paiement configuré.</p>
                ) : (
                    <ul>
                        {methods.map((method) => (
                            <li key={method._id} className="mb-2">{method.name} ({method.slug})</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Payments;
