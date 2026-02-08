import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('adminToken', data.token);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    <p className="text-slate-400">Please authenticate to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="w-full btn-primary py-3">
                        Login
                    </button>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                const res = await api.get('/auth/rescue-admin');
                                alert(`Succès: ${res.data.message}\n\nEmail: admin@novatech.com\nPass: password123`);
                            } catch (e: any) {
                                alert(`Erreur SOS: ${e.message}`);
                            }
                        }}
                        className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 py-2 rounded border border-red-800 text-sm"
                    >
                        SOS: Réinitialiser Admin (Si échec login)
                    </button>

                    <div className="text-xs text-slate-600 text-center mt-4 break-all">
                        API: {api.defaults.baseURL}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
