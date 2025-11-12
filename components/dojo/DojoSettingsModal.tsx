import React, { useState } from 'react';
import { Dojo } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import UploadIcon from '../icons/UploadIcon';

interface DojoSettingsModalProps {
    dojo: Dojo;
    onClose: () => void;
    onSave: (settings: { logoUrl?: string; teamLogoUrl?: string }) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const DojoSettingsModal: React.FC<DojoSettingsModalProps> = ({ dojo, onClose, onSave }) => {
    const [logoUrl, setLogoUrl] = useState(dojo.logoUrl);
    const [teamLogoUrl, setTeamLogoUrl] = useState(dojo.teamLogoUrl);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url?: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setter(base64);
            } catch (error) {
                console.error("Error converting file", error);
            }
        }
    };

    const handleSave = () => {
        onSave({ logoUrl, teamLogoUrl });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <div className="p-8 space-y-6">
                    <h3 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300">Configurações do Dojo</h3>

                    {/* Academy Logo */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Logo da Academia</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                {logoUrl ? <img src={logoUrl} alt="Logo da Academia" className="w-full h-full object-contain rounded-lg" /> : <span className="text-xs text-gray-400">Sem Logo</span>}
                            </div>
                            <label htmlFor="logo-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors text-sm">
                                <UploadIcon className="w-4 h-4" />
                                <span>Alterar Logo</span>
                            </label>
                            <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setLogoUrl)} />
                        </div>
                    </div>

                    {/* Team Logo */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Logo da Equipe</label>
                         <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                {teamLogoUrl ? <img src={teamLogoUrl} alt="Logo da Equipe" className="w-full h-full object-cover rounded-full" /> : <span className="text-xs text-gray-400">Sem Logo</span>}
                            </div>
                            <label htmlFor="team-logo-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors text-sm">
                                <UploadIcon className="w-4 h-4" />
                                <span>Alterar Logo</span>
                            </label>
                            <input id="team-logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setTeamLogoUrl)} />
                        </div>
                         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Este logo aparecerá sobre a foto dos seus alunos no perfil público deles.</p>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-semibold">Cancelar</button>
                        <button type="button" onClick={handleSave} className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DojoSettingsModal;