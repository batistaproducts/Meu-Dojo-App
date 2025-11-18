
import React from 'react';
import MedalIcon from './icons/MedalIcon';
import { AppView } from '../services/roleService';

interface DashboardProps {
    onNavigate: (view: AppView) => void;
    permissions: AppView[];
}

interface DashboardCardProps {
    view: AppView;
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: (view: AppView) => void;
}

const Card: React.FC<DashboardCardProps> = ({ view, title, description, icon, onClick }) => (
    <div
        onClick={() => onClick(view)}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-gray-400/20 dark:hover:shadow-black/40 cursor-pointer group flex flex-col items-center"
    >
        {icon}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors duration-300 mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ onNavigate, permissions }) => {

    const availableCards: Omit<DashboardCardProps, 'onClick'>[] = [
        {
            view: 'dojo_manager',
            title: 'Gerenciar Dojo',
            description: 'Cadastre sua academia, alunos, mensalidades e acompanhe o progresso.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        },
        {
            view: 'championships',
            title: 'Gerenciar Campeonatos',
            description: 'Cadastre eventos e os resultados de seus atletas.',
            icon: <MedalIcon className="h-16 w-16 mb-4 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
        }
    ];

    const cardsToDisplay = availableCards.filter(card => permissions.includes(card.view));

    return (
        <div className="animate-fade-in text-center">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white font-cinzel">Painel Principal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {cardsToDisplay.map(card => (
                    <Card {...card} onClick={onNavigate} key={card.view} />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
