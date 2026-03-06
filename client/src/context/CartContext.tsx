import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../types';
import api from '../api';

export interface CartItem {
    id: string; // Maps to DB _id
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    lineTotal: number;
    variant?: {
        title: string;
        price: number;
        sku?: string;
    };
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number, variant?: { title?: string } | null) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to map backend item to local standard format
const mapBackendToFrontend = (dbItem: { _id: string; product: Product | string; quantity: number; priceAtAddition: number; variant?: { title?: string } | null }): CartItem => {
    const isProductObj = typeof dbItem.product !== 'string' && dbItem.product !== null;
    const productObj = isProductObj ? (dbItem.product as Product) : null;

    let lineTotal = dbItem.priceAtAddition * dbItem.quantity;

    if (productObj && productObj.offers && productObj.offers.length > 0) {
        let remaining = dbItem.quantity;
        let finalPrice = 0;
        const sortedOffers = [...productObj.offers].sort((a, b) => b.quantity - a.quantity);
        for (const offer of sortedOffers) {
            while (remaining >= offer.quantity) {
                finalPrice += offer.price;
                remaining -= offer.quantity;
            }
        }
        finalPrice += remaining * dbItem.priceAtAddition;
        lineTotal = finalPrice;
    }

    return {
        id: dbItem._id,
        productId: productObj ? productObj._id! : (dbItem.product as string),
        name: productObj ? productObj.name : 'Produit',
        price: dbItem.priceAtAddition,
        lineTotal,
        image: productObj ? productObj.image || '' : '',
        quantity: dbItem.quantity,
        variant: dbItem.variant ? { title: dbItem.variant.title || 'Standard', price: dbItem.priceAtAddition } : undefined,
    };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/cart');
            if (data.generatedGuestId) {
                // Ensure cookie is set or local storage fallback for guest ID
                document.cookie = `guestId=${data.generatedGuestId}; path=/; max-age=31536000`;
                localStorage.setItem('guestId', data.generatedGuestId);
            }
            if (data.items) {
                setCartItems(data.items.map(mapBackendToFrontend));
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchCart();
    }, []);

    const addToCart = async (product: Product, quantity: number, variant?: { title?: string } | null) => {
        try {
            const { data } = await api.post('/cart/items', {
                productId: product._id,
                variantTitle: variant?.title,
                quantity
            });
            if (data.items) {
                setCartItems(data.items.map(mapBackendToFrontend));
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert("Erreur lors de l'ajout au panier.");
        }
    };

    const removeFromCart = async (itemId: string) => {
        try {
            // Optimistic update
            setCartItems(prev => prev.filter(item => item.id !== itemId));
            const { data } = await api.delete(`/cart/items/${itemId}`);
            if (data.items) {
                setCartItems(data.items.map(mapBackendToFrontend));
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            fetchCart(); // Revert optimistic update
        }
    };

    const updateQuantity = async (cartItemId: string, quantity: number) => {
        if (quantity < 1) return;
        try {
            const { data } = await api.put(`/cart/items/${cartItemId}`, { quantity });
            if (data.items) {
                setCartItems(data.items.map(mapBackendToFrontend));
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const clearCart = () => {
        setCartItems([]);
        // Ideally should call backend DELETE /cart, but letting it drop gracefully for now
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, loading }}>
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
