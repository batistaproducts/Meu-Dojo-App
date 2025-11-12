import React, { useState } from 'react';
import { Dojo, Student } from '../../types';
import StudentProfile from '../student/StudentProfile';
import StudentForm from '../student/StudentForm';
import GraduationModal from './GraduationModal';
import PlusIcon from '../icons/PlusIcon';
import UserIcon from '../icons/UserIcon';
import EditIcon from '../icons/EditIcon';

interface DojoManagerProps {
  initialDojo: Dojo;
  onUpdateDojo: (dojo: Dojo) => void;
  onViewPublicProfile: (student: Student) => void;
}

const DojoManager: React.FC<DojoManagerProps> = ({ initialDojo, onUpdateDojo, onViewPublicProfile }) => {
  const [dojo, setDojo] = useState<Dojo>(initialDojo);
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);
  const [formStudent, setFormStudent] = useState<Student | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setView('profile');
  };

  const handleOpenForm = (student: Student | null) => {
    setFormStudent(student);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormStudent(null);
  };

  const handleSaveStudent = (studentToSave: Student) => {
    let updatedStudents;
    const isEditing = dojo.students.some(s => s.id === studentToSave.id);

    if (isEditing) {
      updatedStudents = dojo.students.map(s => s.id === studentToSave.id ? studentToSave : s);
    } else {
      updatedStudents = [...dojo.students, studentToSave];
    }

    const updatedDojo = { ...dojo, students: updatedStudents };
    setDojo(updatedDojo);
    onUpdateDojo(updatedDojo);
    handleCloseForm();
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
        const allIds = new Set(dojo.students.map(s => s.id));
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

  const handleScheduleGraduation = (examId: string, date: string) => {
    const newGraduationEvent = {
        id: Date.now().toString(),
        examId,
        date,
        attendees: Array.from(selectedStudentIds).map(id => ({ studentId: id })),
        status: 'scheduled' as 'scheduled',
    };
    const updatedDojo = { ...dojo, graduationEvents: [...dojo.graduationEvents, newGraduationEvent] };
    setDojo(updatedDojo);
    onUpdateDojo(updatedDojo);
    setSelectedStudentIds(new Set());
    setIsGraduationModalOpen(false);
  }

  if (view === 'profile' && selectedStudent) {
    return <StudentProfile 
        student={selectedStudent} 
        dojo={dojo} 
        onUpdateDojo={onUpdateDojo}
        onBack={() => setView('list')} 
        onViewPublicProfile={onViewPublicProfile}
    />;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold font-cinzel text-red-800 dark:text-amber-300">{dojo.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">Equipe: {dojo.teamName}</p>
        </div>
        <div className="flex gap-4">
            {selectedStudentIds.size > 0 && (
                <button
                    onClick={handleOpenGraduationModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                >
                    Graduar ({selectedStudentIds.size})
                </button>
            )}
            <button
            onClick={() => handleOpenForm(null)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold"
            >
            <PlusIcon className="w-5 h-5" />
            Adicionar Aluno
            </button>
        </div>
      </div>

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
                {dojo.students.length > 0 ? dojo.students.map(student => (
                <tr key={student.id} className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedStudentIds.has(student.id) ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                    <td className="w-4 p-4">
                        <div className="flex items-center">
                            <input id={`checkbox-${student.id}`} type="checkbox" checked={selectedStudentIds.has(student.id)} onChange={() => handleStudentSelection(student.id)} className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
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
                    <td className="px-6 py-4">{new Date(student.lastGraduationDate + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-right flex justify-end items-center gap-4">
                    <button onClick={() => handleViewProfile(student)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline" title="Ver Perfil"><UserIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleOpenForm(student)} className="font-medium text-red-600 dark:text-amber-400 hover:underline" title="Editar Aluno"><EditIcon className="w-5 h-5"/></button>
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


      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <StudentForm 
              student={formStudent}
              dojo={dojo}
              onSave={handleSaveStudent}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {isGraduationModalOpen && (
        <GraduationModal 
            students={dojo.students.filter(s => selectedStudentIds.has(s.id))}
            exams={dojo.exams}
            onClose={() => setIsGraduationModalOpen(false)}
            onSchedule={handleScheduleGraduation}
        />
      )}
    </div>
  );
};

export default DojoManager;
