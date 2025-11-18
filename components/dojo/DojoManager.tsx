
import React, { useState } from 'react';
import { Dojo, Student, Exam, StudentGrading, Fight, StudentUserLink, StudentRequest } from '../../types';
import StudentProfile from '../student/StudentProfile';
import StudentForm from '../student/StudentForm';
import GraduationModal from './GraduationModal';
import DojoSettingsModal from './DojoSettingsModal';
import PlusIcon from '../icons/PlusIcon';
import UserIcon from '../icons/UserIcon';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import SpinnerIcon from '../icons/SpinnerIcon';
import CertificateIcon from '../icons/CertificateIcon';
import PublicStudentProfile from '../student/PublicStudentProfile';

interface DojoManagerProps {
  dojo: Dojo;
  students: Student[];
  exams: Exam[];
  studentUserLinks: StudentUserLink[];
  studentRequests: StudentRequest[];
  onSaveStudent: (student: Omit<Student, 'dojo_id'>, pictureBase64?: string) => Promise<void>;
  onScheduleGraduation: (examId: string, date: string, attendees: StudentGrading[]) => Promise<void>;
  onSaveSettings: (updates: Partial<Dojo>) => Promise<void>;
  onViewPublicProfile: (student: Student) => void;
  onAddFight: (studentId: string, fight: Omit<Fight, 'id'>) => Promise<void>;
  onUnlinkStudent: (studentId: string) => Promise<void>;
  onNavigateToDiplomaGenerator: (students: Student[]) => void;
  onApproveRequest: (request: StudentRequest) => Promise<void>;
  onRejectRequest: (requestId: string) => Promise<void>;
}

const DojoManager: React.FC<DojoManagerProps> = ({ dojo, students, exams, studentUserLinks, studentRequests, onSaveStudent, onScheduleGraduation, onSaveSettings, onViewPublicProfile, onAddFight, onUnlinkStudent, onNavigateToDiplomaGenerator, onApproveRequest, onRejectRequest }) => {
  const [view, setView] = useState<'list' | 'profile' | 'public_profile'>('list');
  const [activeTab, setActiveTab] = useState<'students' | 'requests'>('students');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [formStudent, setFormStudent] = useState<Student | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [studentToUnlink, setStudentToUnlink] = useState<Student | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);


  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setView('profile');
  };
  
  const handleShowPublicProfile = () => {
    setView('public_profile');
  };

  const handleOpenForm = (student: Student | null) => {
    setFormStudent(student);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormStudent(null);
  };
  
  const handleSaveSettingsWrapper = async (updates: Partial<Dojo>) => {
    await onSaveSettings(updates);
    setIsSettingsModalOpen(false);
  };

  const handleSaveStudentWrapper = async (studentToSave: Student, pictureBase64?: string) => {
    await onSaveStudent(studentToSave, pictureBase64);
    handleCloseForm();
  };
  
  const handleConfirmUnlink = async () => {
    if (!studentToUnlink) return;

    setIsUnlinking(true);
    try {
        await onUnlinkStudent(studentToUnlink.id!);
        setStudentToUnlink(null);
    } catch (error: any) {
        console.error("Failed to unlink student:", error);
        alert(`Falha ao desvincular o aluno:\n\n${error.message}`);
    } finally {
        setIsUnlinking(false);
    }
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(studentId)) {
            newSelection.delete(studentId);
        } else {
            newSelection.add(studentId);
        }
        return newSelection;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        const allIds = new Set(students.map(s => s.id!));
        setSelectedStudentIds(allIds);
    } else {
        setSelectedStudentIds(new Set());
    }
  };

  const handleOpenGraduationModal = () => {
    if (selectedStudentIds.size > 0) {
      setIsGraduationModalOpen(true);
    }
  }

  const handleGenerateDiplomas = () => {
    const selected = students.filter(s => selectedStudentIds.has(s.id!));
    if (selected.length > 0) {
        onNavigateToDiplomaGenerator(selected);
    }
  }

  const handleScheduleGraduationWrapper = async (examId: string, date: string) => {
    const attendees = [...selectedStudentIds].map(id => ({ studentId: id }));
    await onScheduleGraduation(examId, date, attendees);
    setSelectedStudentIds(new Set());
    setIsGraduationModalOpen(false);
  }

  const handleApproveWrapper = async (request: StudentRequest) => {
    setProcessingRequestId(request.id);
    try {
        await onApproveRequest(request);
    } catch (e: any) {
        alert(`Erro ao aprovar aluno: ${e.message}`);
    } finally {
        setProcessingRequestId(null);
    }
  }
  
  const handleRejectWrapper = async (requestId: string) => {
      setProcessingRequestId(requestId);
      try {
          await onRejectRequest(requestId);
      } catch (e: any) {
          alert(`Erro ao rejeitar aluno: ${e.message}`);
      } finally {
          setProcessingRequestId(null);
      }
  }

  if (view === 'profile' && selectedStudent) {
    return <StudentProfile 
        student={selectedStudent} 
        dojo={dojo} 
        onAddFight={onAddFight}
        onBack={() => setView('list')} 
        onSwitchToPublicView={handleShowPublicProfile}
        onNavigateToDiplomaGenerator={onNavigateToDiplomaGenerator}
    />;
  }
  
  if (view === 'public_profile' && selectedStudent) {
    return <PublicStudentProfile
        student={selectedStudent} 
        dojoName={dojo.name}
        teamName={dojo.team_name}
        teamLogoUrl={dojo.team_logo_url}
        onBack={() => setView('profile')}
        backButtonText="Voltar para o Perfil do Aluno"
    />;
  }


  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold font-cinzel text-gray-900 dark:text-white">{dojo.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">Equipe: {dojo.team_name}</p>
        </div>
        <div className="flex gap-2 sm:gap-4 flex-wrap">
             <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold text-sm"
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Configurações
            </button>
            {activeTab === 'students' && selectedStudentIds.size > 0 && (
                <>
                <button
                    onClick={handleOpenGraduationModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold text-sm"
                >
                    Graduar ({selectedStudentIds.size})
                </button>
                <button
                    onClick={handleGenerateDiplomas}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold text-sm"
                >
                    <CertificateIcon className="w-4 h-4" />
                    Gerar Certificados ({selectedStudentIds.size})
                </button>
                </>
            )}
            {activeTab === 'students' && (
            <button
                onClick={() => handleOpenForm(null)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold text-sm"
                >
                <PlusIcon className="w-5 h-5" />
                Adicionar Aluno
            </button>
            )}
        </div>
      </div>
      
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
                onClick={() => setActiveTab('students')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${activeTab === 'students' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
                Alunos ({students.length})
            </button>
            <button
                onClick={() => setActiveTab('requests')}
                className={`relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${activeTab === 'requests' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
            >
                Solicitações
                {studentRequests.length > 0 && <span className="absolute top-3 -right-3.5 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{studentRequests.length}</span>}
            </button>
        </nav>
      </div>


      {activeTab === 'students' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-100 dark:bg-gray-700/50">
                    <tr>
                        <th scope="col" className="p-4">
                            <div className="flex items-center">
                                <input id="checkbox-all" type="checkbox" onChange={handleSelectAll} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3">Nome do Aluno</th>
                        <th scope="col" className="px-6 py-3">Modalidade</th>
                        <th scope="col" className="px-6 py-3">Graduação</th>
                        <th scope="col" className="px-6 py-3">Última Graduação</th>
                        <th scope="col" className="px-6 py-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? students.map(student => (
                    <tr key={student.id} className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedStudentIds.has(student.id!) ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                        <td className="w-4 p-4">
                            <div className="flex items-center">
                                <input id={`checkbox-${student.id}`} type="checkbox" checked={selectedStudentIds.has(student.id!)} onChange={() => handleStudentSelection(student.id!)} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor={`checkbox-${student.id}`} className="sr-only">checkbox</label>
                            </div>
                        </td>
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{student.name}</th>
                        <td className="px-6 py-4">{student.modality}</td>
                        <td className="px-6 py-4">
                        <span className="font-semibold" style={{ color: student.belt.color === '#FFFFFF' || student.belt.color === '#FFFF00' ? '#333' : student.belt.color }}>
                            {student.belt.name}
                        </span>
                        </td>
                        <td className="px-6 py-4">{new Date(student.last_graduation_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 text-right flex justify-end items-center gap-4">
                        <button onClick={() => handleViewProfile(student)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline" title="Ver Perfil"><UserIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleOpenForm(student)} className="font-medium text-yellow-600 dark:text-yellow-400 hover:underline" title="Editar Aluno"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => setStudentToUnlink(student)} className="font-medium text-red-600 dark:text-red-500 hover:underline" title="Desvincular Aluno"><TrashIcon className="w-5 h-5"/></button>
                        </td>
                    </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500">Nenhum aluno cadastrado ainda.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        </div>
      )}
      
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6">
            <div className="space-y-4">
                 {studentRequests.length > 0 ? studentRequests.map(request => (
                    <div key={request.id} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{request.user_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{request.user_email}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Solicitado em: {new Date(request.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                            <button
                                onClick={() => handleRejectWrapper(request.id)}
                                disabled={processingRequestId === request.id}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                                Rejeitar
                            </button>
                             <button
                                onClick={() => handleApproveWrapper(request)}
                                disabled={processingRequestId === request.id}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[90px]"
                            >
                                {processingRequestId === request.id ? <SpinnerIcon className="w-5 h-5"/> : 'Aprovar'}
                            </button>
                        </div>
                    </div>
                 )) : (
                     <p className="text-center text-gray-400 dark:text-gray-500 py-12">Nenhuma nova solicitação de aluno.</p>
                 )}
            </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <StudentForm 
              student={formStudent}
              modalities={dojo.modalities}
              onSave={handleSaveStudentWrapper}
              onCancel={handleCloseForm}
              isLinked={!!formStudent?.id && studentUserLinks.some(link => link.student_id === formStudent.id)}
            />
          </div>
        </div>
      )}

      {isGraduationModalOpen && (
        <GraduationModal 
            students={students.filter(s => selectedStudentIds.has(s.id!))}
            exams={exams}
            onClose={() => setIsGraduationModalOpen(false)}
            onSchedule={handleScheduleGraduationWrapper}
        />
      )}
      
      {isSettingsModalOpen && (
        <DojoSettingsModal
            dojo={dojo}
            onClose={() => setIsSettingsModalOpen(false)}
            onSave={handleSaveSettingsWrapper}
        />
      )}

      {studentToUnlink && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md relative">
                <div className="p-6 sm:p-8">
                    <h3 className="text-xl font-bold font-cinzel text-gray-900 dark:text-white mb-4">Confirmar Ação</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6" dangerouslySetInnerHTML={{ __html: `Tem certeza que deseja desvincular <strong>${studentToUnlink.name}</strong> do seu dojo? <br/>O aluno não será excluído permanentemente, mas não aparecerá mais na sua lista.` }} />
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => setStudentToUnlink(null)}
                            disabled={isUnlinking}
                            className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmUnlink}
                            disabled={isUnlinking}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                        >
                            {isUnlinking ? <SpinnerIcon className="w-5 h-5" /> : 'Desvincular'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DojoManager;
