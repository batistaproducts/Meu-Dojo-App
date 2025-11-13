
import React, { useState, useMemo } from 'react';
import { Championship, Student } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface AddParticipantModalProps {
  championship: Championship;
  allStudents: Student[];
  participants: Student[];
  onClose: () => void;
  onSave: (championship: Championship, studentId: string, result: string) => Promise<void>;
}

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({ championship, allStudents, participants, onClose, onSave }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [result, setResult] = useState('');

  const availableStudents = useMemo(() => {
    const participantIds = new Set(participants.map(p => p.id));
    return allStudents.filter(s => !participantIds.has(s.id));
  }, [allStudents, participants]);
  
  useState(() => {
      if(availableStudents.length > 0) {
          setSelectedStudentId(availableStudents[0].id!);
      }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !result) {
      alert('Por favor, selecione um aluno e insira o resultado.');
      return;
    }
    await onSave(championship, selectedStudentId, result);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <CloseIcon className="w-6 h-6" />
        </button>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <h3 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300">Adicionar Participante</h3>
          
          <div>
            <label htmlFor="student" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Aluno</label>
            <select
              id="student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5"
            >
              <option value="" disabled>Selecione um aluno...</option>
              {availableStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            {availableStudents.length === 0 && <p className="text-xs text-gray-400 mt-1">Todos os alunos já foram adicionados.</p>}
          </div>

          <div>
            <label htmlFor="result" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Resultado</label>
            <input
              id="result"
              type="text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              required
              className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5"
              placeholder="Ex: Ouro, Prata, 3º Lugar..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg font-semibold">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParticipantModal;