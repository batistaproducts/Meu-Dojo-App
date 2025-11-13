import React, { useState, useEffect } from 'react';
import { Student, Dojo, MartialArt, DiplomaData, User } from '../../types';
import { MARTIAL_ARTS } from '../../constants';
import { generateDiplomaPDF } from '../../services/diplomaService';
import DiplomaForm from './DiplomaForm';
import DiplomaPreview from './DiplomaPreview';

interface DiplomaGeneratorProps {
  students: Student[];
  dojo: Dojo;
  user: User;
  onBack: () => void;
}

type Step = 'form' | 'preview';

export interface DiplomaResult {
    student: Student;
    pdfDataUri: string;
}

const DiplomaGenerator: React.FC<DiplomaGeneratorProps> = ({ students, dojo, user, onBack }) => {
  const [step, setStep] = useState<Step>('form');
  const [selectedArt, setSelectedArt] = useState<MartialArt | null>(null);
  const [results, setResults] = useState<DiplomaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (students.length > 0) {
      const studentArt = MARTIAL_ARTS.find(art => art.name === students[0].modality);
      if (studentArt) {
        setSelectedArt(studentArt);
      } else {
        setSelectedArt(null); 
        setError(`A arte marcial "${students[0].modality}" do aluno não foi encontrada nos registros.`);
      }
    } else {
      // If for some reason the component is rendered without students, go back.
      onBack();
    }
  }, [students, onBack]);

  const handleFormSubmit = async (data: DiplomaData) => {
    setIsLoading(true);
    setError(null);
    setStep('preview');

    try {
        const generatedResults = students.map(student => {
            const pdfDataUri = generateDiplomaPDF(data, student);
            return { student, pdfDataUri };
        });
        setResults(generatedResults);
    } catch (err: any) {
        console.error("PDF Generation Error:", err);
        setError(err.message || 'Ocorreu um erro desconhecido ao gerar os diplomas.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults([]);
    setStep('form');
  };

  const renderStep = () => {
    if (error) {
        return (
          <div className="text-center py-20 animate-fade-in">
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-500">Ocorreu um Erro</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
            <button onClick={onBack} className="mt-6 px-6 py-2 text-white bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 rounded-lg transition-colors">Voltar</button>
          </div>
        );
      }

    switch (step) {
      case 'form':
        if (!selectedArt) return <p className="text-center py-10">Carregando informações da arte marcial...</p>;
        return <DiplomaForm 
                    students={students}
                    martialArt={selectedArt} 
                    dojo={dojo}
                    user={user}
                    onSubmit={handleFormSubmit} 
                    onBack={onBack} 
                />;

      case 'preview':
        return <DiplomaPreview 
                    isLoading={isLoading} 
                    error={error} 
                    results={results} 
                    onReset={handleReset} 
                />;

      default:
        return null;
    }
  };

  return <div className="max-w-7xl mx-auto">{renderStep()}</div>;
};

export default DiplomaGenerator;