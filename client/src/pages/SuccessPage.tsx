import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const SuccessPage = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                <CheckCircle size={48} />
            </div>
            <h1 className="text-4xl font-bold text-white">Commande Reçue !</h1>
            <p className="text-gray-400 max-w-md">
                Merci pour votre commande. Une fenêtre WhatsApp a dû s'ouvrir pour finaliser votre achat avec notre équipe.
            </p>
            <div className="pt-8">
                <Link to="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-medium">
                    Retour à la boutique
                </Link>
            </div>
        </div>
    );
};

export default SuccessPage;
