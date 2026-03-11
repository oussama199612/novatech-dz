import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Filter, X } from 'lucide-react';
import api from '../api';
import { getImageUrl } from '../utils';
import { type Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Catalogue = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [fetchedCategories, setFetchedCategories] = useState<{ _id: string; title?: string; name: string; image?: string; parentCategory?: { _id: string } }[]>([]);
    const [fetchedFamilies, setFetchedFamilies] = useState<{ _id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters State initialized from URL
    const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get('cat')?.split(',').filter(Boolean) || []);
    const [selectedVendors, setSelectedVendors] = useState<string[]>(searchParams.get('vendor')?.split(',').filter(Boolean) || []);
    const [selectedFamilies, setSelectedFamilies] = useState<string[]>(searchParams.get('family')?.split(',').filter(Boolean) || []);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get('minP')) || 0,
        Number(searchParams.get('maxP')) || 1000000
    ]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>(searchParams.get('size')?.split(',').filter(Boolean) || []);
    const [selectedColors, setSelectedColors] = useState<string[]>(searchParams.get('color')?.split(',').filter(Boolean) || []);
    const [inStockOnly, setInStockOnly] = useState(searchParams.get('stock') === 'true');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    // URL Sync Effect
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCategories.length) params.set('cat', selectedCategories.join(','));
        if (selectedVendors.length) params.set('vendor', selectedVendors.join(','));
        if (selectedFamilies.length) params.set('family', selectedFamilies.join(','));
        if (priceRange[0] > 0) params.set('minP', priceRange[0].toString());
        if (priceRange[1] < 1000000) params.set('maxP', priceRange[1].toString());
        if (selectedSizes.length) params.set('size', selectedSizes.join(','));
        if (selectedColors.length) params.set('color', selectedColors.join(','));
        if (inStockOnly) params.set('stock', 'true');
        if (sortBy !== 'newest') params.set('sort', sortBy);
        if (searchQuery.trim() !== '') params.set('search', searchQuery.trim());

        setSearchParams(params, { replace: true });
    }, [selectedCategories, selectedVendors, selectedFamilies, priceRange, selectedSizes, selectedColors, inStockOnly, sortBy, searchQuery, setSearchParams]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [productsRes, categoriesRes, familiesRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories'),
                    api.get('/families')
                ]);
                setProducts(productsRes.data);
                setFetchedCategories(categoriesRes.data);
                setFetchedFamilies(familiesRes.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Organized categories
    const parentCategories = useMemo(() => fetchedCategories.filter(cat => !cat.parentCategory), [fetchedCategories]);
    const allVendors = useMemo(() => Array.from(new Set(products.map(p => p.vendor).filter((v): v is string => !!v))), [products]);

    // Use fetched families directly so that families with 0 products still show up
    const allFamilies = fetchedFamilies;

    // Extract sizes and colors from variants/options
    const allSizes = useMemo(() => Array.from(new Set(products.flatMap(p =>
        p.options?.find(o =>
            ['taille', 'size', 'pointure'].some(keyword => o.name?.toLowerCase().includes(keyword))
        )?.values?.filter(v => v !== null && v !== undefined) || []
    ))).sort((a, b) => Number(a) - Number(b)), [products]);

    const allColors = useMemo(() => Array.from(new Set(products.flatMap(p =>
        p.options?.find(o => o.name?.toLowerCase().includes('couleur') || o.name?.toLowerCase().includes('color') || o.name?.toLowerCase().includes('coloris'))?.values?.filter(v => v !== null && v !== undefined) || []
    ))), [products]);

    // Filter Logic
    const filteredProducts = useMemo(() => products.filter(product => {
        // Search
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const matchName = product.name?.toLowerCase().includes(query);
            const matchDesc = product.description?.toLowerCase().includes(query);
            if (!matchName && !matchDesc) {
                return false;
            }
        }

        // Category
        if (selectedCategories.length > 0 && (!product.category || !selectedCategories.includes(product.category.name))) {
            return false;
        }
        // Vendor (Marque Libre)
        if (selectedVendors.length > 0 && (!product.vendor || !selectedVendors.includes(product.vendor))) {
            return false;
        }
        // Family (Marque Partenaire)
        if (selectedFamilies.length > 0) {
            if (!product.family || !product.family._id || !selectedFamilies.includes(product.family._id)) {
                return false;
            }
        }
        // Price
        if (product.price < priceRange[0] || product.price > priceRange[1]) {
            return false;
        }
        // In Stock
        if (inStockOnly) {
            const hasStock = product.stock > 0 || (product.variants?.some(v => v.stock > 0));
            if (!hasStock) return false;
        }

        // Strict Variant Availability Check
        // If sorting by Size or Color, we must check if a valid variant exists with stock > 0
        if (selectedSizes.length > 0 || selectedColors.length > 0) {
            if (!product.hasVariants || !product.variants) {
                // Determine if product matches via simple options if no variants defined (fallback)
                // But user asked for stock check, which implies variants. 
                // We'll keep simple check for non-variant products but strictly speaking they might not track stock correctly without variants.
                // Assuming "simple" products have top-level stock.
                if (!product.hasVariants) return product.stock > 0;
            }

            // Find valid variant matching ALL selected filter groups
            const hasValidVariant = product.variants?.some(variant => {
                const parts = variant.title ? variant.title.split(' / ') : [];
                let matchesSize = true;
                let matchesColor = true;

                // Check Size
                if (selectedSizes.length > 0) {
                    const sizeIndex = product.options?.findIndex(o => ['taille', 'size', 'pointure'].some(k => o.name?.toLowerCase().includes(k))) ?? -1;
                    if (sizeIndex !== -1 && parts[sizeIndex]) {
                        matchesSize = selectedSizes.some(s => String(s).trim() === String(parts[sizeIndex]).trim());
                    } else {
                        matchesSize = false;
                    }
                }

                // Check Color
                if (selectedColors.length > 0) {
                    const colorIndex = product.options?.findIndex(o => ['couleur', 'color', 'coloris'].some(k => o.name?.toLowerCase().includes(k))) ?? -1;
                    if (colorIndex !== -1 && parts[colorIndex]) {
                        matchesColor = selectedColors.some(c => String(c).trim() === String(parts[colorIndex]).trim());
                    } else {
                        matchesColor = false;
                    }
                }

                return matchesSize && matchesColor && (variant.stock > 0);
            });

            return hasValidVariant;
        }

        return true;
    }), [
        products, searchQuery, selectedCategories, selectedVendors,
        selectedFamilies, priceRange, inStockOnly, selectedSizes, selectedColors
    ]);

    // Sort Logic
    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            // if (sortBy === 'popular') return b.sales - a.sales; // Assuming sales field exists, else ignore
            return 0; // 'newest' is default from API usually
        });
    }, [filteredProducts, sortBy]);

    const toggleFilter = useCallback((item: string, setFn: React.Dispatch<React.SetStateAction<string[]>>) => {
        setFn(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }, []);

    return (
        <div className="bg-[#FAFAFA] font-sans text-gray-900 min-h-screen">

            {/* Header / Breadcrumbs */}
            <header className="pt-12 pb-8 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 tracking-widest uppercase">
                        <Link to="/" className="hover:text-black transition-colors">Accueil</Link>
                        <ChevronRight size={12} />
                        <span className="text-black font-medium">Catalogue</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-serif">TOUS LES PRODUITS</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                className="lg:hidden flex items-center gap-2 text-sm font-medium border border-gray-200 px-4 py-2"
                                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                            >
                                <Filter size={18} /> FILTERS
                            </button>
                            <span className="hidden md:inline text-sm font-light text-gray-500">TRIER PAR :</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-black"
                            >
                                <option value="newest">Nouveautés</option>
                                <option value="price-low">Prix Croissant</option>
                                <option value="price-high">Prix Décroissant</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar / Filters */}
                    <aside className={`
                        fixed inset-0 z-50 bg-white p-6 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto lg:p-0 lg:w-64 lg:overflow-visible lg:bg-transparent lg:border-none lg:shadow-none
                        ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="flex justify-between items-center mb-8 lg:hidden">
                            <h2 className="text-xl font-bold">FILTERS</h2>
                            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2">
                                <X size={24} />
                            </button>
                        </div>

                        <div>
                            <h3 className="font-serif text-sm tracking-widest mb-6 uppercase text-gray-900 border-b border-gray-100 pb-2">Catégorie</h3>
                            <div className="space-y-4">
                                {parentCategories.map(parentCat => {
                                    const subCats = fetchedCategories.filter(c => c.parentCategory?._id === parentCat._id);
                                    return (
                                        <div key={parentCat._id} className="space-y-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(parentCat.name)}
                                                    onChange={() => toggleFilter(parentCat.name, setSelectedCategories)}
                                                    className="w-4 h-4 rounded-none border-gray-300 text-black focus:ring-black transition-colors"
                                                />
                                                <span className="text-sm font-medium text-gray-800 group-hover:text-black transition-colors">{parentCat.name}</span>
                                            </label>
                                            {subCats.length > 0 && (
                                                <div className="pl-7 space-y-2">
                                                    {subCats.map(subCat => (
                                                        <label key={subCat._id} className="flex items-center gap-3 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.includes(subCat.name)}
                                                                onChange={() => toggleFilter(subCat.name, setSelectedCategories)}
                                                                className="w-3 h-3 rounded-none border-gray-300 text-black focus:ring-black transition-colors"
                                                            />
                                                            <span className="text-sm text-gray-500 font-light group-hover:text-black transition-colors">{subCat.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Families / Marques Partenaires */}
                        {allFamilies.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-serif text-sm tracking-widest mb-6 uppercase text-gray-900 border-b border-gray-100 pb-2">Marque Partenaire</h3>
                                <div className="space-y-3">
                                    {allFamilies.map(family => (
                                        <label key={family._id} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedFamilies.includes(family._id)}
                                                onChange={() => toggleFilter(family._id, setSelectedFamilies)}
                                                className="w-4 h-4 rounded-none border-gray-300 text-black focus:ring-black transition-colors"
                                            />
                                            <span className="text-sm font-light text-gray-600 group-hover:text-black transition-colors">{family.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vendors (Marque Libre) */}
                        {allVendors.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-serif text-sm tracking-widest mb-6 uppercase text-gray-900 border-b border-gray-100 pb-2">Vendeur</h3>
                                <div className="space-y-3">
                                    {allVendors.map(vendor => (
                                        <label key={vendor} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedVendors.includes(vendor)}
                                                onChange={() => toggleFilter(vendor, setSelectedVendors)}
                                                className="w-4 h-4 rounded-none border-gray-300 text-black focus:ring-black transition-colors"
                                            />
                                            <span className="text-sm font-light text-gray-600 group-hover:text-black transition-colors">{vendor}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* In Stock Only */}
                        <div className="mt-8 mb-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => setInStockOnly(e.target.checked)}
                                    className="w-4 h-4 rounded-none border-gray-300 text-black focus:ring-black transition-colors"
                                />
                                <span className="font-medium text-sm tracking-widest uppercase text-gray-800 group-hover:text-black transition-colors">
                                    En Stock Uniquement
                                </span>
                            </label>
                        </div>

                        {/* Price Range */}
                        <div className="mt-10">
                            <h3 className="font-serif text-sm tracking-widest mb-6 uppercase text-gray-900 border-b border-gray-100 pb-2">Prix Max</h3>
                            <div className="px-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="1000000"
                                    step="500"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                    className="w-full h-1 bg-gray-200 accent-black rounded-none appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between mt-4 text-xs font-medium text-gray-500">
                                    <span>{priceRange[0]} DA</span>
                                    <span>{priceRange[1].toLocaleString()} DA</span>
                                </div>
                            </div>
                        </div>

                        {/* Size (US) */}
                        {allSizes.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-serif text-sm tracking-widest mb-6 uppercase text-gray-900 border-b border-gray-100 pb-2">Pointure / Taille</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {allSizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => toggleFilter(size, setSelectedSizes)}
                                            className={`aspect-square flex items-center justify-center border text-xs font-medium transition-colors ${selectedSizes.includes(size)
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Colors */}
                        {allColors.length > 0 && (
                            <div className="mt-8 mb-10">
                                <h3 className="font-serif text-sm tracking-widest mb-6 uppercase text-gray-900 border-b border-gray-100 pb-2">Couleurs</h3>
                                <div className="flex flex-wrap gap-3">
                                    {allColors.map(color => {
                                        const PREDEFINED_COLORS: Record<string, string> = {
                                            'Noir': '#000000', 'Blanc': '#FFFFFF', 'Rouge': '#FF0000', 'Bleu': '#0000FF',
                                            'Vert': '#008000', 'Jaune': '#FFFF00', 'Orange': '#FFA500', 'Violet': '#800080',
                                            'Rose': '#FFC0CB', 'Gris': '#808080', 'Marron': '#A52A2A', 'Beige': '#F5F5DC',
                                            'Marine': '#000080', 'Kaki': '#F0E68C', 'Bordeaux': '#800000', 'Turquoise': '#40E0D0'
                                        };
                                        const bg = PREDEFINED_COLORS[color] || color;
                                        const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(bg);

                                        return (
                                            <button
                                                key={color}
                                                onClick={() => toggleFilter(color, setSelectedColors)}
                                                className={`w-8 h-8 rounded-none border ring-offset-2 transition-all ${selectedColors.includes(color) ? 'ring-1 ring-black border-black' : 'border-gray-200'
                                                    }`}
                                                style={{ backgroundColor: isValidHex ? bg : '#eee' }}
                                                title={color}
                                            >
                                                {!isValidHex && <span className="text-[10px] flex items-center justify-center h-full w-full">{color.charAt(0)}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setSelectedCategories([]);
                                setSelectedVendors([]);
                                setInStockOnly(false);
                                setPriceRange([0, 1000000]);
                                setSelectedSizes([]);
                                setSelectedColors([]);
                            }}
                            className="w-full py-3 bg-black text-white text-xs font-medium tracking-widest uppercase rounded-none hover:bg-gray-800 transition-colors"
                        >
                            Réinitialiser
                        </button>

                        {/* Mobile: Apply Button */}
                        <div className="lg:hidden mt-4">
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="w-full py-3 border border-gray-900 text-gray-900 text-xs font-medium tracking-widest uppercase rounded-none hover:bg-gray-50 transition-colors"
                            >
                                Appliquer les filtres
                            </button>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Search Filter Pill */}
                        {searchQuery && (
                            <div className="mb-6 flex gap-2 items-center text-sm font-medium tracking-widest uppercase">
                                <span className="text-gray-500">Recherche:</span>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="flex items-center gap-2 bg-black text-white px-3 py-1.5 hover:bg-gray-800 transition-colors"
                                >
                                    "{searchQuery}" <X size={14} />
                                </button>
                            </div>
                        )}
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-12 animate-pulse">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-[4/5] bg-gray-200 mb-4"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <motion.div
                                    layout
                                    className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-12"
                                >
                                    <AnimatePresence mode="popLayout">
                                        {sortedProducts.map((product) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                key={product._id}
                                                className="group"
                                            >
                                                <div
                                                    className="relative aspect-[4/5] bg-white overflow-hidden mb-5 border border-gray-100 cursor-pointer"
                                                    onClick={() => navigate(`/product/${product._id}`)}
                                                >
                                                    <img
                                                        alt={product.name || ''}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        src={getImageUrl(product.image || '')}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                    <div className="absolute inset-0 bg-black/opacity-0 group-hover:bg-black/5 transition-colors duration-500"></div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/product/${product._id}`);
                                                        }}
                                                        className="absolute bottom-4 left-4 right-4 bg-white text-black py-3 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10 hover:bg-black hover:text-white flex items-center justify-center gap-2"
                                                    >
                                                        <ShoppingBag size={16} /> Aperçu
                                                    </button>

                                                    {product.stock === 0 && (
                                                        <span className="absolute top-4 left-4 bg-white/90 text-red-600 text-[10px] font-medium tracking-widest px-2 py-1 z-20 uppercase border border-red-100">Rupture</span>
                                                    )}
                                                    {product.stock <= 5 && product.stock > 0 && (
                                                        <span className="absolute top-4 left-4 bg-white/90 text-orange-600 text-[10px] font-medium tracking-widest px-2 py-1 z-20 uppercase border border-orange-100">Stock Faible</span>
                                                    )}
                                                    {product.compareAtPrice > product.price && (
                                                        <span className="absolute top-4 right-4 bg-black/90 text-white text-[10px] font-medium tracking-widest px-2 py-1 z-20 uppercase">Promo</span>
                                                    )}
                                                </div>
                                                <h3 className="font-medium text-base mb-1 text-gray-900 group-hover:text-black transition-colors cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>{product.name}</h3>
                                                <p className="text-gray-400 font-light text-xs mb-3 flex items-center justify-between">
                                                    <span>{product.category?.name || 'Vêtements'}</span>
                                                    <span className="text-gray-900 font-medium text-base">{product.price.toLocaleString()} DZD</span>
                                                </p>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                                {sortedProducts.length === 0 && (
                                    <div className="text-center py-24">
                                        <p className="text-lg text-gray-500 font-light">Aucun produit ne correspond à vos critères.</p>
                                        <button onClick={() => {
                                            setSelectedCategories([]);
                                            setSelectedVendors([]);
                                            setInStockOnly(false);
                                            setPriceRange([0, 1000000]);
                                            setSelectedSizes([]);
                                            setSelectedColors([]);
                                        }} className="mt-4 text-black font-medium underline hover:text-gray-700 transition-colors">Effacer les filtres</button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Pagination (Visual Only for now as we load all) */}
                        {sortedProducts.length > 0 && (
                            <div className="mt-16 flex justify-center items-center gap-2">
                                <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded hover:border-primary transition-colors disabled:opacity-50" disabled>
                                    <ChevronRight className="rotate-180" size={20} />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center bg-primary text-white font-bold rounded">1</button>
                                {/* <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded hover:border-primary transition-colors">2</button> */}
                                <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded hover:border-primary transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Catalogue;
