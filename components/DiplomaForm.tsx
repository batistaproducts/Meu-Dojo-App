
import React, { useState, ChangeEvent } from 'react';
import { MartialArt, DiplomaData, Belt, DiplomaStyle, DiplomaFont, ColorScheme } from '../types';
import { DIPLOMA_STYLES, DIPLOMA_FONTS, DIPLOMA_COLOR_SCHEMES } from '../constants';
import UploadIcon from './icons/UploadIcon';

interface DiplomaFormProps {
  martialArt: MartialArt;
  onSubmit: (data: DiplomaData) => void;
  onBack: () => void;
}

const InputField: React.FC<{label: string; id: string; type?: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; required?: boolean}> = ({ label, id, ...props }) => (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">{label}</label>
      <input id={id} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" {...props} />
    </div>
  );

const DiplomaForm: React.FC<DiplomaFormProps> = ({ martialArt, onSubmit, onBack }) => {
  const [studentName, setStudentName] = useState('');
  const [graduationDate, setGraduationDate] = useState(new Date().toISOString().split('T')[0]);
  const [teamName, setTeamName] = useState('');
  const [masterName, setMasterName] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [selectedBelt, setSelectedBelt] = useState<Belt>(martialArt.belts[0]);
  const [selectedStyle, setSelectedStyle] = useState<DiplomaStyle>(DIPLOMA_STYLES[0]);
  const [selectedFont, setSelectedFont] = useState<DiplomaFont>(DIPLOMA_FONTS[0]);
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme>(DIPLOMA_COLOR_SCHEMES[0]);
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [existingDiplomaImage, setExistingDiplomaImage] = useState<string | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, setter: (value: string | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStyle.id === 'custom' && !existingDiplomaImage) {
        alert('Por favor, faça o upload do diploma existente para o estilo "Meu Diploma".');
        return;
    }
    onSubmit({
      studentName,
      graduationDate,
      teamName,
      masterName,
      selectedBelt,
      selectedStyle,
      teamLogo,
      font: selectedFont,
      colorScheme: selectedColorScheme,
      customNotes,
      existingDiplomaImage,
      // Add missing required fields to satisfy the DiplomaData type
      martialArtName: martialArt.name,
      dojoLogo: null,
      dojoLocation: "Local não especificado",
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-cinzel text-red-800 dark:text-amber-300">Detalhes para {martialArt.name}</h2>
            <button onClick={onBack} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">&larr; Voltar</button>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <InputField label="Nome do Aluno" id="studentName" type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
          <InputField label="Data da Graduação" id="graduationDate" type="date" value={graduationDate} onChange={(e) => setGraduationDate(e.target.value)} required />
          <InputField label="Equipe / Dojo" id="teamName" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
          <InputField label="Nome do Mestre" id="masterName" type="text" value={masterName} onChange={(e) => setMasterName(e.target.value)} required />
        </div>
        
        {/* Belt Selector */}
        <div>
          <h3 className="mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">Graduação</h3>
          <div className="flex flex-wrap gap-2">
            {martialArt.belts.map((belt) => (
              <button
                type="button"
                key={belt.name}
                onClick={() => setSelectedBelt(belt)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 border-2 ${selectedBelt.name === belt.name ? 'ring-2 ring-offset-2 ring-red-500 dark:ring-amber-400 ring-offset-white dark:ring-offset-gray-800' : 'border-transparent'}`}
                style={{ backgroundColor: belt.color, color: belt.color === '#FFFFFF' || belt.color === '#FFFF00' ? '#000' : '#FFF', textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
              >
                {belt.name}
              </button>
            ))}
          </div>
        </div>
        
        <hr className="border-gray-300 dark:border-gray-600" />
        
        <h3 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300 text-center">Customização do Diploma</h3>
        
        {/* Style Selector */}
        <div>
            <h3 className="mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">Estilo do Layout</h3>
            <div className="grid grid-cols-3 gap-4">
            {DIPLOMA_STYLES.map((style) => (
                <div key={style.id} onClick={() => setSelectedStyle(style)} className={`rounded-lg overflow-hidden cursor-pointer border-4 transition-colors ${selectedStyle.id === style.id ? 'border-red-500 dark:border-amber-400' : 'border-transparent hover:border-gray-400 dark:hover:border-gray-500'}`}>
                <img src={style.thumbnail} alt={style.name} className="w-full h-auto object-cover" />
                <p className="text-center bg-gray-100 dark:bg-gray-700 py-2 text-sm">{style.name}</p>
                </div>
            ))}
            </div>
        </div>

        {/* Conditional Upload for "Meu Diploma" */}
        {selectedStyle.id === 'custom' && (
            <div className='bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg border border-red-500/30 dark:border-amber-500/30'>
                <h4 className="mb-3 text-lg font-medium text-red-700 dark:text-amber-300">Upload do Diploma Existente</h4>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>Envie uma imagem de alta qualidade do diploma que você deseja replicar. A IA irá copiar o design e substituir os dados.</p>
                <div className="flex items-center gap-4">
                    <label htmlFor="existing-diploma-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                        <UploadIcon />
                        <span>Selecionar Imagem</span>
                    </label>
                    <input id="existing-diploma-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setExistingDiplomaImage)} />
                    {existingDiplomaImage && <img src={existingDiplomaImage} alt="Preview do diploma" className="h-16 w-auto rounded-md object-cover border-2 border-gray-400 dark:border-gray-500" />}
                </div>
            </div>
        )}
        
        {/* Advanced Customization for Text-Based Diplomas */}
        {selectedStyle.id !== 'custom' && (
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <label htmlFor="font" className="block mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">Fonte</label>
                    <select id="font" onChange={(e) => {
                        const font = DIPLOMA_FONTS.find(f => f.id === e.target.value);
                        if (font) setSelectedFont(font);
                    }} value={selectedFont.id} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5">
                        {DIPLOMA_FONTS.map(font => <option key={font.id} value={font.id}>{font.name}</option>)}
                    </select>
                </div>
                <div>
                    <h3 className="mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">Esquema de Cores</h3>
                    <div className="grid grid-cols-2 gap-3">
                    {DIPLOMA_COLOR_SCHEMES.map(scheme => (
                        <div key={scheme.id} onClick={() => setSelectedColorScheme(scheme)} className={`p-3 rounded-lg cursor-pointer border-2 ${selectedColorScheme.id === scheme.id ? 'border-red-500 dark:border-amber-400 ring-2 ring-red-500 dark:ring-amber-400' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                        <p className="font-semibold text-sm mb-2">{scheme.name}</p>
                        <div className="flex h-6 rounded overflow-hidden">
                            <div style={{backgroundColor: scheme.primary}} className="w-1/3"></div>
                            <div style={{backgroundColor: scheme.secondary}} className="w-1/3"></div>
                            <div style={{backgroundColor: scheme.text}} className="w-1/3"></div>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        )}
        
        {/* Custom Notes & Logo */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
                <label htmlFor="customNotes" className="block mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">Observações (Opcional)</label>
                <textarea id="customNotes" rows={4} value={customNotes} onChange={(e) => setCustomNotes(e.target.value)} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" placeholder="Ex: Destaque por excelente performance no exame..."></textarea>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">Logo da Equipe (Opcional)</h3>
              <div className="flex items-center gap-4">
                <label htmlFor="logo-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                  <UploadIcon />
                  <span>Selecionar Logo</span>
                </label>
                <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setTeamLogo)} />
                {teamLogo && <img src={teamLogo} alt="Preview do logo" className="h-16 w-16 rounded-full object-cover border-2 border-gray-400 dark:border-gray-500" />}
              </div>
            </div>
        </div>
        
        <button type="submit" className="w-full text-white bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-red-400 dark:focus:ring-amber-500 font-bold rounded-lg text-lg px-5 py-3 text-center transition-colors duration-300">
          Gerar Diplomas
        </button>
      </form>
    </div>
  );
};

export default DiplomaForm;
