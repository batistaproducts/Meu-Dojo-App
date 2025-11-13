import React from 'react';
import { Student, Dojo, User } from '../../types';
import GlobeIcon from '../icons/GlobeIcon';
import UserIcon from '../icons/UserIcon';
import { supabase } from '../../services/supabaseClient';
import Logo from '../icons/Logo';

interface StudentDashboardProps {
    student: Student & { dojos: Dojo | null };
    user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, user }) => {
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const dojo = student.dojos;

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
             <header className="py-4 bg-white dark:bg-black/30 shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div>
                        <Logo className="h-10" />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm hidden sm:inline">Olá, {user.user_metadata.name || student.name}</span>
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-amber-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <div className="animate-fade-in text-center">
                    <h2 className="text-3xl font-bold text-center mb-10 text-red-800 dark:text-amber-300 font-cinzel">Painel do Aluno</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        
                        <a href={`/student/${student.id}`}
                           className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/20 dark:hover:shadow-amber-500/20 cursor-pointer group flex flex-col items-center">
                            <UserIcon className="h-16 w-16 mb-4 text-red-700 dark:text-amber-400 group-hover:text-red-600 dark:group-hover:text-amber-300 transition-colors" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition-colors duration-300 mb-2">Minha Página Pública</h3>
                            <p className="text-gray-600 dark:text-gray-400">Veja seu perfil, histórico de graduações e cartel de lutas.</p>
                        </a>
                        
                        {dojo && (
                            <a href={`/dojo/${dojo.id}`}
                               className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/20 dark:hover:shadow-amber-500/20 cursor-pointer group flex flex-col items-center">
                                <GlobeIcon className="h-16 w-16 mb-4 text-red-700 dark:text-amber-400 group-hover:text-red-600 dark:group-hover:text-amber-300 transition-colors" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition-colors duration-300 mb-2">Página do Dojo</h3>
                                <p className="text-gray-600 dark:text-gray-400">Veja as informações e outros atletas da sua equipe.</p>
                            </a>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
