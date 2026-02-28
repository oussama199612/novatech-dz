import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Package, CheckCircle, AlertTriangle } from 'lucide-react';

const Profile = () => {
    const { customer, logout, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !customer) {
            navigate('/auth');
        }
    }, [customer, loading, navigate]);

    if (loading || !customer) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="bg-black px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
                                <p className="text-gray-300 mt-1">Gérez vos informations et commandes.</p>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <LogOut size={20} />
                                Déconnexion
                            </button>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Personnelles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500">Nom Complet</p>
                                <p className="font-bold text-gray-900">{customer.firstName} {customer.lastName}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500">Email</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900">{customer.email}</p>
                                    {customer.isEmailVerified ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                        <div title="Email non vérifié">
                                            <AlertTriangle size={16} className="text-amber-500" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-500">Téléphone</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900">{customer.phone}</p>
                                    {customer.isPhoneVerified ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                        <div title="Téléphone non vérifié">
                                            <AlertTriangle size={16} className="text-amber-500" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!customer.isPhoneVerified && (
                            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-4">
                                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-amber-800">Votre téléphone n'est pas vérifié</h3>
                                    <p className="text-sm text-amber-700 mt-1">Vous devez vérifier votre numéro pour valider vos commandes. Un code vous a été envoyé lors de l'inscription.</p>
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={24} /> Mes Commandes
                        </h2>

                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                            <p className="text-gray-500">Votre historique de commandes apparaîtra ici.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
