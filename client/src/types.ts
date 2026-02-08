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
    gallery: string[];
    features?: { icon: string; title: string; description: string }[];
    longDescription?: string;
    accentColor?: string;
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
