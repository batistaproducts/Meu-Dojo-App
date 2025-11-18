
import React from 'react';
import { MartialArt } from '../../types';

interface MartialArtSelectorProps {
  arts: MartialArt[];
  onSelect: (art: MartialArt) => void;
}

const MartialArtSelector: React.FC<MartialArtSelectorProps> = ({ arts, onSelect }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white font-cinzel">Selecione uma Arte Marcial</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {arts.map((art) => (
          <div
            key={art.name}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-gray-400/20 dark:hover:shadow-black/40 cursor-pointer group"
            onClick={() => onSelect(art)}
          >
            <img src={art.image} alt={art.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors duration-300">{art.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MartialArtSelector;
