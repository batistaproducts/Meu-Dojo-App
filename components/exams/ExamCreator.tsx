import React, { useState } from 'react';
import { Exam, MartialArt, Belt, ExamExercise } from '../../types';
import { MARTIAL_ARTS } from '../../constants';
import PlusIcon from '../icons/PlusIcon';
import CloseIcon from '../icons/CloseIcon';

interface ExamCreatorProps {
  exams: Exam[];
  modalities: MartialArt[];
  onSaveExam: (exam: Omit<Exam, 'dojo_id'>) => Promise<void>;
  onDeleteExam: (examId: string) => Promise<void>;
}

const ExamCreator: React.FC<ExamCreatorProps> = ({ exams, modalities, onSaveExam, onDeleteExam }) => {
  const [selectedArtName, setSelectedArtName] = useState<string>(modalities[0]?.name || '');
  const [targetBelt, setTargetBelt] = useState<Belt | null>(null);
  const [examName, setExamName] = useState('');
  const [minPassingGrade, setMinPassingGrade] = useState(7);
  const [exercises, setExercises] = useState<ExamExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState('');

  const selectedArt = MARTIAL_ARTS.find(art => art.name === selectedArtName);

  const handleAddExercise = () => {
    if (currentExercise.trim() !== '') {
      setExercises([...exercises, { id: Date.now().toString(), name: currentExercise.trim() }]);
      setCurrentExercise('');
    }
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };
  
  const resetForm = () => {
    setTargetBelt(null);
    setExamName('');
    setMinPassingGrade(7);
    setExercises([]);
    setCurrentExercise('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtName || !targetBelt || !examName || exercises.length === 0) {
      alert('Preencha todos os campos, incluindo a graduação e ao menos um exercício.');
      return;
    }
    const newExam: Omit<Exam, 'dojo_id'> = {
      martial_art_name: selectedArtName,
      target_belt: targetBelt,
      name: examName,
      exercises,
      min_passing_grade: minPassingGrade,
    };
    await onSaveExam(newExam);
    resetForm();
  };
  
  const handleDeleteExamWrapper = async (examId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta prova?")) {
        await onDeleteExam(examId);
    }
  }

  return (
    <div className="animate-fade-in grid md:grid-cols-3 gap-8">
      {/* Form Column */}
      <div className="md:col-span-1">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300 mb-6">Criar Nova Prova</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="art" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Arte Marcial</label>
              <select id="art" value={selectedArtName} onChange={e => { setSelectedArtName(e.target.value); setTargetBelt(null); }} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5">
                {modalities.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Graduação Alvo</label>
              <div className="flex flex-wrap gap-2">
                {selectedArt?.belts.map(belt => (
                  <button type="button" key={belt.name} onClick={() => setTargetBelt(belt)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 border-2 ${targetBelt?.name === belt.name ? 'ring-2 ring-offset-2 ring-red-500 dark:ring-amber-400 ring-offset-white dark:ring-offset-gray-800' : 'border-transparent'}`} style={{ backgroundColor: belt.color, color: belt.color === '#FFFFFF' || belt.color === '#FFFF00' ? '#000' : '#FFF' }}>
                    {belt.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="examName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Prova</label>
              <input id="examName" type="text" value={examName} onChange={e => setExamName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" placeholder="Ex: Exame de Faixa Azul 2024" />
            </div>

             <div>
              <label htmlFor="minGrade" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nota Mínima para Aprovação</label>
              <input id="minGrade" type="number" min="0" max="10" step="0.5" value={minPassingGrade} onChange={e => setMinPassingGrade(parseFloat(e.target.value))} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" />
            </div>

            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Exercícios da Prova</label>
                <div className="flex gap-2">
                    <input type="text" value={currentExercise} onChange={e => setCurrentExercise(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddExercise())} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" placeholder="Nome do exercício" />
                    <button type="button" onClick={handleAddExercise} className="p-2.5 bg-red-600 dark:bg-amber-600 text-white rounded-lg"><PlusIcon className="w-5 h-5"/></button>
                </div>
                <ul className="mt-3 space-y-2">
                    {exercises.map(ex => (
                        <li key={ex.id} className="flex justify-between items-center text-sm bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md">
                            <span>{ex.name}</span>
                            <button type="button" onClick={() => handleRemoveExercise(ex.id)}><CloseIcon className="w-4 h-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" /></button>
                        </li>
                    ))}
                </ul>
            </div>
            
            <button type="submit" className="w-full text-white bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 font-bold rounded-lg text-md px-5 py-3 text-center transition-colors">Salvar Prova</button>
          </form>
        </div>
      </div>

      {/* List Column */}
      <div className="md:col-span-2">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300 mb-6">Provas Cadastradas</h2>
            {exams.length > 0 ? (
                <div className="space-y-4">
                    {exams.map(exam => (
                        <div key={exam.id} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exam.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{exam.martial_art_name} - Faixa {exam.target_belt.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nota Mínima: {exam.min_passing_grade}</p>
                                </div>
                                <button onClick={() => handleDeleteExamWrapper(exam.id!)} className="text-red-500 hover:text-red-700">
                                    <CloseIcon className="w-5 h-5"/>
                                </button>
                            </div>
                            <ul className="mt-3 list-disc list-inside text-sm space-y-1">
                                {exam.exercises.map(ex => <li key={ex.id}>{ex.name}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 dark:text-gray-500 py-8">Nenhuma prova cadastrada ainda.</p>
            )}
         </div>
      </div>
    </div>
  );
};

export default ExamCreator;