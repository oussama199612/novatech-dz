import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Search, Menu, Filter, X, ChevronDown } from 'lucide-react';
import api from '../api';
import { getImageUrl } from '../utils';
import { type Product } from '../types';

const Catalogue = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const navigate = useNavigate();

    // Filters State
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch all products (active true by default in backend usually, or filter client side)
                const { data } = await api.get('/products');
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Unique values for filters (derived from products)
    const categories = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)));
    // Extract sizes and colors from variants/options
    // Extract sizes and colors from variants/options
    // Extract sizes and colors from variants/options
    const allSizes = Array.from(new Set(products.flatMap(p =>
        p.options?.find(o =>
            ['taille', 'size', 'pointure'].some(keyword => o.name.toLowerCase().includes(keyword))
        )?.values || []
    ))).sort((a, b) => Number(a) - Number(b));

    const allColors = Array.from(new Set(products.flatMap(p =>
        p.options?.find(o => o.name.toLowerCase().includes('couleur') || o.name.toLowerCase().includes('color') || o.name.toLowerCase().includes('coloris'))?.values || []
    )));

    // Filter Logic
    const filteredProducts = products.filter(product => {
        // Category
        if (selectedCategories.length > 0 && (!product.category || !selectedCategories.includes(product.category.name))) {
            return false;
        }
        // Price
        if (product.price < priceRange[0] || product.price > priceRange[1]) {
            return false;
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
                const parts = variant.title.split(' / ');
                let matchesSize = true;
                let matchesColor = true;

                // Check Size
                if (selectedSizes.length > 0) {
                    const sizeIndex = product.options?.findIndex(o => ['taille', 'size', 'pointure'].some(k => o.name.toLowerCase().includes(k))) ?? -1;
                    if (sizeIndex !== -1 && parts[sizeIndex]) {
                        matchesSize = selectedSizes.some(s => String(s).trim() === String(parts[sizeIndex]).trim());
                    } else {
                        matchesSize = false;
                    }
                }

                // Check Color
                if (selectedColors.length > 0) {
                    const colorIndex = product.options?.findIndex(o => ['couleur', 'color', 'coloris'].some(k => o.name.toLowerCase().includes(k))) ?? -1;
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
    });

    // Sort Logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        // if (sortBy === 'popular') return b.sales - a.sales; // Assuming sales field exists, else ignore
        return 0; // 'newest' is default from API usually
    });

    const toggleFilter = (item: string, setFn: React.Dispatch<React.SetStateAction<string[]>>) => {
        setFn(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    return (
        <div className="bg-background-light font-display text-slate-900 min-h-screen">

            {/* Header / Breadcrumbs */}
            <header className="pt-12 pb-8 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 tracking-widest uppercase">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <ChevronRight size={12} />
                        <span className="text-primary font-bold">Catalogue</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold">ALL PRODUCTS</h1>
                            <div className="h-1.5 w-24 bg-primary mt-4"></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                className="lg:hidden flex items-center gap-2 text-sm font-bold"
                                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                            >
                                <Filter size={18} /> FILTERS
                            </button>
                            <span className="hidden md:inline text-sm font-medium text-slate-500">SORT BY:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer"
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
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

                        {/* Categories */}
                        <div>
                            <h3 className="font-bold text-sm tracking-widest mb-6 uppercase">Category</h3>
                            <div className="space-y-3">
                                {categories.map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat)}
                                            onChange={() => toggleFilter(cat, setSelectedCategories)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary transition-colors"
                                        />
                                        <span className="text-sm group-hover:text-primary transition-colors">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mt-10">
                            <h3 className="font-bold text-sm tracking-widest mb-6 uppercase">Price Range</h3>
                            <div className="px-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="50000"
                                    step="500"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                    className="w-full h-1.5 bg-slate-200 accent-primary rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between mt-4 text-xs font-bold text-slate-500">
                                    <span>{priceRange[0]} DA</span>
                                    <span>{priceRange[1].toLocaleString()} DA</span>
                                </div>
                            </div>
                        </div>

                        {/* Size (US) */}
                        {allSizes.length > 0 && (
                            <div className="mt-10">
                                <h3 className="font-bold text-sm tracking-widest mb-6 uppercase">Size (US)</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {allSizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => toggleFilter(size, setSelectedSizes)}
                                            className={`aspect-square flex items-center justify-center border text-xs font-bold transition-colors ${selectedSizes.includes(size)
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-slate-200 hover:border-primary'
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
                            <div className="mt-10 mb-10">
                                <h3 className="font-bold text-sm tracking-widest mb-6 uppercase">Colors</h3>
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
                                                className={`w-8 h-8 rounded-full border ring-offset-2 transition-all ${selectedColors.includes(color) ? 'ring-2 ring-primary border-primary' : 'border-slate-200'
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
                                setPriceRange([0, 50000]);
                                setSelectedSizes([]);
                                setSelectedColors([]);
                            }}
                            className="w-full py-3 bg-slate-900 text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-primary transition-colors"
                        >
                            Clear All
                        </button>

                        {/* Mobile: Apply Button */}
                        <div className="lg:hidden mt-4">
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="w-full py-3 border border-slate-900 text-slate-900 text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-12 animate-pulse">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-slate-100 rounded-xl"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-12">
                                    {sortedProducts.map((product) => (
                                        <div key={product._id} className="group">
                                            <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-5 border border-slate-100 shadow-sm cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                                                <img
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    src={getImageUrl(product.image)}
                                                />
                                                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <button className="bg-white text-slate-900 px-4 py-2 text-xs font-bold rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-primary hover:text-white">
                                                        <span>VIEW</span>
                                                    </button>
                                                </div>
                                                <button className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10">
                                                    <ShoppingBag size={20} />
                                                </button>
                                                {product.stock <= 5 && product.stock > 0 && (
                                                    <span className="absolute top-4 left-4 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">LIMITED</span>
                                                )}
                                                {product.compareAtPrice > product.price && (
                                                    <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">SALE</span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>{product.name}</h3>
                                            <p className="text-slate-500 text-xs mb-3 uppercase tracking-tighter">{product.category?.name || 'Vêtements'}</p>
                                            <p className="text-primary font-bold text-lg">{product.price.toLocaleString()} DZD</p>
                                        </div>
                                    ))}
                                </div>
                                {sortedProducts.length === 0 && (
                                    <div className="text-center py-24">
                                        <p className="text-lg text-slate-400">Aucun produit ne correspond à vos critères.</p>
                                        <button onClick={() => {
                                            setSelectedCategories([]);
                                            setPriceRange([0, 50000]);
                                            setSelectedSizes([]);
                                            setSelectedColors([]);
                                        }} className="mt-4 text-primary font-bold underline">Effacer les filtres</button>
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
