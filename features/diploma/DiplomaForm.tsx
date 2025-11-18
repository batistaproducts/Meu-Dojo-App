
import React, { useState, ChangeEvent, useEffect } from 'react';
import { MartialArt, DiplomaData, Belt, Student, Dojo, User } from '../../types';
import UploadIcon from '../../components/icons/UploadIcon';

interface DiplomaFormProps {
  students: Student[];
  martialArt: MartialArt;
  dojo: Dojo;
  user: User;
  onSubmit: (data: DiplomaData) => void;
  onBack: () => void;
  isReadOnly?: boolean;
}

const InputField: React.FC<{label: string; id: string; type?: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; required?: boolean; disabled?: boolean;}> = ({ label, id, ...props }) => (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">{label}</label>
      <input id={id} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-white focus:border-red-500 dark:focus:border-white block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" {...props} />
    </div>
  );

const DiplomaForm: React.FC<DiplomaFormProps> = ({ students, martialArt, dojo, user, onSubmit, onBack, isReadOnly = false }) => {
  const [studentName, setStudentName] = useState('');
  const [graduationDate, setGraduationDate] = useState(new Date().toISOString().split('T')[0]);
  const [teamName, setTeamName] = useState('');
  const [masterName, setMasterName] = useState('');
  const [dojoLocation, setDojoLocation] = useState('OSASCO - SP');
  const [selectedBelt, setSelectedBelt] = useState<Belt>(martialArt.belts[0]);
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [dojoLogo, setDojoLogo] = useState<string | null>(null);

  useEffect(() => {
    setTeamName(dojo.team_name);
    setTeamLogo(dojo.team_logo_url || null);
    setDojoLogo(dojo.logo_url || null);

    if (isReadOnly) {
         // Student View Logic
         // Since students only view their own, students array has 1 item.
         const student = students[0];
         if (student) {
             setStudentName(student.name);
             setSelectedBelt(student.belt);
             // Force date to the recorded graduation date
             setGraduationDate(student.last_graduation_date); 
             
             // For student view, the 'user' is the student. 
             // We need the Master's name. We use the stored master_name in the Dojo object, or fallback to the Dojo Name.
             setMasterName(dojo.master_name || dojo.name); 
         }
    } else {
        // Master View Logic
        // For the master view, the logged in user IS the master.
        setMasterName(user.user_metadata.name || dojo.master_name || '');

        if (students.length === 1) {
            setStudentName(students[0].name);
            setSelectedBelt(students[0].belt);
            // Master can choose date, defaults to today in state init
        } else if (students.length > 1) {
            setStudentName(`${students.length} alunos selecionados`);
            setSelectedBelt(students[0].belt); // Default to current belt of first or selected art base
        } else {
            setStudentName('');
            setSelectedBelt(martialArt.belts[0]);
        }
    }
  }, [students, dojo, user, martialArt, isReadOnly]);


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
    onSubmit({
      graduationDate,
      teamName,
      masterName,
      teamLogo,
      dojoLogo,
      martialArtName: martialArt.name,
      dojoLocation,
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-cinzel text-gray-900 dark:text-white">Gerar Diploma de {martialArt.name}</h2>
            <button onClick={onBack} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">&larr; Voltar</button>
        </div>
        
        {isReadOnly && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Modo de Visualização:</strong> As informações do certificado são geradas automaticamente com base no seu registro oficial no Dojo.</p>
            </div>
        )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <InputField label="Aluno(s)" id="studentName" type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} required disabled={true}/>
          <InputField label="Data da Graduação" id="graduationDate" type="date" value={graduationDate} onChange={(e) => setGraduationDate(e.target.value)} required disabled={isReadOnly} />
          <InputField label="Equipe" id="teamName" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} required disabled={isReadOnly} />
          <InputField label="Autoridade (Mestre)" id="masterName" type="text" value={masterName} onChange={(e) => setMasterName(e.target.value)} required disabled={isReadOnly} />
        </div>
        
        {/* Belt Selector */}
        <div>
          <h3 className="mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">Graduação {students.length > 1 ? '(será a graduação atual de cada aluno)' : ''}</h3>
          <div className="flex flex-wrap gap-2">
            {martialArt.belts.map((belt) => (
              <button
                type="button"
                key={belt.name}
                onClick={() => !isReadOnly && students.length === 0 && setSelectedBelt(belt)}
                disabled={isReadOnly || students.length > 0}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 border-2 ${selectedBelt.name === belt.name ? 'ring-2 ring-offset-2 ring-red-500 dark:ring-white ring-offset-white dark:ring-offset-gray-800' : 'border-transparent'} ${isReadOnly || students.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: belt.color, color: belt.color === '#FFFFFF' || belt.color === '#FFFF00' ? '#000' : '#FFF', textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
              >
                {belt.name}
              </button>
            ))}
          </div>
        </div>
        
        <hr className="border-gray-300 dark:border-gray-600" />
        
        {/* Other Details */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
                 <InputField label="Localização (Cidade - Estado)" id="dojoLocation" type="text" value={dojoLocation} onChange={(e) => setDojoLocation(e.target.value)} required disabled={isReadOnly} />
            </div>
            
            {!isReadOnly && (
                <div className="space-y-4">
                <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Logo da Equipe ([LOGOEQUIPE])</h3>
                    <div className="flex items-center gap-4">
                    <label htmlFor="team-logo-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                        <UploadIcon />
                        <span>Selecionar</span>
                    </label>
                    <input id="team-logo-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileUpload(e, setTeamLogo)} />
                    {teamLogo && <img src={teamLogo} alt="Preview do logo da equipe" className="h-16 w-16 rounded-full object-cover border-2 border-gray-400 dark:border-gray-500" />}
                    </div>
                </div>
                <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Logo da Academia ([LOGODOJO])</h3>
                    <div className="flex items-center gap-4">
                    <label htmlFor="dojo-logo-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                        <UploadIcon />
                        <span>Selecionar</span>
                    </label>
                    <input id="dojo-logo-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileUpload(e, setDojoLogo)} />
                    {dojoLogo && <img src={dojoLogo} alt="Preview do logo da academia" className="h-16 w-16 object-contain border-2 border-gray-400 dark:border-gray-500 p-1" />}
                    </div>
                </div>
                </div>
            )}
             {isReadOnly && (teamLogo || dojoLogo) && (
                 <div className="flex gap-4">
                     {teamLogo && <img src={teamLogo} alt="Logo Equipe" className="h-16 w-16 rounded-full object-cover border-2 border-gray-300" title="Logo da Equipe" />}
                     {dojoLogo && <img src={dojoLogo} alt="Logo Dojo" className="h-16 w-16 object-contain border-2 border-gray-300 p-1" title="Logo do Dojo" />}
                 </div>
             )}
        </div>
        
        <button type="submit" className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-400 font-bold rounded-lg text-lg px-5 py-3 text-center transition-colors duration-300">
          Gerar Diplomas
        </button>
      </form>
    </div>
  );
};

export default DiplomaForm;