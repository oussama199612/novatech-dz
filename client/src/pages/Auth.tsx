import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Mail, Phone, Lock, User, ArrowRight } from 'lucide-react';
import { auth } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    sendPasswordResetEmail,
    signOut
} from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
    const navigate = useNavigate();
    const { login, customer } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [resetMsg, setResetMsg] = useState('');

    useEffect(() => {
        // Redirect if already logged in
        if (customer) {
            navigate('/profile');
        }
    }, [customer, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // 1. Firebase Login
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
                navigate('/profile');
            } else {
                // Formatting phone number
                let phoneNumber = formData.phone.trim();

                // Validate phone number format
                const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
                if (!phoneRegex.test(phoneNumber) || phoneNumber.replace(/\D/g, '').length < 8) {
                    setError('Le numéro de téléphone est invalide. Veuillez n\'utiliser que des chiffres.');
                    setLoading(false);
                    return;
                }

                if (phoneNumber.startsWith('0')) {
                    phoneNumber = '+213' + phoneNumber.substring(1).replace(/\s+/g, '');
                } else if (!phoneNumber.startsWith('+')) {
                    phoneNumber = '+213' + phoneNumber.replace(/\s+/g, ''); // Fallback
                }

                let userCredential;
                try {
                    // 2. Firebase Register
                    userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                    const user = userCredential.user;

                    await updateProfile(user, {
                        displayName: `${formData.firstName} ${formData.lastName}`
                    });

                    // Send Email Verification
                    try {
                        await sendEmailVerification(user);
                    } catch (emailErr) {
                        console.error("Failed to send verification email", emailErr);
                    }

                    // 3. Sync to Custom Backend
                    const response = await api.post('/customers/register', {
                        firebaseUid: user.uid,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: phoneNumber,
                    });

                    // 4. Update the AuthContext manually
                    const token = await user.getIdToken();
                    login(token, response.data);

                    setTimeout(() => {
                        navigate('/profile');
                    }, 1000);

                } catch (registrationErr: unknown) { // Changed to unknown
                    console.error("Registration Sync Error:", registrationErr);

                    if (userCredential && userCredential.user) {
                        await userCredential.user.delete(); // Changed from deleteUser(userCredential.user)
                    }

                    setError('Erreur lors de la finalisation de l\'inscription. Veuillez réessayer.');
                    if (auth.currentUser) {
                        try {
                            await signOut(auth);
                        } catch (signOutErr: unknown) { // Changed to unknown
                            console.error("Error signing out after failed sync:", signOutErr);
                        }
                    }
                    throw registrationErr;
                }
            }
        } catch (err: unknown) { // Changed to unknown
            console.error("Auth Error:", err);
            const authError = err as { code?: string; message?: string }; // Added typecast
            if (authError.code === 'auth/email-already-in-use') {
                setError('Cette adresse e-mail est déjà utilisée.');
            } else if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') { // Updated conditions
                setError('Identifiants incorrects.');
            } else {
                setError(authError.message || 'Une erreur s\'est produite. Veuillez réessayer.'); // Updated message
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => { // Renamed function
        if (!formData.email) {
            setError('Veuillez entrer votre adresse e-mail pour réinitialiser le mot de passe.'); // Updated message
            setResetMsg(''); // Added to clear resetMsg
            return;
        }
        try {
            await sendPasswordResetEmail(auth, formData.email);
            setResetMsg('Un e-mail de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception.');
            setError('');
        } catch (err: unknown) { // Changed to unknown
            setError('Erreur lors de l\'envoi de l\'e-mail de réinitialisation. Vérifiez que l\'e-mail est correct.');
            setResetMsg('');
            console.error(err);
        }
    };

    const inputClasses = "w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black focus:bg-white transition-all duration-300";

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden flex-col justify-center px-16">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2800&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-white text-5xl font-serif font-light leading-tight mb-6">
                        L'élégance à portée de clic.
                    </h1>
                    <p className="text-gray-300 text-lg font-light leading-relaxed">
                        Rejoignez notre espace exclusif pour accéder à des collections sur-mesure, suivre vos commandes en temps réel et profiter de nos offres personnalisées.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-white">
                <div className="max-w-md w-full mx-auto">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <h2 className="text-3xl font-serif text-gray-900 mb-2">
                                {isLogin ? 'Bon retour' : 'Rejoindre le club'}
                            </h2>
                            <p className="text-gray-500 mb-8">
                                {isLogin
                                    ? "Connectez-vous pour accéder à votre compte."
                                    : "Créez votre compte pour faire partie de la famille."}
                            </p>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-50 text-red-700 p-4 rounded-sm border-l-4 border-red-500 mb-6 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {resetMsg && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-50 text-green-700 p-4 rounded-sm border-l-4 border-green-500 mb-6 text-sm"
                                >
                                    {resetMsg}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <AnimatePresence>
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Prénom"
                                                    className={inputClasses}
                                                    value={formData.firstName}
                                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Nom"
                                                    className={`w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black focus:bg-white transition-all duration-300`}
                                                    value={formData.lastName}
                                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Adresse Email"
                                        className={inputClasses}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <AnimatePresence>
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="relative pt-5"
                                        >
                                            <div className="absolute inset-y-0 left-0 pl-3 pt-5 flex items-center pointer-events-none">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="Téléphone (+213...)"
                                                className={inputClasses}
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Mot de passe"
                                        className={inputClasses}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                {isLogin && (
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={handlePasswordReset}
                                            className="text-sm font-semibold text-luxury-gold hover:text-black transition-colors"
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? 'Se connecter' : "Créer le compte"}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 relative flex justify-center text-sm">
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                    }}
                                    className="text-gray-500 hover:text-black hover:underline transition-colors"
                                >
                                    {isLogin
                                        ? "Pas encore de compte ? Créer un compte"
                                        : "Déjà un compte ? Se connecter"}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Auth;
