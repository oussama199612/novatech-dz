import { motion } from 'framer-motion';
import { Truck, Star, ShieldCheck, HeadphonesIcon } from 'lucide-react';

const features = [
    {
        icon: Truck,
        title: "Livraison rapide",
        description: "Expédition internationale dans les meilleurs délais avec suivi en temps réel."
    },
    {
        icon: Star,
        title: "Qualité premium",
        description: "Des matériaux d'exception pour un confort absolu et une durabilité maximale."
    },
    {
        icon: ShieldCheck,
        title: "Paiement sécurisé",
        description: "Transactions cryptées et 100% sécurisées avec notre partenaire financier."
    },
    {
        icon: HeadphonesIcon,
        title: "Support client",
        description: "Notre équipe est à votre disposition 7j/7 pour répondre à toutes vos questions."
    }
];

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
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" as const }
    }
};

const FeaturesSection = () => {
    return (
        <section className="py-20 bg-[#FAFAFA] border-b border-gray-100 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-white/50 blur-[100px] rounded-[100%] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-100 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1"
                            >
                                {/* Icon Container with Neon/Glow Effect on Hover */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-black/5 rounded-full blur-md transform scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                    <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-500 shadow-md">
                                        <Icon size={24} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <h3 className="text-lg font-serif text-gray-900 mb-3 tracking-wide">{feature.title}</h3>
                                <p className="text-sm font-light text-gray-500 leading-relaxed max-w-[260px]">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesSection;
