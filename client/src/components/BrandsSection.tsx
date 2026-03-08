import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { getImageUrl } from '../utils';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 15 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" as const }
    }
};

export default function BrandsSection() {
    const [brands, setBrands] = useState<{ name: string, logoUrl: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data && data.brands) {
                    setBrands(data.brands);
                }
            } catch (error) {
                console.error("Failed to fetch brands", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    if (loading || brands.length === 0) return null;

    return (
        <section className="py-24 bg-white border-b border-gray-100 overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gray-50 blur-[100px] rounded-[100%] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-xs font-semibold tracking-[0.25em] text-gray-400 uppercase mb-16"
                >
                    Nos Partenaires de Confiance
                </motion.h2>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="flex flex-wrap justify-center items-center gap-16 md:gap-24"
                >
                    {brands.map((brand, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group flex flex-col items-center justify-center grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-700 cursor-default"
                        >
                            <img
                                src={getImageUrl(brand.logoUrl)}
                                alt={brand.name}
                                title={brand.name}
                                className="h-16 md:h-20 w-auto object-contain transform group-hover:scale-110 drop-shadow-sm transition-transform duration-700"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
