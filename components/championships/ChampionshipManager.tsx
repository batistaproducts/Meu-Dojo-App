import React, { useState, useMemo } from 'react';
import { Championship, Student } from '../../types';
import AddParticipantModal from './AddParticipantModal';
import TrashIcon from '../icons/TrashIcon';
import PlusIcon from '../icons/PlusIcon';

interface ChampionshipManagerProps {
  championships: Championship[];
  students: Student[];
  onSaveChampionship: (championship: Omit<Championship, 'dojo_id' | 'id'> & { id?: string }) => Promise<void>;
  onDeleteChampionship: (championshipId: string) => Promise<void>;
  onAddParticipation: (championship: Championship, studentId: string, result: string) => Promise<void>;
  onRemoveParticipation: (championshipId: string, studentId: string) => Promise<void>;
}

const ChampionshipManager: React.FC<ChampionshipManagerProps> = ({ championships, students, onSaveChampionship, onDeleteChampionship, onAddParticipation, onRemoveParticipation }) => {
  const [selectedChampionship, setSelectedChampionship] = useState<Championship | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const sortedChampionships = useMemo(() => {
    return [...championships].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [championships]);

  const participants = useMemo(() => {
    if (!selectedChampionship) return [];
    return students
      .filter(s => s.championships.some(c => c.id === selectedChampionship.id))
      .map(s => {
        const result = s.championships.find(c => c.id === selectedChampionship.id);
        return { ...s, result: result?.result || 'N/A' };
      });
  }, [selectedChampionship, students]);

  const handleCreateChampionship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;
    await onSaveChampionship({ name, date });
    setName('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSelectChampionship = (championship: Championship) => {
    setSelectedChampionship(championship);
  };
  
  const handleDeleteWrapper = (championshipId: string) => {
      if(window.confirm("Tem certeza que deseja excluir este campeonato? Todas as participações dos alunos neste evento serão removidas. Esta ação não pode ser desfeita.")) {
          onDeleteChampionship(championshipId);
          setSelectedChampionship(null);
      }
  }

  return (
    <div className="animate-fade-in grid md:grid-cols-3 gap-8">
      {/* Left Column: List and Create Form */}
      <div className="md:col-span-1 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold font-cinzel text-red-800 dark:text-amber-300 mb-4">Novo Campeonato</h2>
          <form onSubmit={handleCreateChampionship} className="space-y-4">
            <div>
              <label htmlFor="champName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Evento</label>
              <input id="champName" type="text" value={name} onChange={e => setName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" />
            </div>
            <div>
              <label htmlFor="champDate" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
              <input id="champDate" type="date" value={date} onChange={e => setDate(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 text-white bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 font-bold rounded-lg text-md px-5 py-2.5 text-center transition-colors">
                <PlusIcon className="w-5 h-5" />
                Criar
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold font-cinzel text-red-800 dark:text-amber-300 mb-4">Eventos Cadastrados</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedChampionships.map(champ => (
              <div key={champ.id} onClick={() => handleSelectChampionship(champ)} className={`p-3 rounded-md cursor-pointer transition-colors border-2 ${selectedChampionship?.id === champ.id ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-amber-500' : 'bg-gray-100 dark:bg-gray-700/50 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                <p className="font-semibold text-gray-900 dark:text-white">{champ.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(champ.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Details View */}
      <div className="md:col-span-2">
        {selectedChampionship ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedChampionship.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{new Date(selectedChampionship.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">Adicionar Participante</button>
                <button onClick={() => handleDeleteWrapper(selectedChampionship.id!)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"><TrashIcon className="w-5 h-5"/></button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">Participantes ({participants.length})</h3>
            <div className="space-y-3">
              {participants.length > 0 ? participants.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{p.modality}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-red-700 dark:text-amber-400">{p.result}</span>
                    <button onClick={() => onRemoveParticipation(selectedChampionship.id!, p.id!)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 dark:text-gray-500 py-6">Nenhum aluno adicionado a este campeonato ainda.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <p className="text-gray-500 dark:text-gray-400">Selecione um campeonato para ver os detalhes.</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedChampionship && (
        <AddParticipantModal
            championship={selectedChampionship}
            allStudents={students}
            participants={participants}
            onClose={() => setIsModalOpen(false)}
            onSave={onAddParticipation}
        />
      )}
    </div>
  );
};

export default ChampionshipManager;