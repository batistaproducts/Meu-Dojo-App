import React, { useState, useEffect } from 'react';
import { Student, Dojo, MartialArt, DiplomaData, User } from '../../types';
import { MARTIAL_ARTS } from '../../constants';
import { generateDiplomaPDF } from '../../services/diplomaService';
import MartialArtSelector from './MartialArtSelector';
import DiplomaForm from './DiplomaForm';
import DiplomaPreview from './DiplomaPreview';

interface DiplomaGeneratorProps {
  students: Student[];
  dojo: Dojo;
  user: User;
  onBack: () => void;
}

type Step = 'select_art' | 'form' | 'preview';

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
        setStep('form');
      } else {
        setStep('select_art');
      }
    } else {
      setStep('select_art');
    }
  }, [students]);

  const handleArtSelect = (art: MartialArt) => {
    setSelectedArt(art);
    setStep('form');
  };

  const handleFormSubmit = async (data: DiplomaData) => {
    setIsLoading(true);
    setError(null);
    setStep('preview');

    // A geração agora é síncrona
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
    if (students.length === 0) {
        setStep('select_art');
        setSelectedArt(null);
    } else {
        setStep('form');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'select_art':
        return <MartialArtSelector arts={dojo.modalities} onSelect={handleArtSelect} />;
      
      case 'form':
        if (!selectedArt) return <p>Erro: Arte marcial não selecionada.</p>;
        return <DiplomaForm 
                    students={students}
                    martialArt={selectedArt} 
                    dojo={dojo}
                    user={user}
                    onSubmit={handleFormSubmit} 
                    onBack={students.length > 0 ? onBack : () => setStep('select_art')} 
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
