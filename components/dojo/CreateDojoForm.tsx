
import React, { useState } from 'react';
import { DojoCreationData, MartialArt } from '../../types';
import { MARTIAL_ARTS } from '../../constants';

interface CreateDojoFormProps {
  onDojoCreated: (dojo: DojoCreationData) => Promise<void>;
}

const CreateDojoForm: React.FC<CreateDojoFormProps> = ({ onDojoCreated }) => {
  const [name, setName] = useState('');
  const [team_name, setTeamName] = useState('');
  const [modalities, setSelectedModalities] = useState<MartialArt[]>([]);
  const [loading, setLoading] = useState(false);

  const handleModalityToggle = (art: MartialArt) => {
    setSelectedModalities(prev =>
      prev.some(m => m.name === art.name)
        ? prev.filter(m => m.name !== art.name)
        : [...prev, art]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !team_name || modalities.length === 0) {
      alert('Por favor, preencha todos os campos e selecione ao menos uma modalidade.');
      return;
    }
    setLoading(true);
    try {
        const newDojo: DojoCreationData = {
          name,
          team_name,
          modalities,
          user_role_type: 'M',
        };
        await onDojoCreated(newDojo);
    } catch (error) {
        console.error("Failed to create dojo:", error);
        alert("Falha ao criar o dojo. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-cinzel text-red-800 dark:text-amber-300">Crie seu Dojo</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Primeiro, vamos registrar as informações da sua academia.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="dojoName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Academia/Dojo</label>
          <input id="dojoName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" placeholder="Ex: Academia Feras do Tatame" />
        </div>
        <div>
          <label htmlFor="teamName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Equipe</label>
          <input id="teamName" type="text" value={team_name} onChange={(e) => setTeamName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" placeholder="Ex: Checkmat" />
        </div>
        <div>
          <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Modalidades Oferecidas</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MARTIAL_ARTS.map(art => (
              <button
                type="button"
                key={art.name}
                onClick={() => handleModalityToggle(art)}
                className={`p-3 text-sm text-center rounded-lg border-2 transition-colors ${modalities.some(m => m.name === art.name) ? 'bg-red-600 dark:bg-amber-600 border-red-500 dark:border-amber-400 text-white' : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
              >
                {art.name}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full text-white bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-red-400 dark:focus:ring-amber-500 font-bold rounded-lg text-lg px-5 py-3 text-center transition-colors duration-300 disabled:opacity-50">
          {loading ? 'Criando...' : 'Criar Dojo'}
        </button>
      </form>
    </div>
  );
};

export default CreateDojoForm;