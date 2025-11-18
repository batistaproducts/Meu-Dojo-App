
import React, { useState } from 'react';
import { Fight } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface FightRecordModalProps {
    onClose: () => void;
    onSave: (fight: Omit<Fight, 'id'>) => void;
}

const FightRecordModal: React.FC<FightRecordModalProps> = ({ onClose, onSave }) => {
    const [result, setResult] = useState<'win' | 'loss' | 'draw'>('win');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ result, date });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                    <h3 className="text-2xl font-bold font-cinzel text-gray-900 dark:text-white">Adicionar Luta</h3>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Resultado</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button type="button" onClick={() => setResult('win')} className={`p-3 text-sm rounded-lg border-2 font-semibold ${result === 'win' ? 'bg-green-500 text-white border-green-300' : 'bg-gray-200 dark:bg-gray-700'}`}>Vitória</button>
                            <button type="button" onClick={() => setResult('loss')} className={`p-3 text-sm rounded-lg border-2 font-semibold ${result === 'loss' ? 'bg-red-500 text-white border-red-300' : 'bg-gray-200 dark:bg-gray-700'}`}>Derrota</button>
                            <button type="button" onClick={() => setResult('draw')} className={`p-3 text-sm rounded-lg border-2 font-semibold ${result === 'draw' ? 'bg-gray-500 text-white border-gray-300' : 'bg-gray-200 dark:bg-gray-700'}`}>Empate</button>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="fightDate" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
                        <input id="fightDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FightRecordModal;
