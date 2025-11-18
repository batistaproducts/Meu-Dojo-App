
import React from 'react';
import { Student, GraduationEvent, Exam } from '../../types';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import UserIcon from '../icons/UserIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import CertificateIcon from '../icons/CertificateIcon';

interface PublicStudentProfileProps {
  student: Student;
  dojoName?: string;
  teamName?: string;
  teamLogoUrl?: string;
  onBack?: () => void;
  backButtonText?: string;
  scheduledEvent?: GraduationEvent | null;
  scheduledExam?: Exam | null;
  onNavigateToDiplomaGenerator?: (student: Student) => void;
}

const InfoCard: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full">
        <h3 className="text-xl font-bold font-cinzel text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">{title}</h3>
        {children}
    </div>
);

const PublicStudentProfile: React.FC<PublicStudentProfileProps> = ({ student, dojoName, teamName, teamLogoUrl, onBack, backButtonText, scheduledEvent, scheduledExam, onNavigateToDiplomaGenerator }) => {
    
  const fightRecord = student.fights.reduce((acc, fight) => {
    if (fight.result === 'win') acc.wins++;
    if (fight.result === 'loss') acc.losses++;
    if (fight.result === 'draw') acc.draws++;
    return acc;
  }, { wins: 0, losses: 0, draws: 0 });

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          {onBack ? (
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
                {backButtonText || 'Voltar para o Dojo'}
            </button>
          ) : <div></div>}

          {onNavigateToDiplomaGenerator && (
             <button onClick={() => onNavigateToDiplomaGenerator(student)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200">
                <CertificateIcon className="w-4 h-4" />
                Gerar Certificado
            </button>
          )}
      </div>

      <header className="text-center mb-10 flex flex-col items-center gap-4">
        <div className="relative w-24 h-24 md:w-32 md:h-32">
            {student.profile_picture_url ? (
                <img src={student.profile_picture_url} alt={student.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"/>
            ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                    <UserIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-400 dark:text-gray-500" />
                </div>
            )}
            {teamLogoUrl && (
                <img 
                    src={teamLogoUrl} 
                    alt={`${teamName} Logo`} 
                    className="absolute -bottom-1 -right-1 w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                />
            )}
        </div>
        <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{student.name}</h2>
            <p className="text-xl text-red-700 dark:text-red-500 font-semibold">{student.modality}</p>
            <p className="text-gray-600 dark:text-gray-400">Membro da {dojoName || 'Dojo não especificado'} / {teamName || 'Equipe não especificada'}</p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
             <InfoCard title="Progressão de Faixas">
                {/* Current Belt Display */}
                <div className="mb-6">
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">Graduação Atual</p>
                    <div className="flex items-center justify-center p-4 rounded-lg" style={{backgroundColor: student.belt.color}}>
                        <p className="text-2xl font-bold" style={{ color: student.belt.color === '#FFFFFF' || student.belt.color === '#FFFF00' ? '#000' : '#FFF', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                            Faixa {student.belt.name}
                        </p>
                    </div>
                </div>
                
                {/* History */}
                <div className="space-y-0">
                    {[...student.graduation_history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((grad, index, arr) => (
                        <div key={grad.id} className="flex items-start gap-4">
                            <div className="flex flex-col items-center h-full">
                                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: grad.belt.color, border: '2px solid rgba(0,0,0,0.2)'}}></div>
                                {index < arr.length - 1 && <div className="w-0.5 flex-grow bg-gray-300 dark:bg-gray-600 my-1"></div>}
                            </div>
                            <div className="pb-4">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Faixa {grad.belt.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(grad.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    ))}
                </div>
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
            </InfoCard>
        </div>
        
        <div className="lg:col-span-2 space-y-8">
            {scheduledEvent && scheduledExam && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg shadow-lg border border-red-200 dark:border-red-900/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <span className="text-9xl font-serif text-red-600">覚</span>
                    </div>
                    <h3 className="text-xl font-bold font-cinzel text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">Próxima Graduação Agendada</h3>
                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 relative z-10">
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400 w-28 inline-block">Data:</span> {new Date(scheduledEvent.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400 w-28 inline-block">Prova:</span> {scheduledExam.name}</p>
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400 w-28 inline-block">Faixa Alvo:</span> {scheduledExam.target_belt.name}</p>
                        <p><span className="font-semibold text-gray-500 dark:text-gray-400 w-28 inline-block">Nota Mínima:</span> {scheduledExam.min_passing_grade.toFixed(1)}</p>
                        <div>
                            <p className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Conteúdo da Prova:</p>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                {scheduledExam.exercises.map(ex => <li key={ex.id}>{ex.name}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
            <InfoCard title="Histórico de Exames">
                {student.graduation_history.filter(g => g.examName !== 'Cadastro Inicial').length > 0 ? (
                    <ul className="space-y-3">
                        {student.graduation_history.slice().reverse().map(grad => {
                            if (grad.examName === 'Cadastro Inicial') return null;
                            return (
                                <li key={grad.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Promoção para Faixa {grad.belt.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(grad.date + 'T00:00:00').toLocaleDateString('pt-BR')} - {grad.examName}</p>
                                    </div>
                                    <span className="font-bold text-lg text-gray-800 dark:text-gray-200">Nota: {grad.grade.toFixed(1)}</span>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="text-center text-gray-400 dark:text-gray-500 py-4">Nenhum exame de graduação registrado no histórico.</p>
                )}
            </InfoCard>

            <InfoCard title="Registro de Campeonatos">
                {student.championships.length > 0 ? (
                     <ul className="space-y-3">
                        {student.championships.map(champ => (
                            <li key={champ.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{champ.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(champ.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                </div>
                                <span className="font-bold text-red-700 dark:text-red-500">{champ.result}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-400 dark:text-gray-500 py-4">Nenhum campeonato registrado.</p>
                )}
            </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default PublicStudentProfile;
