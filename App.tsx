import React, { useState, useEffect } from 'react';
import { AppStep, DiplomaData, MartialArt, User, GeneratedDiploma, Dojo, Student } from './types';
import { MARTIAL_ARTS } from './constants';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CreateDojoForm from './components/dojo/CreateDojoForm';
import DojoManager from './components/dojo/DojoManager';
import MartialArtSelector from './components/MartialArtSelector';
import DiplomaForm from './components/DiplomaForm';
import DiplomaPreview from './components/DiplomaPreview';
import ExamCreator from './components/exams/ExamCreator';
import GradingView from './components/grading/GradingView';
import PublicStudentProfile from './components/student/PublicStudentProfile';
import { generateDiplomaVariations } from './services/geminiService';
import Header from './components/layout/Header';

export type AppView = 'dashboard' | 'dojo_manager' | 'diploma_generator' | 'exams' | 'grading' | 'public_profile';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SELECT_ART);
  const [selectedArt, setSelectedArt] = useState<MartialArt | null>(null);
  const [diplomaData, setDiplomaData] = useState<DiplomaData | null>(null);
  const [generatedDiplomas, setGeneratedDiplomas] = useState<GeneratedDiploma[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('dashboard');
  const [publicProfileStudent, setPublicProfileStudent] = useState<Student | null>(null);
  const [dojo, setDojo] = useState<Dojo | null>(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('martial_arts_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        const storedDojo = localStorage.getItem(`dojo_${user.id}`);
        if(storedDojo) {
          setDojo(JSON.parse(storedDojo));
        }
      }
    } catch (e) {
      console.error("Failed to parse from localStorage", e);
      localStorage.clear();
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        return newTheme;
    });
  };

  const handleNavigate = (newView: AppView) => {
    if (newView === 'dashboard') {
      handleResetApp();
    } else {
      setView(newView);
    }
  };

  const handleViewPublicProfile = (student: Student) => {
    setPublicProfileStudent(student);
    setView('public_profile');
  }

  const handleArtSelect = (art: MartialArt) => {
    setSelectedArt(art);
    setStep(AppStep.FILL_FORM);
  };

  const handleFormSubmit = async (data: DiplomaData) => {
    setDiplomaData(data);
    setIsLoading(true);
    setError(null);
    setStep(AppStep.GENERATE);

    try {
      if (!selectedArt) throw new Error("Arte marcial não selecionada.");
      const variations = await generateDiplomaVariations(data, selectedArt);
      setGeneratedDiplomas(variations);
    } catch (err) {
      setError("Falha ao gerar os diplomas. Verifique os dados e a imagem, e tente novamente.");
      console.error(err);
      setStep(AppStep.FILL_FORM); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiplomaFlowReset = () => {
    setStep(AppStep.SELECT_ART);
    setSelectedArt(null);
    setDiplomaData(null);
    setGeneratedDiplomas([]);
    setError(null);
  };

  const handleResetApp = () => {
    handleDiplomaFlowReset();
    setView('dashboard');
  }

  const handleAuthSuccess = (user: User) => {
    localStorage.setItem('martial_arts_user', JSON.stringify(user));
    setCurrentUser(user);
    const storedDojo = localStorage.getItem(`dojo_${user.id}`);
    if(storedDojo) {
      setDojo(JSON.parse(storedDojo));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('martial_arts_user');
    setCurrentUser(null);
    setDojo(null);
    handleResetApp();
  }

  const handleDojoCreated = (newDojo: Dojo) => {
    const dojoWithExtras = { ...newDojo, exams: [], graduationEvents: [] };
    localStorage.setItem(`dojo_${newDojo.ownerId}`, JSON.stringify(dojoWithExtras));
    setDojo(dojoWithExtras);
  };

  const handleDojoUpdate = (updatedDojo: Dojo) => {
     localStorage.setItem(`dojo_${updatedDojo.ownerId}`, JSON.stringify(updatedDojo));
     setDojo(updatedDojo);
  }

  const renderDiplomaGenerator = () => {
    switch (step) {
      case AppStep.SELECT_ART:
        return <MartialArtSelector arts={MARTIAL_ARTS} onSelect={handleArtSelect} />;
      case AppStep.FILL_FORM:
        if (!selectedArt) return null;
        return <DiplomaForm martialArt={selectedArt} onSubmit={handleFormSubmit} onBack={handleDiplomaFlowReset} />;
      case AppStep.GENERATE:
        return <DiplomaPreview 
                  isLoading={isLoading} 
                  error={error} 
                  diplomas={generatedDiplomas} 
                  formData={diplomaData!} 
                  onReset={handleDiplomaFlowReset} 
                />;
      default:
        return <div>Etapa desconhecida</div>;
    }
  }

  const renderCurrentView = () => {
    if (!dojo && (view === 'dojo_manager' || view === 'exams' || view === 'grading')) {
      return <CreateDojoForm onDojoCreated={handleDojoCreated} currentUser={currentUser!} />;
    }

    switch(view) {
      case 'dojo_manager':
        return <DojoManager initialDojo={dojo!} onUpdateDojo={handleDojoUpdate} onViewPublicProfile={handleViewPublicProfile}/>;
      case 'diploma_generator':
        return renderDiplomaGenerator();
      case 'exams':
        return <ExamCreator dojo={dojo!} onUpdateDojo={handleDojoUpdate} />;
      case 'grading':
        return <GradingView dojo={dojo!} onUpdateDojo={handleDojoUpdate} />;
      case 'public_profile':
        if (!publicProfileStudent || !dojo) return <Dashboard onNavigate={setView} />;
        return <PublicStudentProfile 
                  student={publicProfileStudent} 
                  dojoName={dojo.name} 
                  teamName={dojo.teamName} 
                  teamLogoUrl={dojo.teamLogoUrl}
                  onBack={() => setView('dojo_manager')} 
                />
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setView} />;
    }
  };
  
  if (!currentUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
       <Header 
        user={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default App;