import { useEffect, useState } from 'react';
import api from '../api';
import 'quill/dist/quill.snow.css';

interface InfoPageProps {
    title: string;
    field: 'termsOfService' | 'privacyPolicy' | 'contactInfo' | 'aboutUs';
}

const InfoPage = ({ title, field }: InfoPageProps) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data && data[field]) {
                    setContent(data[field]);
                } else {
                    setContent('<p>Le contenu de cette page n\'a pas encore été défini par l\'administrateur.</p>');
                }
            } catch (error) {
                console.error(error);
                setContent('<p>Erreur lors du chargement de la page.</p>');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [field]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFAFA]">
                <div className="text-gray-500 font-light tracking-widest uppercase text-sm animate-pulse">Chargement en cours...</div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] bg-[#FAFAFA] pt-24 pb-16 font-sans">
            <div className="max-w-3xl mx-auto px-6 bg-white p-8 md:p-12 border border-gray-100 shadow-sm rounded-none">
                <h1 className="text-3xl md:text-4xl font-serif text-black mb-12 text-center uppercase tracking-widest">{title}</h1>

                <div className="ql-container ql-snow !border-none w-full !font-sans">
                    <div
                        className="ql-editor !p-0 text-gray-800 text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default InfoPage;
