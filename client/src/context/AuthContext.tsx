import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api';

interface Customer {
    _id: string; // The MongoDB ID
    firebaseUid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
}

interface AuthContextType {
    customer: Customer | null;
    token: string | null;
    login: (token: string, customerData: Customer) => void;
    logout: () => void;
    updateCustomer: (customerData: Customer) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                try {
                    // Get Firebase ID token
                    const idToken = await firebaseUser.getIdToken();
                    setToken(idToken);
                    localStorage.setItem('customerToken', idToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

                    // Fetch or sync the customer profile from our Backend MongoDB
                    const { data } = await api.get('/customers/profile');
                    setCustomer(data);
                } catch (error) {
                    console.error('Failed to sync profile', error);
                }
            } else {
                setCustomer(null);
                setToken(null);
                localStorage.removeItem('customerToken');
                delete api.defaults.headers.common['Authorization'];
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper functions primarily sync local state manually without reloading page if needed, 
    // but onAuthStateChanged handles the main logic.
    const login = (newToken: string, customerData: Customer) => {
        setToken(newToken);
        setCustomer(customerData);
    };

    const logout = async () => {
        try {
            await signOut(auth);
            // State is naturally updated by onAuthStateChanged listener
        } catch (error) {
            console.error('Failed to sign out', error);
        }
    };

    const updateCustomer = (customerData: Customer) => {
        setCustomer(customerData);
    };

    return (
        <AuthContext.Provider value={{ customer, token, login, logout, updateCustomer, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
