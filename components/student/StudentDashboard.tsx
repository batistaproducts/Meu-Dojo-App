import React, { useState, useEffect } from 'react';
import { Student, Dojo, User } from '../../types';
import { supabase } from '../../services/supabaseClient';
import Logo from '../icons/Logo';
import PublicStudentProfile from './PublicStudentProfile';
import PublicDojoPage from '../dojo/PublicDojoPage';
import SpinnerIcon from '../icons/SpinnerIcon';

interface StudentDashboardProps {
    student: Student & { dojos: Dojo | null };
    user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, user }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile');
    const [teamStudents, setTeamStudents] = useState<Student[]>([]);
    
    const [dojo, setDojo] = useState<Dojo | null>(student.dojos);
    const [isLoading, setIsLoading] = useState(false);
    const [teamError, setTeamError] = useState<string | null>(null);

    useEffect(() => {
        alert('IDs de depuração foram registrados no console do navegador.');
        console.log('--- INFORMAÇÕES DE DEBUG DO ALUNO ---');
        console.log('ID de Autenticação (user.id):', user.id);
        console.log('ID do Aluno (student.id):', student.id);
        console.log('ID do Dojo (student.dojo_id):', student.dojo_id);
        console.log('------------------------------------');
    }, [user, student]);
    
    useEffect(() => {
        if (activeTab !== 'team') return;

        const loadTeamData = async () => {
            if (teamStudents.length > 0 && dojo) return;

            setIsLoading(true);
            setTeamError(null);

            try {
                let currentDojo = dojo;

                if (!currentDojo) {
                    if (!student.dojo_id) {
                        throw new Error("Seu perfil não está vinculado a um dojo.");
                    }
                    const { data, error } = await supabase.from('dojos').select('*').eq('id', student.dojo_id).single();
                    if (error) throw error;
                    if (!data) throw new Error("Dojo associado não foi encontrado.");
                    setDojo(data);
                    currentDojo = data;
                }

                const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').eq('dojo_id', currentDojo.id);
                if (studentsError) throw studentsError;
                setTeamStudents(studentsData || []);

            } catch (err: any) {
                setTeamError(err.message || "Não foi possível carregar os dados da equipe.");
            } finally {
                setIsLoading(false);
            }
        };

        loadTeamData();
    }, [activeTab]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const renderHeader = () => (
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
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <PublicStudentProfile
                        student={student}
                        dojoName={dojo?.name}
                        teamName={dojo?.team_name}
                        teamLogoUrl={dojo?.team_logo_url}
                    />
                );
            case 'team':
                if (isLoading) {
                    return <div className="flex justify-center items-center py-20"><SpinnerIcon className="w-12 h-12" /></div>;
                }

                if (teamError) {
                    return <div className="text-center py-20 text-red-500">{teamError}</div>;
                }
                
                if (!dojo) {
                    return <p className="text-center py-10 text-gray-500">Seu perfil não está vinculado a um dojo para visualizar a equipe.</p>;
                }

                return (
                    <PublicDojoPage
                        dojo={dojo}
                        students={teamStudents}
                        onViewPublicProfile={() => {}}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
            {renderHeader()}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`${
                                activeTab === 'profile'
                                ? 'border-red-500 dark:border-amber-400 text-red-600 dark:text-amber-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
                        >
                            Meu Perfil
                        </button>
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`${
                                activeTab === 'team'
                                ? 'border-red-500 dark:border-amber-400 text-red-600 dark:text-amber-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
                        >
                            Minha Equipe
                        </button>
                    </nav>
                </div>

                <div className="animate-fade-in">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;