import { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, Menu, Search, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { type Product } from '../types';
import { getImageUrl } from '../utils';

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/products');
                setProducts(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">

            {/* HERO SECTION */}
            <section className="relative overflow-hidden pt-12 pb-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-12">
                    <div className="order-2 lg:order-1">
                        <span className="text-primary font-bold tracking-[0.2em] text-sm mb-4 block">NEW DROP: VENTUS X</span>
                        <h1 className="text-6xl md:text-8xl font-bold leading-none mb-6">ELEVATE<br />YOUR PACE.</h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-md">
                            Experience the next generation of athletic performance with the ultra-lightweight Ventus X. Engineered for speed, designed for the street.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-lg font-bold transition-all transform hover:scale-105">
                                SHOP NOW
                            </button>
                            <button className="border border-slate-200 dark:border-slate-800 hover:border-primary text-slate-900 dark:text-white px-10 py-4 rounded-lg font-bold transition-all">
                                LEARN MORE
                            </button>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 relative group">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl transform scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
                        <img
                            alt="Ventus X Sneaker"
                            className="relative z-10 w-full h-auto drop-shadow-2xl transform rotate-[-15deg] group-hover:rotate-0 transition-transform duration-700"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFqkIyjB1L4t7MNj3sLd7I-qz4KijY4zaNaQuc56i7B1VxtmBNvG_DeA2F-z6a_bvh8hzn2d513-qLaBbz5pt5gmfNj_f2VJEXBJDwbJ3T4Fxr6GkJ5WASAo0Mku6ymq_JkIr-Gd-Rpv9GfPlQbVoWSKsf_H2-aKuJXEkf-OZcikxKzlzhKOATlCGVgNKEsK9jYnJsfwy9_ms8iJRhi7vobE7ZnwPrSHpV9Cl9xdIJB5ynu-FSWT0UMvmKZWxAeAy008k279uU9V8L"
                        />
                    </div>
                </div>
            </section>

            {/* NEW ARRIVALS GRID */}
            <section className="py-24 bg-white dark:bg-background-dark/50" id="products">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-bold">NEW ARRIVALS</h2>
                            <div className="h-1 w-20 bg-primary mt-4"></div>
                        </div>
                        <Link to="/" className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">
                            VIEW ALL <ArrowRight size={20} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.slice(0, 4).map((product, index) => (
                                <Link to={`/product/${product._id}`} key={product._id} className="group block">
                                    <div className="relative aspect-square bg-background-light dark:bg-slate-900 rounded-xl overflow-hidden mb-4">
                                        <img
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            src={getImageUrl(product.image)}
                                        />
                                        <button className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            <ShoppingBag className="text-primary" size={20} />
                                        </button>
                                        {index === 0 && <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">TRENDING</span>}
                                        {index === 3 && <span className="absolute top-4 left-4 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">LIMITED</span>}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{product.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{product.category?.name || 'Performance Athletics'}</p>
                                    <p className="text-primary font-bold text-xl">{product.price.toLocaleString()} DA</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CURATED COLLECTIONS */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">CURATED COLLECTIONS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[700px]">
                        {/* Featured Large */}
                        <div className="md:col-span-8 relative group rounded-2xl overflow-hidden cursor-pointer">
                            <img
                                alt="Urban Explorer"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDasQh1p9lp7uwbqY4dnYdCY2MSTHSmTYyqCjUfgmPXJffQHOGFczi3ujPqulT33uU1VfshE224ZNMNmO860O439raMcw_Lpc2fxkCXYJQPPS3z7SYEJma11gl4NcYYsWaOAa2Hh1bOJZ3Sps2wGoFHYTxQrCsWLfTksbI54bEJ2ntZgf8EgrfVE9fbNWeUj0LoHm0_DJxoC5AEfPweEeriJsUcWJuiALPSO9TuhOCtyd41fVLhExgZVc0ZWGFja3l4Y3FYoTzeRT2M"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-10">
                                <p className="text-primary font-bold tracking-widest mb-2">ESSENTIALS</p>
                                <h3 className="text-4xl font-bold text-white mb-4">THE URBAN EXPLORER</h3>
                                <button className="text-white border-b-2 border-primary w-fit pb-1 font-bold flex items-center gap-2">DISCOVER <ArrowUpRight size={16} /></button>
                            </div>
                        </div>

                        {/* Two Stacked */}
                        <div className="md:col-span-4 grid grid-rows-2 gap-6">
                            <div className="relative group rounded-2xl overflow-hidden cursor-pointer">
                                <img
                                    alt="Performance Lab"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzJABNuN5Izh_m8qGxgnXurt1vjCG-CY1TQ6pjwcmg5Sa4mEXq-KANhYAj2CD9PPjMLgXXSTkKXU6qv3amGHW8dvp849c_88dctVfBdkCZhBZNaxuXHuR8T2IGKIa14jpMd672cWoqgq1Tn9-B4OI_9EZNgHUNaaVAg47zhb7wMU772p2iUANFMThF6sOKCCl4dyQWn0j3RnPLNrZOqc9Scz35jEa6qQckh-GjKGcGAStnMnfJYWWeGyOwzEby8OKBfO46-YFuKVoq"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <h3 className="text-2xl font-bold text-white">PERFORMANCE LAB</h3>
                                </div>
                            </div>
                            <div className="relative group rounded-2xl overflow-hidden cursor-pointer">
                                <img
                                    alt="Street Classics"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2neNz8bB9KoWlV_jcnRQ2YdlgOkik9eOvGIQEwlbS_WXGs5uMGqNrjqs1UYKWkAtQgWOTG_h7ag03jFoSYrT0rVJsi5uEIO7ULHr9OhZDMYz-bIZla_yELQe00Zte4LXr5HZLjADhiBSv47IUJ-e-1Fj7vHtP7dvGWERnVM4zkNA4yexJFK5-zDEH-CA7lCAaTXYpSLNhndLPADciGU9Zci72qzFh4dPpGjK6qhlQKZ7NmK_bGw9HNhTVra-xy4WzXIvxeWjDhPDn"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <h3 className="text-2xl font-bold text-white">STREET CLASSICS</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
