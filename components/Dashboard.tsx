import React from 'react';
import MedalIcon from './icons/MedalIcon';

interface DashboardProps {
    onNavigate: (view: 'dojo_manager' | 'championships') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    return (
        <div className="animate-fade-in text-center">
            <h2 className="text-3xl font-bold text-center mb-10 text-red-800 dark:text-amber-300 font-cinzel">Painel Principal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Dojo Management Card */}
                <div
                    onClick={() => onNavigate('dojo_manager')}
                    className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/20 dark:hover:shadow-amber-500/20 cursor-pointer group flex flex-col items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-red-700 dark:text-amber-400 group-hover:text-red-600 dark:group-hover:text-amber-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition-colors duration-300 mb-2">Gerenciar Dojo</h3>
                    <p className="text-gray-600 dark:text-gray-400">Cadastre sua academia, alunos, mensalidades e acompanhe o progresso.</p>
                </div>
                 {/* Championship Management Card */}
                 <div
                    onClick={() => onNavigate('championships')}
                    className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/20 dark:hover:shadow-amber-500/20 cursor-pointer group flex flex-col items-center"
                >
                    <MedalIcon className="h-16 w-16 mb-4 text-red-700 dark:text-amber-400 group-hover:text-red-600 dark:group-hover:text-amber-300 transition-colors" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition-colors duration-300 mb-2">Gerenciar Campeonatos</h3>
                    <p className="text-gray-600 dark:text-gray-400">Cadastre eventos e os resultados de seus atletas.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;