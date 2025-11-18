
import React, { useState } from 'react';
import { Dojo } from '../../types';
import CogIcon from '../icons/CogIcon';
import UsersIcon from '../icons/UsersIcon';
import ClipboardCheckIcon from '../icons/ClipboardCheckIcon';

interface SysAdminPanelProps {
  dojos: Dojo[];
  onConfigure: (dojo: Dojo) => void;
  onViewStudents: (dojo: Dojo) => void;
  onViewGraduations: (dojo: Dojo) => void;
}

const SysAdminPanel: React.FC<SysAdminPanelProps> = ({ dojos, onConfigure, onViewStudents, onViewGraduations }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDojos = dojos.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold font-cinzel text-gray-900 dark:text-white">Administração do Sistema</h2>
        <div className="w-full md:w-96">
            <input 
                type="text" 
                placeholder="Buscar Dojo ou Equipe..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
            />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-100 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3">Logo</th>
                <th scope="col" className="px-6 py-3">Dojo / Academia</th>
                <th scope="col" className="px-6 py-3">Equipe</th>
                <th scope="col" className="px-6 py-3">ID do Responsável</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDojos.length > 0 ? filteredDojos.map((dojo) => (
                <tr key={dojo.id} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    {dojo.logo_url ? (
                        <img src={dojo.logo_url} alt={dojo.name} className="w-10 h-10 object-contain rounded-md bg-white" />
                    ) : (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-500">N/A</span>
                        </div>
                    )}
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {dojo.name}
                  </th>
                  <td className="px-6 py-4">
                    {dojo.team_name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {dojo.owner_id}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => onConfigure(dojo)}
                            title="Configurações"
                            className="p-2 text-white bg-gray-700 rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                        >
                            <CogIcon className="w-5 h-5" />
                        </button>
                         <button 
                            onClick={() => onViewStudents(dojo)}
                            title="Visualizar Alunos"
                            className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                        >
                            <UsersIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => onViewGraduations(dojo)}
                            title="Graduações"
                            className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 transition-colors"
                        >
                            <ClipboardCheckIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-500">Nenhum dojo encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SysAdminPanel;
