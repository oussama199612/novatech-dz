export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: Category;
    stock: number;
    orderIndex: number;
    variants: any[];
    offers?: {
        quantity: number;
        price: number;
        label?: string;
        isBestValue?: boolean;
    }[];
    compareAtPrice: number;
    hasVariants: boolean;
    trackQuantity?: boolean;
    continueSellingWhenOutOfStock?: boolean;
    options: { name: string; values: string[] }[];
    // New Fields
    gallery: string[];
    features?: { icon: string; title: string; description: string }[];
    longDescription?: string;
    accentColor?: string;
    vendor?: string;
    productType?: string;
    tags?: string[];
}

export interface Category {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
}

export interface PaymentMethod {
    _id: string;
    name: string;
    slug: string;
    accountLabel: string;
    accountValue: string;
    extraInfo?: string;
    isActive: boolean;
}

export interface Settings {
    shopName: string;
    logoUrl?: string;
    currency: string;
    exchangeRate: number;
    instagramUrl?: string;
    whatsappUrl?: string;
    telegramUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
}
