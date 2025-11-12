import React from 'react';

interface DashboardProps {
    onNavigate: (view: 'dojo_manager' | 'diploma_generator') => void;
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

                {/* Diploma Generator Card */}
                <div
                    onClick={() => onNavigate('diploma_generator')}
                    className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20 dark:hover:shadow-blue-500/20 cursor-pointer group flex flex-col items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-2">Gerador de Diplomas</h3>
                    <p className="text-gray-600 dark:text-gray-400">Crie diplomas avulsos e personalizados com a ajuda da IA.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;