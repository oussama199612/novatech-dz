import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../types';

export interface CartItem {
    id: string; // Unique ID for cart item (productID + variantID/Options)
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
    options?: Record<string, string>;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number, variant?: any, options?: Record<string, string>) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const localData = localStorage.getItem('novatech_cart');
        return localData ? JSON.parse(localData) : [];
    });

    useEffect(() => {
        localStorage.setItem('novatech_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product, quantity: number, variant?: any, options?: Record<string, string>) => {
        setCartItems(prev => {
            const price = variant?.price || product.price;
            // Generate a unique ID based on product and variant/options
            // Simple approach: productId + variantTitle
            const variantId = variant ? variant.title : 'default';
            const existingItemIndex = prev.findIndex(item => item.productId === product._id && item.variant?.title === variant?.title);

            if (existingItemIndex > -1) {
                // Update existing item
                const newCart = [...prev];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                // Add new item
                const newItem: CartItem = {
                    id: `${product._id}-${variantId}-${Date.now()}`,
                    productId: product._id,
                    name: product.name,
                    price: price,
                    image: variant?.image || product.image,
                    quantity,
                    variant: variant ? {
                        title: variant.title,
                        price: variant.price,
                        sku: variant.sku
                    } : undefined,
                    options
                };
                return [...prev, newItem];
            }
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    };

    const updateQuantity = (cartItemId: string, quantity: number) => {
        if (quantity < 1) return;
        setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
