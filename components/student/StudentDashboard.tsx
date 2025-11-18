
import React, { useState, useEffect } from 'react';
import { Student, Dojo, User, GraduationEvent, Exam, StudentRequest, Product } from '../../types';
import { supabase } from '../../services/supabaseClient';
import Logo from '../icons/Logo';
import PublicStudentProfile from './PublicStudentProfile';
import PublicDojoPage from '../dojo/PublicDojoPage';
import SpinnerIcon from '../icons/SpinnerIcon';
import EditIcon from '../icons/EditIcon';
import CloseIcon from '../icons/CloseIcon';
import UploadIcon from '../icons/UploadIcon';
import UserIcon from '../icons/UserIcon';
import StoreView from '../store/StoreView';
import DiplomaGenerator from '../../features/diploma/DiplomaGenerator';

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
                    <h3 className="text-2xl font-bold font-cinzel text-gray-900 dark:text-white">Editar Perfil</h3>
                    
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
                        <input id="studentName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-white focus:border-red-500 dark:focus:border-white block w-full p-2.5" />
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-semibold">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center min-w-[100px]">
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
    const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'exams' | 'store' | 'diploma'>('profile');
    const [teamStudents, setTeamStudents] = useState<Student[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
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
        if (activeTab === 'team' && currentStudent) {
            loadTeamData();
        }
        if (activeTab === 'store' && currentStudent) {
            loadStoreData();
        }
    }, [activeTab, currentStudent]);

    const loadTeamData = async () => {
        if (teamStudents.length > 0 && dojo) return;

        setIsLoading(true);
        setTeamError(null);

        try {
            let currentDojo = dojo;

            if (!currentDojo) {
                if (!currentStudent?.dojo_id) {
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

    const loadStoreData = async () => {
        if (products.length > 0) return;
        const studentDojoId = currentStudent?.dojo_id;
        
        setIsLoading(true);
        try {
             let query = supabase
                .from('products')
                .select('*')
                .eq('status', true);

             if (studentDojoId) {
                 query = query.or(`dojo_id.eq.${studentDojoId},dojo_id.is.null`);
             } else {
                 query = query.is('dojo_id', null);
             }

             const { data, error } = await query;
             
             if (error) {
                 const isIgnorable = error.code === '42P01' || 
                                     (error.message && error.message.includes('Could not find the table')) ||
                                     (error.message && error.message.includes('does not exist'));
                                     
                 if (isIgnorable) {
                     console.warn("Products table not found, ignoring error.");
                     setProducts([]);
                     return;
                 }
                 throw error;
             }
             
             setProducts(data || []);
        } catch (err: any) {
            const errorMessage = err.message || 'Unknown error';
            console.error(`Failed to load store products: ${errorMessage}`);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }


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

    if (!currentStudent && !studentRequest) {
        return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><SpinnerIcon className="w-16 h-16"/></div>;
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-black/30 shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Logo className="h-8 w-auto" />
                    </div>
                    <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium">
                        Sair
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 flex-grow">
                 {/* Pending Request State */}
                {studentRequest && !currentStudent ? (
                    <div className="max-w-2xl mx-auto text-center mt-10 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Solicitação Enviada</h2>
                        {studentRequest.status === 'rejected' ? (
                            <div>
                                <p className="text-red-500 mb-4">Sua solicitação para entrar no dojo <strong>{studentRequest.dojos?.name || 'Academia'}</strong> foi rejeitada.</p>
                                <p className="text-gray-600 dark:text-gray-400">Entre em contato com o responsável ou tente se registrar novamente.</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Você solicitou entrada na academia <strong>{studentRequest.dojos?.name || 'Academia'}</strong>.
                                    <br/>Aguarde a aprovação do seu mestre para acessar seu perfil completo.
                                </p>
                                <SpinnerIcon className="w-12 h-12 mx-auto text-blue-500"/>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Dashboard Navigation */}
                        {activeTab !== 'diploma' && (
                            <div className="mb-6 overflow-x-auto">
                                <nav className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 min-w-max">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`py-2 px-4 border-b-2 font-medium transition-colors ${activeTab === 'profile' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                    >
                                        Meu Perfil
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('team')}
                                        className={`py-2 px-4 border-b-2 font-medium transition-colors ${activeTab === 'team' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                    >
                                        Minha Equipe
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('store')}
                                        className={`py-2 px-4 border-b-2 font-medium transition-colors ${activeTab === 'store' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                    >
                                        Loja
                                    </button>
                                </nav>
                            </div>
                        )}

                        {/* Content Area */}
                        {activeTab === 'profile' && currentStudent && (
                            <div>
                                <div className="flex justify-end mb-4">
                                    <button 
                                        onClick={() => setIsEditModalOpen(true)} 
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        <EditIcon className="w-4 h-4"/>
                                        Editar Perfil
                                    </button>
                                </div>
                                <PublicStudentProfile 
                                    student={currentStudent} 
                                    dojoName={dojo?.name}
                                    teamName={dojo?.team_name}
                                    teamLogoUrl={dojo?.team_logo_url}
                                    scheduledEvent={scheduledEvent}
                                    scheduledExam={scheduledExam}
                                    onNavigateToDiplomaGenerator={() => setActiveTab('diploma')}
                                />
                            </div>
                        )}
                        
                        {activeTab === 'diploma' && currentStudent && dojo && (
                            <DiplomaGenerator 
                                students={[currentStudent]} 
                                dojo={dojo} 
                                user={user} 
                                onBack={() => setActiveTab('profile')} 
                            />
                        )}

                        {activeTab === 'team' && dojo && (
                            <div>
                                {isLoading ? (
                                    <div className="flex justify-center py-12"><SpinnerIcon className="w-10 h-10"/></div>
                                ) : teamError ? (
                                    <p className="text-center text-red-500 py-12">{teamError}</p>
                                ) : (
                                    <PublicDojoPage dojo={dojo} students={teamStudents} onViewPublicProfile={() => {}} />
                                )}
                            </div>
                        )}

                        {activeTab === 'store' && (
                             <div>
                                {isLoading ? (
                                    <div className="flex justify-center py-12"><SpinnerIcon className="w-10 h-10"/></div>
                                ) : (
                                    <StoreView products={products} isAdmin={false} />
                                )}
                            </div>
                        )}
                    </>
                )}
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
