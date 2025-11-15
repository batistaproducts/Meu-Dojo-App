import React, { useState, useEffect } from 'react';
import { Student, Dojo, User, GraduationEvent, Exam, StudentRequest } from '../../types';
import { supabase } from '../../services/supabaseClient';
import Logo from '../icons/Logo';
import PublicStudentProfile from './PublicStudentProfile';
import PublicDojoPage from '../dojo/PublicDojoPage';
import SpinnerIcon from '../icons/SpinnerIcon';
import EditIcon from '../icons/EditIcon';
import CloseIcon from '../icons/CloseIcon';
import UploadIcon from '../icons/UploadIcon';
import UserIcon from '../icons/UserIcon';

interface StudentDashboardProps {
    student: (Student & { dojos: Dojo | null }) | null;
    user: User;
    scheduledEvent: GraduationEvent | null;
    scheduledExam: Exam | null;
    studentRequest: (StudentRequest & { dojos: { name: string; } | null; }) | null;
}

// --- Edit Profile Modal Component ---
const EditProfileModal: React.FC<{
    student: Student;
    onClose: () => void;
    onSave: (name: string, newPicture: string | null) => Promise<void>;
}> = ({ student, onClose, onSave }) => {
    const [name, setName] = useState(student.name);
    const [picture, setPicture] = useState<string | null>(student.profile_picture_url || null);
    const [isSaving, setIsSaving] = useState(false);

    const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(name, picture);
            onClose();
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Não foi possível salvar as alterações. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <h3 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300">Editar Perfil</h3>
                    
                    <div className="flex flex-col items-center gap-4">
                        <label htmlFor="profile-picture-upload-modal" className="cursor-pointer group relative">
                            {picture ? (
                                <img src={picture} alt="Foto do Aluno" className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600 group-hover:opacity-70 transition-opacity" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-300 dark:border-gray-600 group-hover:bg-gray-300 dark:group-hover:bg-gray-600">
                                    <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <UploadIcon className="w-8 h-8 text-white" />
                            </div>
                        </label>
                        <input id="profile-picture-upload-modal" type="file" className="hidden" accept="image/*" onChange={handlePictureUpload} />
                    </div>

                    <div>
                        <label htmlFor="studentName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                        <input id="studentName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" />
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-semibold">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                           {isSaving ? <SpinnerIcon className="w-5 h-5" /> : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, user, scheduledEvent, scheduledExam, studentRequest }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'exams'>('profile');
    const [teamStudents, setTeamStudents] = useState<Student[]>([]);
    const [dojo, setDojo] = useState<Dojo | null>(student?.dojos || null);
    const [isLoading, setIsLoading] = useState(false);
    const [teamError, setTeamError] = useState<string | null>(null);

    const [currentStudent, setCurrentStudent] = useState(student);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        setCurrentStudent(student);
        setDojo(student?.dojos || null);
    }, [student]);

    useEffect(() => {
        if (!currentStudent) return;
        console.log('--- INFORMAÇÕES DE DEBUG DO ALUNO ---');
        console.log('ID de Autenticação (user.id):', user.id);
        console.log('ID do Aluno (student.id):', currentStudent.id);
        console.log('ID do Dojo (student.dojo_id):', currentStudent.dojo_id);
        console.log('------------------------------------');
    }, [user, currentStudent]);
    
    useEffect(() => {
        if (activeTab !== 'team' || !currentStudent) return;

        const loadTeamData = async () => {
            if (teamStudents.length > 0 && dojo) return;

            setIsLoading(true);
            setTeamError(null);

            try {
                let currentDojo = dojo;

                if (!currentDojo) {
                    if (!currentStudent.dojo_id) {
                        throw new Error("Seu perfil não está vinculado a um dojo.");
                    }
                    const { data, error } = await supabase.from('dojos').select('*').eq('id', currentStudent.dojo_id).single();
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
    }, [activeTab, dojo, currentStudent, teamStudents.length]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleSaveProfile = async (newName: string, newPicture: string | null) => {
        if (!currentStudent) return;

        const updates: { name?: string; profile_picture_url?: string } = {};
        if (newName.trim() && newName !== currentStudent.name) {
            updates.name = newName;
        }
        
        const oldPicture = currentStudent.profile_picture_url || null;
        if (newPicture !== oldPicture) {
            updates.profile_picture_url = newPicture || undefined;
        }

        if (Object.keys(updates).length > 0) {
            const { data, error } = await supabase
                .from('students')
                .update(updates)
                .eq('id', currentStudent.id!)
                .select('*, dojos(*)')
                .single();

            if (error) {
                console.error("Supabase update error:", error);
                throw error;
            }
            
            setCurrentStudent(data);
        }
    };

    const renderHeader = () => (
         <header className="py-4 bg-white dark:bg-black/30 shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div>
                    <Logo className="h-10" />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm hidden sm:inline">Olá, {user.user_metadata.name || currentStudent?.name}</span>
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-amber-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span>Sair</span>
                    </button>
                </div>
            </div>
        </header>
    );
    
    if (!currentStudent) {
        let title = "Aguardando Aprovação";
        let message1 = "Sua solicitação para ingressar na academia foi enviada com sucesso.";
        let message2 = "Assim que sua matrícula for aprovada pelo responsável, você terá acesso completo ao seu perfil e informações da equipe aqui.";
        
        if (studentRequest?.status === 'rejected') {
            title = "Solicitação Recusada";
            message1 = `Sua solicitação para ingressar na academia "${studentRequest.dojos?.name || 'desconhecida'}" foi recusada.`;
            message2 = "Você pode tentar se registrar novamente ou entrar em contato com o responsável pela academia.";
        }

        return (
            <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
                {renderHeader()}
                <main className="container mx-auto px-4 py-8 text-center">
                    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in">
                        <h2 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300 mb-4">{title}</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                           {message1}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                           {message2}
                        </p>
                    </div>
                </main>
            </div>
        );
    }


    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="relative">
                         <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute top-0 right-0 z-10 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm rounded-lg transition-colors font-semibold"
                        >
                            <EditIcon className="w-4 h-4" />
                            Editar Perfil
                        </button>
                        <PublicStudentProfile
                            student={currentStudent}
                            dojoName={dojo?.name}
                            teamName={dojo?.team_name}
                            teamLogoUrl={dojo?.team_logo_url}
                            scheduledEvent={scheduledEvent}
                            scheduledExam={scheduledExam}
                        />
                    </div>
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
            case 'exams':
                if (scheduledEvent && scheduledExam) {
                    return (
                        <div className="animate-fade-in max-w-4xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">Provas Agendadas</h3>
                                <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
                                    <p><span className="font-semibold text-gray-500 dark:text-gray-400 w-32 inline-block">Data:</span> {new Date(scheduledEvent.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                    <p><span className="font-semibold text-gray-500 dark:text-gray-400 w-32 inline-block">Prova:</span> {scheduledExam.name}</p>
                                    <p><span className="font-semibold text-gray-500 dark:text-gray-400 w-32 inline-block">Faixa Alvo:</span> {scheduledExam.target_belt.name}</p>
                                    <p><span className="font-semibold text-gray-500 dark:text-gray-400 w-32 inline-block">Nota Mínima:</span> {scheduledExam.min_passing_grade.toFixed(1)}</p>
                                    <div className="pt-4">
                                        <p className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Conteúdo da Prova:</p>
                                        <ul className="list-disc list-inside space-y-2 pl-4 text-gray-800 dark:text-gray-200">
                                            {scheduledExam.exercises.map(ex => <li key={ex.id}>{ex.name}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <p className="text-gray-500 dark:text-gray-400">Você não tem nenhuma prova de graduação agendada no momento.</p>
                    </div>
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
                        <button
                            onClick={() => setActiveTab('exams')}
                            className={`${
                                activeTab === 'exams'
                                ? 'border-red-500 dark:border-amber-400 text-red-600 dark:text-amber-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
                        >
                            Provas
                        </button>
                    </nav>
                </div>

                <div className="animate-fade-in">
                    {renderContent()}
                </div>
            </main>
            {isEditModalOpen && currentStudent && (
                <EditProfileModal
                    student={currentStudent}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveProfile}
                />
            )}
        </div>
    );
};

export default StudentDashboard;