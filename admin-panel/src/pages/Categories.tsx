import { useEffect, useState } from 'react';
import api from '../api';

const Categories = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchCategories();
    }, []);

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">Catégories</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6 text-slate-300">
                {categories.length === 0 ? (
                    <p>Aucune catégorie trouvée.</p>
                ) : (
                    <ul>
                        {categories.map((cat) => (
                            <li key={cat._id} className="mb-2">{cat.name}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Categories;
