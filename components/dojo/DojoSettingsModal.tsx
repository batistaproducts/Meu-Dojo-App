
import React, { useState, ChangeEvent } from 'react';
import { Dojo, MartialArt } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import UploadIcon from '../icons/UploadIcon';
import SpinnerIcon from '../icons/SpinnerIcon';
import { MARTIAL_ARTS } from '../../constants';


interface DojoSettingsModalProps {
    dojo: Dojo;
    onClose: () => void;
    onSave: (updates: Partial<Dojo>) => Promise<void>;
}

const DojoSettingsModal: React.FC<DojoSettingsModalProps> = ({ dojo, onClose, onSave }) => {
    const [name, setName] = useState(dojo.name);
    const [teamName, setTeamName] = useState(dojo.team_name);
    const [phone, setPhone] = useState(dojo.phone || '');
    const [instagram, setInstagram] = useState(dojo.instagram_handle || '');
    const [selectedModalities, setSelectedModalities] = useState<MartialArt[]>(dojo.modalities);
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

    const handleModalityToggle = (art: MartialArt) => {
        setSelectedModalities(prev =>
          prev.some(m => m.name === art.name)
            ? prev.filter(m => m.name !== art.name)
            : [...prev, art]
        );
      };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates: Partial<Dojo> = {};
            if (name !== dojo.name) updates.name = name;
            if (teamName !== dojo.team_name) updates.team_name = teamName;
            if (phone !== (dojo.phone || '')) updates.phone = phone;
            if (instagram !== (dojo.instagram_handle || '')) updates.instagram_handle = instagram;
            
            const initialModalitiesNames = [...dojo.modalities].map(m => m.name).sort();
            const currentModalitiesNames = [...selectedModalities].map(m => m.name).sort();
            if (JSON.stringify(initialModalitiesNames) !== JSON.stringify(currentModalitiesNames)) {
                updates.modalities = selectedModalities;
            }

            if (logoBase64 !== dojo.logo_url) updates.logo_url = logoBase64;
            if (teamLogoBase64 !== dojo.team_logo_url) updates.team_logo_url = teamLogoBase64;

            if (Object.keys(updates).length > 0) {
                await onSave(updates);
            }
            onClose();
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            alert(`Falha ao salvar configurações: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <div className="p-6 sm:p-8 space-y-6">
                    <h3 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300">Configurações do Dojo</h3>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="dojoName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Academia/Dojo</label>
                          <input id="dojoName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5"/>
                        </div>
                        <div>
                          <label htmlFor="teamName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Equipe</label>
                          <input id="teamName" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5"/>
                        </div>
                         <div>
                          <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Telefone (Opcional)</label>
                          <input id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5"/>
                        </div>
                        <div>
                          <label htmlFor="instagram" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Instagram (Opcional)</label>
                          <input id="instagram" type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" placeholder="@seuinstagram"/>
                        </div>
                    </div>

                    {/* Modalities */}
                    <div>
                        <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Modalidades Oferecidas</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {MARTIAL_ARTS.map(art => (
                            <button
                                type="button"
                                key={art.name}
                                onClick={() => handleModalityToggle(art)}
                                className={`p-3 text-sm text-center rounded-lg border-2 transition-colors ${selectedModalities.some(m => m.name === art.name) ? 'bg-red-600 dark:bg-amber-600 border-red-500 dark:border-amber-400 text-white' : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
                            >
                                {art.name}
                            </button>
                            ))}
                        </div>
                    </div>


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
                        <button type="button" onClick={handleSave} disabled={loading} className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                            {loading ? <SpinnerIcon className="w-5 h-5" /> : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DojoSettingsModal;