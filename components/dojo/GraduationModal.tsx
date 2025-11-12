import React, { useState, useMemo } from 'react';
import { Student, Exam } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface GraduationModalProps {
  students: Student[];
  exams: Exam[];
  onClose: () => void;
  onSchedule: (examId: string, date: string) => void;
}

const GraduationModal: React.FC<GraduationModalProps> = ({ students, exams, onClose, onSchedule }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [graduationDate, setGraduationDate] = useState(new Date().toISOString().split('T')[0]);

  const applicableExams = useMemo(() => {
    if (students.length === 0) return [];
    // Find common modalities among selected students
    const studentModalities = new Set(students.map(s => s.modality));
    // For simplicity, we'll suggest exams for the first student's modality
    // A more complex logic could find exams applicable to all selected students
    const primaryModality = students[0].modality;
    return exams.filter(exam => exam.martialArtName === primaryModality);
  }, [students, exams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !graduationDate) {
      alert('Por favor, selecione uma prova e uma data.');
      return;
    }
    onSchedule(selectedExamId, graduationDate);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <CloseIcon className="w-6 h-6" />
        </button>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 text-gray-900 dark:text-white">
            <h3 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300">Agendar Graduação</h3>
            
            <div>
                <h4 className="text-lg font-semibold mb-2">Alunos Selecionados ({students.length})</h4>
                <div className="max-h-40 overflow-y-auto bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md space-y-2">
                    {students.map(s => (
                        <div key={s.id} className="text-sm">{s.name} - {s.belt.name}</div>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="exam" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Prova de Graduação</label>
                <select 
                    id="exam" 
                    value={selectedExamId} 
                    onChange={(e) => setSelectedExamId(e.target.value)} 
                    required
                    className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5"
                >
                    <option value="" disabled>Selecione uma prova...</option>
                    {applicableExams.length > 0 ? (
                        applicableExams.map(exam => (
                            <option key={exam.id} value={exam.id}>
                                {exam.name} (Para Faixa {exam.targetBelt.name})
                            </option>
                        ))
                    ) : (
                        <option disabled>Nenhuma prova encontrada para a modalidade dos alunos.</option>
                    )}
                </select>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">As provas são filtradas pela modalidade do primeiro aluno selecionado. Crie provas na seção "Provas".</p>
            </div>

            <div>
                <label htmlFor="graduationDate" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Data do Evento</label>
                <input 
                    id="graduationDate" 
                    type="date" 
                    value={graduationDate} 
                    onChange={(e) => setGraduationDate(e.target.value)} 
                    required 
                    className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" 
                />
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-semibold">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold">Agendar</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default GraduationModal;
