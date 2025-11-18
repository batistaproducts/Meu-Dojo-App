
import React from 'react';
import { Dojo, Student, Belt } from '../../types';
import UserIcon from '../icons/UserIcon';
import GlobeIcon from '../icons/GlobeIcon';

interface PublicDojoPageProps {
  dojo: Dojo;
  students: Student[];
  onViewPublicProfile: (student: Student) => void;
  isOwnerPreview?: boolean;
}

const PublicDojoPage: React.FC<PublicDojoPageProps> = ({ dojo, students, onViewPublicProfile, isOwnerPreview }) => {
  const getBeltIndex = (modalityName: string, belt: Belt): number => {
    const martialArt = dojo.modalities.find(m => m.name === modalityName);
    if (!martialArt) return -1;
    return martialArt.belts.findIndex(b => b.name === belt.name);
  };

  const groupedStudents = dojo.modalities.map(modality => {
    const modalityStudents = students
      .filter(s => s.modality === modality.name)
      .sort((a, b) => {
        const beltIndexA = getBeltIndex(modality.name, a.belt);
        const beltIndexB = getBeltIndex(modality.name, b.belt);
        return beltIndexB - beltIndexA;
      });
    return {
      modality,
      students: modalityStudents,
    };
  }).filter(group => group.students.length > 0);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {isOwnerPreview && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg relative mb-8 text-center">
            <p className="font-semibold">Você está visualizando sua página pública.</p>
            <p className="text-sm">É assim que os visitantes verão seu perfil.</p>
        </div>
      )}

      <header className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg mb-10 text-center relative overflow-hidden">
        {dojo.logo_url && (
            <img src={dojo.logo_url} alt={`${dojo.name} Logo`} className="mx-auto h-24 w-auto mb-4 object-contain" />
        )}
        <h1 className="text-4xl md:text-5xl font-bold font-cinzel text-gray-900 dark:text-white">{dojo.name}</h1>
        <h2 className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-semibold">{dojo.team_name}</h2>
        
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-6">
            {dojo.phone && (
                <a href={`tel:${dojo.phone}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span>{dojo.phone}</span>
                </a>
            )}
            {dojo.instagram_handle && (
                <a href={`https://instagram.com/${dojo.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-500 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.2 2H9.8C5.4 2 2 5.4 2 9.8v4.4C2 18.6 5.4 22 9.8 22h4.4c4.4 0 7.8-3.4 7.8-7.8V9.8C22 5.4 18.6 2 14.2 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15.6a3.6 3.6 0 100-7.2 3.6 3.6 0 000 7.2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.6 6.4h.01" />
                    </svg>
                    <span>{dojo.instagram_handle}</span>
                </a>
            )}
        </div>
      </header>
      
      <div className="space-y-12">
        {groupedStudents.map(({ modality, students: modalityStudents }) => (
          <section key={modality.name}>
            <h3 className="text-3xl font-bold font-cinzel text-center mb-8 text-gray-900 dark:text-white">{modality.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {modalityStudents.map(student => (
                <div 
                  key={student.id} 
                  onClick={() => onViewPublicProfile(student)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                >
                  {student.profile_picture_url ? (
                    <img src={student.profile_picture_url} alt={student.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto border-4" style={{borderColor: student.belt.color}} />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto border-4" style={{borderColor: student.belt.color}}>
                      <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <h4 className="font-bold mt-3 text-gray-900 dark:text-white">{student.name}</h4>
                  <p className="text-sm font-semibold" style={{ color: 'black', textShadow: '1px 1px 2px rgba(255,255,255,0.6)' }}>
                    Faixa {student.belt.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PublicDojoPage;
