import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import SpinnerIcon from './icons/SpinnerIcon';
import Logo from './icons/Logo';
import { Dojo } from '../types';

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
    const [userType, setUserType] = useState<'master' | 'student'>('master');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const [dojos, setDojos] = useState<Dojo[]>([]);
    const [selectedDojo, setSelectedDojo] = useState<Dojo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPreRegistered, setIsPreRegistered] = useState(false);

    useEffect(() => {
        const fetchDojos = async () => {
            if (userType === 'student' && !isLogin) {
                const { data, error } = await supabase.from('dojos').select('*');
                if (error) {
                    console.error("Error fetching dojos:", error);
                } else {
                    setDojos(data || []);
                }
            }
        };
        fetchDojos();
    }, [userType, isLogin]);
    
    useEffect(() => {
        const checkEmail = async () => {
            if (userType === 'student' && !isLogin && email.includes('@') && email.includes('.')) {
                const { data } = await supabase
                    .from('students')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();
                setIsPreRegistered(!!data);
            } else {
                setIsPreRegistered(false);
            }
        };
        const handler = setTimeout(() => checkEmail(), 500); // Debounce
        return () => clearTimeout(handler);
    }, [email, userType, isLogin]);


    const filteredDojos = dojos.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.team_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectDojo = (dojo: Dojo) => {
        setSelectedDojo(dojo);
        setSearchTerm(`${dojo.name} (${dojo.team_name})`);
        setIsDropdownOpen(false);
    };


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
            } else { // Sign up logic
                if (!name || !email || !password) {
                    throw new Error('Por favor, preencha todos os campos.');
                }
                
                if (userType === 'master') {
                    const { error: signUpError } = await supabase.auth.signUp({
                        email, password, options: { data: { name, user_role: 'master' } }
                    });
                    if (signUpError) throw signUpError;
                    setMessage('Cadastro realizado! Por favor, verifique seu e-mail para confirmar sua conta e depois faça o login.');
                    setIsLogin(true);
                
                } else { // Student sign up
                    
                    const { data: preRegisteredStudent, error: checkError } = await supabase
                        .from('students')
                        .select('id')
                        .eq('email', email)
                        .maybeSingle();
                    if (checkError) throw new Error(`Erro ao verificar e-mail: ${checkError.message}`);
                    
                    // --- Auto-approval flow ---
                    if (preRegisteredStudent) {
                         const { data, error: signUpError } = await supabase.auth.signUp({
                            email, password, options: { data: { name, user_role: 'student' } }
                        });
                        if (signUpError) throw signUpError;
                        if (!data.user) throw new Error("Falha ao criar a conta de autenticação.");

                        const { error: linkError } = await supabase.from('student_user_links').insert({
                            user_id: data.user.id,
                            student_id: preRegisteredStudent.id,
                            user_role_type: 'A'
                        });
                        if (linkError) {
                            // This is a critical state. User should contact support.
                            // We don't attempt to delete the auth user from client-side.
                            throw new Error(`Sua conta foi criada, mas não pôde ser vinculada ao seu perfil. Contate o suporte. Erro: ${linkError.message}`);
                        }
                        setMessage('Conta criada e vinculada com sucesso! Agora você já pode fazer o login.');
                        setIsLogin(true);

                    // --- Manual request flow ---
                    } else {
                        if (!selectedDojo) {
                            throw new Error('Seu e-mail não foi pré-cadastrado. Por favor, selecione sua academia para enviar uma solicitação.');
                        }
                        const { data, error: signUpError } = await supabase.auth.signUp({
                            email, password, options: { data: { name, user_role: 'student' } }
                        });
                        if (signUpError) throw signUpError;
                        if (!data.user) throw new Error("Falha ao criar a conta de autenticação.");

                        const { error: requestError } = await supabase.from('student_requests').insert({
                            user_id: data.user.id,
                            dojo_id: selectedDojo!.id,
                            user_name: name,
                            user_email: email
                        });
                        if (requestError) {
                            throw new Error(`Sua conta foi criada, mas a solicitação para entrar na academia falhou: ${requestError.message}.`);
                        }
                        setMessage('Cadastro realizado! Sua solicitação foi enviada para a academia e aguarda aprovação.');
                        setIsLogin(true);
                    }
                }
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
                <Logo className="w-48 mx-auto" />
                <p className="text-gray-600 dark:text-gray-300 mt-4">Gerencie a sua equipe de artes marciais</p>
            </div>
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">{isLogin ? 'Login' : 'Criar Conta'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de acesso</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setUserType('master')} className={`p-3 text-sm rounded-lg border-2 font-semibold ${userType === 'master' ? 'bg-red-600 text-white border-red-400' : 'bg-gray-200 dark:bg-gray-700'}`}>Sou da Academia</button>
                                    <button type="button" onClick={() => setUserType('student')} className={`p-3 text-sm rounded-lg border-2 font-semibold ${userType === 'student' ? 'bg-red-600 text-white border-red-400' : 'bg-gray-200 dark:bg-gray-700'}`}>Sou Aluno</button>
                                </div>
                            </div>
                            <InputField label="Nome Completo" id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                        </>
                    )}
                    <InputField label="E-mail" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <InputField label="Senha" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

                    {!isLogin && userType === 'student' && (
                        <>
                            {isPreRegistered ? (
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-center text-sm text-green-800 dark:text-green-300">
                                    Seu e-mail foi reconhecido! Seu cadastro será vinculado automaticamente à sua academia.
                                </div>
                            ) : (
                                <div className="relative">
                                    <label htmlFor="dojo" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Procure sua academia</label>
                                    <input
                                        id="dojo"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setIsDropdownOpen(true);
                                            setSelectedDojo(null);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder="Digite o nome da academia ou equipe"
                                        required
                                        className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5"
                                    />
                                    {isDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {filteredDojos.length > 0 ? filteredDojos.map(dojo => (
                                            <div key={dojo.id} onClick={() => handleSelectDojo(dojo)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                                                <img src={dojo.team_logo_url || `https://ui-avatars.com/api/?name=${dojo.team_name.charAt(0)}&background=random`} alt="Logo" className="w-8 h-8 rounded-full object-cover"/>
                                                <span>{dojo.name} ({dojo.team_name})</span>
                                            </div>
                                        )) : <div className="px-4 py-2 text-sm text-gray-500">Nenhuma academia encontrada.</div>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                   
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