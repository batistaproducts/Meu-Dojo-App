
import React, { useMemo } from 'react';
import MedalIcon from './icons/MedalIcon';
import UserIcon from './icons/UserIcon';
import ShoppingBagIcon from './icons/ShoppingBagIcon';
import GlobeIcon from './icons/GlobeIcon';
import TrophyIcon from './icons/TrophyIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import { AppView } from '../services/roleService';
import { Student } from '../types';

interface DashboardProps {
    onNavigate: (view: AppView) => void;
    permissions: AppView[];
    students: Student[];
}

interface DashboardCardProps {
    view?: AppView;
    title: string;
    description: string | React.ReactNode;
    icon: React.ReactNode;
    onClick: () => void;
    className?: string;
    topRight?: React.ReactNode;
}

const Card: React.FC<DashboardCardProps> = ({ title, description, icon, onClick, className, topRight }) => (
    <div
        onClick={onClick}
        className={`relative bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-gray-400/20 dark:hover:shadow-black/40 cursor-pointer group flex flex-col items-center h-full ${className || ''}`}
    >
        {topRight && (
            <div className="absolute top-3 right-3">
                {topRight}
            </div>
        )}
        <div className="flex flex-col items-center mb-4 mt-2">
            {icon}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors duration-300 text-center">{title}</h3>
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-center text-sm w-full flex-grow flex flex-col justify-center">{description}</div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ onNavigate, permissions, students }) => {

    const pendingStudents = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        return students.filter(student => {
            // If student has no payments record for this month, or status is not 'paid'
            const payment = student.payments.find(p => p.month === currentMonth && p.year === currentYear);
            return !payment || payment.status !== 'paid';
        });
    }, [students]);

    const dateLabel = useMemo(() => {
        const now = new Date();
        const month = now.toLocaleString('pt-BR', { month: 'long' });
        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
        return `${capitalizedMonth}/${now.getFullYear()}`;
    }, []);

    const availableCards: Omit<DashboardCardProps, 'onClick'>[] = [
        {
            view: 'dojo_manager',
            title: 'Gerenciar Dojo',
            description: 'Cadastre sua academia, alunos e mensalidades.',
            icon: <UserIcon className="h-12 w-12 mb-2 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
        },
        {
            view: 'store',
            title: 'Loja',
            description: 'Gerencie produtos e links de afiliados.',
            icon: <ShoppingBagIcon className="h-12 w-12 mb-2 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
        },
        {
            view: 'metrics',
            title: 'Métricas',
            description: 'Visualize dashboards e indicadores de performance.',
            icon: <ChartBarIcon className="h-12 w-12 mb-2 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
        },
        {
            view: 'public_dojo_page',
            title: 'Minha Página',
            description: 'Visualize sua página pública do Dojo.',
            icon: <GlobeIcon className="h-12 w-12 mb-2 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
        },
        {
            view: 'championships',
            title: 'Campeonatos',
            description: 'Cadastre eventos e resultados.',
            icon: <MedalIcon className="h-12 w-12 mb-2 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
        },
        {
            view: 'exams',
            title: 'Provas',
            description: 'Crie e edite provas de graduação.',
            icon: <TrophyIcon className="h-12 w-12 mb-2 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
        },
        {
            view: 'grading',
            title: 'Próxima Graduação',
            description: 'Agende e avalie exames de faixa.',
            icon: <ClipboardCheckIcon className="h-12 w-12 mb-2 text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" />
        }
    ];

    // Financial Card (Special Logic)
    const financialCard = (
        <Card 
            key="financial"
            title="Mensalidades em Aberto"
            onClick={() => onNavigate('dojo_manager')} // Shortcut to manager
            topRight={
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                    {dateLabel}
                </span>
            }
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mb-2 transition-colors ${pendingStudents.length > 0 ? 'text-red-600 animate-pulse' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            }
            description={
                pendingStudents.length > 0 ? (
                    <div className="w-full mt-2">
                         <div className="flex justify-between items-center mb-2 px-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Aluno</span>
                            <span className="text-xs font-bold text-gray-500 uppercase">Valor</span>
                         </div>
                         <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-red-200 dark:scrollbar-thumb-red-900 scrollbar-track-transparent">
                            {pendingStudents.map(student => (
                                <div key={student.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {student.profile_picture_url ? (
                                            <img src={student.profile_picture_url} alt={student.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                                 <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                                            </div>
                                        )}
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate text-left">{student.name.split(' ')[0]} {student.name.split(' ').length > 1 ? student.name.split(' ')[1].charAt(0) + '.' : ''}</span>
                                    </div>
                                    <span className="font-bold text-red-600 dark:text-red-400 text-sm whitespace-nowrap ml-2">
                                        R$ {student.tuition_fee}
                                    </span>
                                </div>
                            ))}
                         </div>
                         <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-right">
                            <span className="text-xs text-gray-400">Total: </span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                                R$ {pendingStudents.reduce((acc, s) => acc + s.tuition_fee, 0).toFixed(2)}
                            </span>
                         </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <span className="font-bold text-green-600 text-lg">
                            Todos em dia!
                        </span>
                    </div>
                )
            }
            className={pendingStudents.length > 0 ? "border-2 border-red-100 dark:border-red-900/30" : ""}
        />
    );

    const cardsToDisplay = availableCards
        .filter(card => card.view && permissions.includes(card.view))
        .map(card => (
            <Card 
                key={card.view} 
                {...card} 
                onClick={() => card.view && onNavigate(card.view)} 
            />
        ));

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white font-cinzel">Painel Principal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {/* Render Financial Card First if user has dojo_manager permission (implies Master) */}
                {permissions.includes('dojo_manager') && financialCard}
                
                {/* Render Navigation Cards */}
                {cardsToDisplay}
            </div>
        </div>
    );
};

export default Dashboard;
