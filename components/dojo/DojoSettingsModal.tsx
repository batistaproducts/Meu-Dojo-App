
import React, { useState, ChangeEvent } from 'react';
import { Dojo } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import UploadIcon from '../icons/UploadIcon';
import SpinnerIcon from '../icons/SpinnerIcon';

interface DojoSettingsModalProps {
    dojo: Dojo;
    onClose: () => void;
    onSave: (logoBase64?: string, teamLogoBase64?: string) => Promise<void>;
}

const DojoSettingsModal: React.FC<DojoSettingsModalProps> = ({ dojo, onClose, onSave }) => {
    const [logoBase64, setLogoBase64] = useState(dojo.logo_url);
    const [teamLogoBase64, setTeamLogoBase64] = useState(dojo.team_logo_url);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setter: (url?: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(logoBase64, teamLogoBase64);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Falha ao salvar configurações.");
        } finally {
            setLoading(false);
        }
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
                                {logoBase64 ? <img src={logoBase64} alt="Logo da Academia" className="w-full h-full object-contain rounded-lg" /> : <span className="text-xs text-gray-400">Sem Logo</span>}
                            </div>
                            <label htmlFor="logo-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors text-sm">
                                <UploadIcon className="w-4 h-4" />
                                <span>Alterar Logo</span>
                            </label>
                            <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setLogoBase64)} />
                        </div>
                    </div>

                    {/* Team Logo */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Logo da Equipe</label>
                         <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                {teamLogoBase64 ? <img src={teamLogoBase64} alt="Logo da Equipe" className="w-full h-full object-cover rounded-full" /> : <span className="text-xs text-gray-400">Sem Logo</span>}
                            </div>
                            <label htmlFor="team-logo-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors text-sm">
                                <UploadIcon className="w-4 h-4" />
                                <span>Alterar Logo</span>
                            </label>
                            <input id="team-logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setTeamLogoBase64)} />
                        </div>
                         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Este logo aparecerá sobre a foto dos seus alunos no perfil público deles.</p>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-semibold">Cancelar</button>
                        <button type="button" onClick={handleSave} disabled={loading} className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center">
                            {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DojoSettingsModal;