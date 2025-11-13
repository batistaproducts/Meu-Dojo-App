
import React, { useState } from 'react';
import { Student, Dojo, Fight } from '../../types';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import FightRecordModal from './FightRecordModal';
import UserIcon from '../icons/UserIcon';

interface StudentProfileProps {
  student: Student;
  dojo: Dojo;
  onBack: () => void;
  onAddFight: (studentId: string, fight: Omit<Fight, 'id'>) => Promise<void>;
  onViewPublicProfile: (student: Student) => void;
}

const InfoCard: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full">
        <h3 className="text-xl font-bold font-cinzel text-red-800 dark:text-amber-300 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">{title}</h3>
        {children}
    </div>
);

const StudentProfile: React.FC<StudentProfileProps> = ({ student, dojo, onBack, onAddFight, onViewPublicProfile }) => {
  const [isFightModalOpen, setIsFightModalOpen] = useState(false);

  const handleAddFightWrapper = async (fight: Omit<Fight, 'id'>) => {
    if (!student.id) return;
    await onAddFight(student.id, fight);
    setIsFightModalOpen(false);
  };
  
  const fightRecord = student.fights.reduce((acc, fight) => {
    if (fight.result === 'win') acc.wins++;
    if (fight.result === 'loss') acc.losses++;
    if (fight.result === 'draw') acc.draws++;
    return acc;
  }, { wins: 0, losses: 0, draws: 0 });


  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
            Voltar para a lista de alunos
        </button>
         <button onClick={() => onViewPublicProfile(student)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Ver Perfil Público
         </button>
      </div>

      <header className="text-center mb-10 flex flex-col items-center gap-4">
        {student.profile_picture_url ? (
            <img src={student.profile_picture_url} alt={student.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"/>
        ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
        )}
        <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
            <p className="text-xl text-red-700 dark:text-amber-400 font-semibold">{student.modality}</p>
            <p className="text-gray-600 dark:text-gray-400">Membro da {dojo.name} / {dojo.team_name}</p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
             <InfoCard title="Graduação">
                <div className="flex items-center justify-center p-4 rounded-lg" style={{backgroundColor: student.belt.color}}>
                    <p className="text-2xl font-bold" style={{ color: student.belt.color === '#FFFFFF' || student.belt.color === '#FFFF00' ? '#000' : '#FFF', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        Faixa {student.belt.name}
                    </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Última graduação em: <span className="font-semibold text-gray-700 dark:text-gray-200">{new Date(student.last_graduation_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span></p>
             </InfoCard>

             <InfoCard title="Financeiro (Visível apenas para você)">
                <p className="text-lg text-gray-800 dark:text-gray-200">Mensalidade: <span className="font-bold text-green-600 dark:text-green-400">R$ {student.tuition_fee.toFixed(2)}</span></p>
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Status dos pagamentos:</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {student.payments.slice(-8).map(({month, year, status}) => {
                             const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'short' });
                             return (
                                <div key={`${year}-${month}`} className={`p-1.5 text-xs text-center rounded-md ${status === 'paid' ? 'bg-green-600/50 text-green-300' : 'bg-red-600/50 text-red-300'}`}>
                                    {monthName}/{year.toString().slice(-2)}
                                </div>
                             )
                        })}
                    </div>
                </div>
             </InfoCard>
        </div>
        
        <div className="lg:col-span-2 space-y-8">
            <InfoCard title="Registro de Campeonatos">
                {student.championships.length > 0 ? (
                    <ul className="space-y-3">
                        {student.championships.map(champ => (
                            <li key={champ.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{champ.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(champ.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                </div>
                                <span className="font-bold text-red-700 dark:text-amber-400">{champ.result}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-400 dark:text-gray-500 py-4">Nenhum campeonato registrado.</p>
                )}
            </InfoCard>
            
            <InfoCard title="Cartel de Lutas">
                 <div className="flex justify-around text-center">
                    <div>
                        <p className="text-4xl font-bold text-green-500 dark:text-green-400">{fightRecord.wins}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vitórias</p>
                    </div>
                     <div>
                        <p className="text-4xl font-bold text-red-500 dark:text-red-400">{fightRecord.losses}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Derrotas</p>
                    </div>
                     <div>
                        <p className="text-4xl font-bold text-gray-600 dark:text-gray-300">{fightRecord.draws}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Empates</p>
                    </div>
                 </div>
                 <div className="mt-6 text-center">
                    <button onClick={() => setIsFightModalOpen(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white text-sm rounded-lg transition-colors font-semibold">
                        Adicionar Luta
                    </button>
                 </div>
            </InfoCard>
        </div>
      </div>

      {isFightModalOpen && (
        <FightRecordModal 
            onClose={() => setIsFightModalOpen(false)}
            onSave={handleAddFightWrapper}
        />
      )}
    </div>
  );
};

export default StudentProfile;