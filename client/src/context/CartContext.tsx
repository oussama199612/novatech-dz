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
    variant?: {
        title: string;
        price: number;
        sku?: string;
    };
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number, variant?: any) => Promise<void>;
    removeFromCart: (cartItemId: string) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const mapBackendToFrontend = (dbItem: any): CartItem => {
    return {
        id: dbItem._id,
        productId: dbItem.product?._id || dbItem.product,
        name: dbItem.product?.name || 'Produit',
        price: dbItem.priceAtAddition,
        image: dbItem.product?.image || '',
        quantity: dbItem.quantity,
        variant: dbItem.variantId ? { title: dbItem.variantId, price: dbItem.priceAtAddition } : undefined,
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

    const addToCart = async (product: Product, quantity: number, variant?: any) => {
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

    const removeFromCart = async (cartItemId: string) => {
        try {
            // Optimistic update
            setCartItems(prev => prev.filter(item => item.id !== cartItemId));
            const { data } = await api.delete(`/cart/items/${cartItemId}`);
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
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, loading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
