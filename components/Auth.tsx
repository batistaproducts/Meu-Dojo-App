import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
    onAuthSuccess: (user: User) => void;
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                // Handle Login
                const users: (User & {password: string})[] = JSON.parse(localStorage.getItem('martial_arts_users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    const { password, ...userToReturn } = user;
                    onAuthSuccess(userToReturn);
                } else {
                    setError('E-mail ou senha inválidos.');
                }
            } else {
                // Handle Register
                if (!name || !email || !password) {
                    setError('Por favor, preencha todos os campos.');
                    return;
                }
                const users: (User & {password: string})[] = JSON.parse(localStorage.getItem('martial_arts_users') || '[]');
                if (users.some(u => u.email === email)) {
                    setError('Este e-mail já está cadastrado.');
                    return;
                }
                const newUser = { id: Date.now().toString(), name, email, password };
                users.push(newUser);
                localStorage.setItem('martial_arts_users', JSON.stringify(users));
                const { password: _, ...userToReturn } = newUser;
                onAuthSuccess(userToReturn);
            }
        } catch (e) {
            setError('Ocorreu um erro. Por favor, tente novamente.');
            console.error(e);
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

                    <button type="submit" className="w-full text-white bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-red-400 dark:focus:ring-amber-500 font-bold rounded-lg text-lg px-5 py-3 text-center transition-colors duration-300">
                        {isLogin ? 'Entrar' : 'Registrar'}
                    </button>
                </form>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
                    {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
                    <button onClick={() => {setIsLogin(!isLogin); setError('')}} className="font-medium text-red-600 dark:text-amber-400 hover:underline ml-2">
                        {isLogin ? 'Cadastre-se' : 'Faça login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;