import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Mail, Phone, Lock, User, ArrowRight } from 'lucide-react';
import { auth } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    RecaptchaVerifier,
    linkWithPhoneNumber,
    sendEmailVerification,
    updateProfile
} from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';

const Auth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState<'form' | 'verifyPhone'>('form');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        otp: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Initialize reCAPTCHA silently when component mounts
    useEffect(() => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'normal',
                callback: () => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    // Response expired. Ask user to solve reCAPTCHA again.
                    setError('Le recaptcha a expiré, veuillez le refaire.');
                }
            });
            // Render the recaptcha widget explicitly
            (window as any).recaptchaVerifier.render();
        }
    }, [isLogin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                // 1. Firebase Login
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
                navigate('/profile');
            } else {
                // Formatting phone number
                let phoneNumber = formData.phone.trim();
                // Ensure the phone number has a country code, default to Algeria +213 for example if it starts with 0
                if (phoneNumber.startsWith('0')) {
                    phoneNumber = '+213' + phoneNumber.substring(1);
                } else if (!phoneNumber.startsWith('+')) {
                    phoneNumber = '+213' + phoneNumber; // Fallback
                }



                // 2. Firebase Register
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
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
                await api.post('/customers/register', {
                    firebaseUid: user.uid,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: phoneNumber,
                });

                // 4. Send Firebase OTP SMS to LINK phone number to existing user
                const appVerifier = (window as any).recaptchaVerifier;
                const confirmation = await linkWithPhoneNumber(user, phoneNumber, appVerifier);
                setConfirmationResult(confirmation);

                setSuccess('Inscription réussie ! Un email de confirmation et un SMS ont été envoyés.');
                setStep('verifyPhone'); // Move to OTP verification
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            // Translate common Firebase errors
            if (err.code === 'auth/email-already-in-use') {
                setError('Cette adresse e-mail est déjà utilisée.');
            } else if (err.code === 'auth/invalid-credential') {
                setError('Identifiants incorrects.');
            } else if (err.code === 'auth/invalid-phone-number') {
                setError('Le numéro de téléphone fourni est invalide. (Ex: +213555...)');
            } else {
                setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
            }
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (!confirmationResult) throw new Error("Erreur de session OTP");

            // Verify with Firebase
            await confirmationResult.confirm(formData.otp);

            // Sync verification status with custom Backend
            await api.post('/customers/verify-phone');

            setSuccess('Téléphone vérifié avec succès !');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Code OTP invalide ou expiré.');
        }
    };

    if (step === 'verifyPhone') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-serif text-gray-900">
                        Vérification du téléphone
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Un code a été envoyé au {formData.phone}
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
                        {success && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">{success}</div>}

                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Code OTP</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-2 border"
                                    value={formData.otp}
                                    onChange={e => setFormData({ ...formData, otp: e.target.value })}
                                    placeholder="Ex: 123456"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
                            >
                                Valider
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="w-full text-center text-sm text-gray-500 mt-2 hover:text-black"
                            >
                                Plus tard
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-serif text-gray-900">
                    {isLogin ? 'Connexion' : 'Créer un compte'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Adresse Email</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div id="recaptcha-container" className="my-4 flex justify-center"></div>

                        <div>
                            <button
                                type="submit"
                                id="sign-in-button"
                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
                            >
                                {isLogin ? 'Se connecter' : "S'inscrire"} <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    {isLogin ? 'Nouveau client ?' : 'Déjà un compte ?'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                {isLogin ? 'Créer un compte' : 'Se connecter'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
