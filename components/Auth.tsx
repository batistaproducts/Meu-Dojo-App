
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import SpinnerIcon from './icons/SpinnerIcon';

interface AuthProps {
    onAuthSuccess: () => void;
}

const InputField: React.FC<{label: string; id: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;}> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" {...props} />
    </div>
);

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // onAuthStateChange in App.tsx will handle success
            } else {
                if (!name || !email || !password) {
                    throw new Error('Por favor, preencha todos os campos.');
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name,
                        }
                    }
                });
                if (error) throw error;
                setMessage('Cadastro realizado! Por favor, verifique seu e-mail para confirmar sua conta e depois faça o login.');
                setIsLogin(true); // Switch to login view after successful registration
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col items-center justify-center p-4">
             <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold font-cinzel text-red-800 dark:text-amber-400">Meu Dojo</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie a sua equipe de artes marciais</p>
            </div>
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">{isLogin ? 'Login' : 'Criar Conta'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                         <InputField label="Nome Completo" id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    )}
                    <InputField label="E-mail" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <InputField label="Senha" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                   
                    {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                    {message && <p className="text-green-500 dark:text-green-400 text-sm text-center">{message}</p>}

                    <button type="submit" disabled={loading} className="w-full text-white bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-red-400 dark:focus:ring-amber-500 font-bold rounded-lg text-lg px-5 py-3 text-center transition-colors duration-300 disabled:opacity-50 flex justify-center items-center">
                        {loading ? <SpinnerIcon className="w-6 h-6" /> : (isLogin ? 'Entrar' : 'Registrar')}
                    </button>
                </form>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
                    {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
                    <button onClick={() => {setIsLogin(!isLogin); setError(''); setMessage('')}} className="font-medium text-red-600 dark:text-amber-400 hover:underline ml-2">
                        {isLogin ? 'Cadastre-se' : 'Faça login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;