import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Plus, ShieldCheck, Truck, RotateCcw, Facebook, AtSign, Camera } from 'lucide-react';

const Home = () => {
    return (
        <div className="font-display text-slate-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-12">
                    <div className="order-2 lg:order-1">
                        <span className="text-primary font-bold tracking-[0.2em] text-sm mb-4 block">NEW DROP: VENTUS X</span>
                        <h1 className="text-6xl md:text-8xl font-bold leading-none mb-6">ELEVATE<br />YOUR PACE.</h1>
                        <p className="text-lg text-slate-500 mb-10 max-w-md">Experience the next generation of athletic performance with the ultra-lightweight Ventus X. Engineered for speed, designed for the street.</p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-lg font-bold transition-all transform hover:scale-105">SHOP NOW</button>
                            <button className="border border-slate-200 hover:border-primary px-10 py-4 rounded-lg font-bold transition-all">LEARN MORE</button>
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

            {/* New Arrivals Product Grid */}
            <section className="py-24 bg-white" id="products">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-bold">NEW ARRIVALS</h2>
                            <div className="h-1 w-20 bg-primary mt-4"></div>
                        </div>
                        <Link to="/products" className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">
                            VIEW ALL <ArrowRight size={20} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Product 1 */}
                        <div className="group">
                            <div className="relative aspect-square bg-background-light rounded-xl overflow-hidden mb-4">
                                <img
                                    alt="Ignite Runner V2"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqRt2TA-8RFCtrcBv39Pwdklec3NWx7o5ruxR8zk5y98nZZ3xczxTz5dl0gTKiTaj7oEknnqFjkl1gxNPZR3gHeTZzxPTf9hckuBJj4tSHPN_olYseLTS6rF3AO8DsP1KTRfbD4Lbt91wzr8PqqLZzt3SeTO0J_PK5amHEC2pcpwtgdzzLj0NEm92wxrjlncbHcPcZilEmilqd_J1sExv64zgU0gh7b7t6yBREQJsn1pdlORs5lUX7KXodCoWAbN554Sw3xed2TeK-"
                                />
                                <button className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <ShoppingBag size={20} className="text-primary" />
                                </button>
                                <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">TRENDING</span>
                            </div>
                            <h3 className="font-bold text-lg">Ignite Runner V2</h3>
                            <p className="text-slate-500 text-sm mb-2">Performance Athletics</p>
                            <p className="text-primary font-bold text-xl">$145.00</p>
                        </div>
                        {/* Product 2 */}
                        <div className="group">
                            <div className="relative aspect-square bg-background-light rounded-xl overflow-hidden mb-4">
                                <img
                                    alt="Urban High-Top"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAEYFr-qK8h3U5HGve_jAPx4NcBebp70LNLMLIWuxNd3ni5VHqZFKwS3vkuzkec4ikW8GcJOd_wYcP4GyXTnbs0yAQxXYw7F4WcCj9Xrot00NpTls_AZkKqfmpr7U_q4ReHYSD9MB7vnAXr4N-qS96FoDpNNJB0nY5Lj2FMeGZnH_U1ypTDvnFLKBHyKx4p5ZWpcWFFq701jedUhWAseQTvf3Pnzg61Lrfap_PCmMyoPp9GPBYC8TKd7LFX02uNNDDqjles8accpiz"
                                />
                                <button className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <ShoppingBag size={20} className="text-primary" />
                                </button>
                            </div>
                            <h3 className="font-bold text-lg">Urban High-Top</h3>
                            <p className="text-slate-500 text-sm mb-2">Lifestyle Classics</p>
                            <p className="text-primary font-bold text-xl">$95.00</p>
                        </div>
                        {/* Product 3 */}
                        <div className="group">
                            <div className="relative aspect-square bg-background-light rounded-xl overflow-hidden mb-4">
                                <img
                                    alt="Neo-Matrix Hybrid"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC45eHNxwQ1urf2XIgKNRvhdA78GTY65HGfayuIAPApwVdFmIkgJf1gNBarP2VNzbOdgLKKSxISSDdZUiN2TCo9vEbJiIeMeRuzhCcDJ1MygkxtZ4zRBnZJ8teqpx8WgjzZc8nXshLGt17fX4WXBkI0GhAwxvfaFuX-UgfhldKBJuPxoSpiORnqah3lesd3DQH53NTAb6uq7PzJERu1UUTNjhtR10jTizxvOJ_s2d2-QqyrI3trsaTG3lWhMCYcdFLKO0KwUeTQtpKO"
                                />
                                <button className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <ShoppingBag size={20} className="text-primary" />
                                </button>
                            </div>
                            <h3 className="font-bold text-lg">Neo-Matrix Hybrid</h3>
                            <p className="text-slate-500 text-sm mb-2">Experimental Series</p>
                            <p className="text-primary font-bold text-xl">$180.00</p>
                        </div>
                        {/* Product 4 */}
                        <div className="group">
                            <div className="relative aspect-square bg-background-light rounded-xl overflow-hidden mb-4">
                                <img
                                    alt="Dark Matter Elite"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuANAcLWXLANzrK88OS0MNfNky9vc2mum3KfsovEeBgaWZwSXO4OIWhDkmoyy3P37Q_uxpm9iLu2FzfZQOSwcSZHJYRmLg5AxWLlIzp8oHqk4NpX5Sv3upk5wifhlRQaHcX8v8bvKRYDt3dyt4RQloHbD_kgiXvqLLET8Utp3IIKZQJfk-QZadVLkBZexGd2t6MuNocA9V1XjeOZeALME-Abf5Ycu1RGJLHaPk5t3D2Fyd7bEtKF5MfbS2z2ZCo9d216xpY0G0rv2vKd"
                                />
                                <button className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <ShoppingBag size={20} className="text-primary" />
                                </button>
                                <span className="absolute top-4 left-4 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">LIMITED</span>
                            </div>
                            <h3 className="font-bold text-lg">Dark Matter Elite</h3>
                            <p className="text-slate-500 text-sm mb-2">Night Running</p>
                            <p className="text-primary font-bold text-xl">$210.00</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Curated Collections */}
            <section className="py-24" id="collections">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-12 text-center">CURATED COLLECTIONS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[700px]">
                        <div className="md:col-span-8 relative group rounded-2xl overflow-hidden cursor-pointer">
                            <img
                                alt="Urban Explorer"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDasQh1p9lp7uwbqY4dnYdCY2MSTHSmTYyqCjUfgmPXJffQHOGFczi3ujPqulT33uU1VfshE224ZNMNmO860O439raMcw_Lpc2fxkCXYJQPPS3z7SYEJma11gl4NcYYsWaOAa2Hh1bOJZ3Sps2wGoFHYTxQrCsWLfTksbI54bEJ2ntZgf8EgrfVE9fbNWeUj0LoHm0_DJxoC5AEfPweEeriJsUcWJuiALPSO9TuhOCtyd41fVLhExgZVc0ZWGFja3l4Y3FYoTzeRT2M"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-10">
                                <p className="text-primary font-bold tracking-widest mb-2">ESSENTIALS</p>
                                <h3 className="text-4xl font-bold text-white mb-4">THE URBAN EXPLORER</h3>
                                <button className="text-white border-b-2 border-primary w-fit pb-1 font-bold">DISCOVER</button>
                            </div>
                        </div>
                        <div className="md:col-span-4 grid grid-rows-2 gap-6">
                            <div className="relative group rounded-2xl overflow-hidden cursor-pointer">
                                <img
                                    alt="Performance Lab"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzJABNuN5Izh_m8qGxgnXurt1vjCG-CY1TQ6pjwcmg5Sa4mEXq-KANhYAj2CD9PPjMLgXXSTkKXU6qv3amGHW8dvp849c_88dctVfBdkCZhBZNaxuXHuR8T2IGKIa14jpMd672cWoqgq1Tn9-B4OI_9EZNgHUNaaVAg47zhb7wMU772p2iUANFMThF6sOKCCl4dyQWn0j3RnPLNrZOqc9Scz35jEa6qQckh-GjKGcGAStqMnfJYWWeGyOwzEby8OKBfO46-YFuKVoq"
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
