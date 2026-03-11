import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
    const [brands, setBrands] = useState<{ id: string, name: string, logoUrl: string }[]>([]); // Updated type to include id
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFamilies = async () => {
            try {
                const { data } = await api.get('/families');
                if (data && Array.isArray(data)) {
                    // Filter families that are marked to show in home bar and have an image
                    const visibleFamilies = data.filter((family: any) => family.showInHomeBar && family.image);
                    const formattedBrands = visibleFamilies.map((family: any) => ({
                        id: family._id, // Added id field
                        name: family.name,
                        logoUrl: family.image
                    }));
                    setBrands(formattedBrands);
                }
            } catch (error) {
                console.error("Failed to fetch families for brands section", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFamilies();
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
                    className="relative flex overflow-hidden group py-4 w-full"
                >
                    {/* Gradient Fade Masks */}
                    <div className="absolute left-0 top-0 w-16 md:w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 w-16 md:w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                    {/* Infinite Marquee Loop (duplicated for seamless scrolling) */}
                    {[1, 2].map((stripIdx) => (
                        <div
                            key={stripIdx}
                            className="flex items-center gap-6 md:gap-10 animate-marquee shrink-0 px-3 md:px-5 group-hover:[animation-play-state:paused]"
                            aria-hidden={stripIdx === 2 ? "true" : undefined}
                        >
                            {brands.map((brand, index) => (
                                <motion.div
                                    key={`${stripIdx}-${index}`}
                                    variants={itemVariants}
                                    className="group/brand flex flex-col items-center justify-center shrink-0"
                                >
                                    <Link
                                        to={`/products?family=${brand.id}`} // Link added here
                                        className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center p-4 md:p-6 shadow-sm border border-gray-100 transform group-hover/brand:-translate-y-2 group-hover/brand:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500"
                                        title={brand.name}
                                    >
                                        <img
                                            src={getImageUrl(brand.logoUrl)}
                                            alt={brand.name}
                                            className="w-full h-full object-contain transition-all duration-500"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </Link>
                                    <span className="mt-4 text-xs font-medium text-gray-400 opacity-0 group-hover/brand:opacity-100 transform translate-y-2 group-hover/brand:translate-y-0 transition-all duration-300">
                                        {brand.name}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
