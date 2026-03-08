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
        <section className="py-12 bg-white border-b border-gray-100 overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gray-50 blur-[100px] rounded-[100%] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-xs font-semibold tracking-[0.25em] text-gray-400 uppercase mb-16"
                >
                    Nos Partenaires
                </motion.h2>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="flex flex-wrap justify-center items-center gap-10 md:gap-16"
                >
                    {brands.map((brand, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group flex flex-col items-center justify-center cursor-default"
                        >
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center p-4 md:p-6 shadow-sm border border-gray-100 transform group-hover:-translate-y-2 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
                                <img
                                    src={getImageUrl(brand.logoUrl)}
                                    alt={brand.name}
                                    title={brand.name}
                                    className="w-full h-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                />
                            </div>
                            <span className="mt-4 text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                {brand.name}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
