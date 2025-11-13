
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { AppStep, DiplomaData, MartialArt, User, GeneratedDiploma, Dojo, Student, Exam, GraduationEvent, StudentGrading, DojoCreationData, Fight, GraduationHistoryEntry } from './types';
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
import SpinnerIcon from './components/icons/SpinnerIcon';

export type AppView = 'dashboard' | 'dojo_manager' | 'diploma_generator' | 'exams' | 'grading' | 'public_profile';

const App: React.FC = () => {
  // Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('dark');

  // Dojo Data State
  const [dojo, setDojo] = useState<Dojo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [graduationEvents, setGraduationEvents] = useState<GraduationEvent[]>([]);

  // UI/Navigation State
  const [view, setView] = useState<AppView>('dashboard');
  const [publicProfileStudent, setPublicProfileStudent] = useState<Student | null>(null);
  
  // Diploma Generator State
  const [diplomaStep, setDiplomaStep] = useState<AppStep>(AppStep.SELECT_ART);
  const [selectedArt, setSelectedArt] = useState<MartialArt | null>(null);
  const [diplomaData, setDiplomaData] = useState<DiplomaData | null>(null);
  const [generatedDiplomas, setGeneratedDiplomas] = useState<GeneratedDiploma[]>([]);

  // --- Effects ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        setDojo(null);
        setStudents([]);
        setExams([]);
        setGraduationEvents([]);
        setView('dashboard');
      }
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // --- Data Fetching ---
  const fetchData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const { data: dojoData, error: dojoError } = await supabase
        .from('dojos')
        .select('*')
        .eq('owner_id', currentUser.id)
        .single();
      
      if (dojoError && dojoError.code !== 'PGRST116') throw dojoError;

      if (dojoData) {
        setDojo(dojoData);
        const [studentsRes, examsRes, eventsRes] = await Promise.all([
          supabase.from('students').select('*').eq('dojo_id', dojoData.id),
          supabase.from('exams').select('*').eq('dojo_id', dojoData.id),
          supabase.from('graduation_events').select('*').eq('dojo_id', dojoData.id)
        ]);
        if (studentsRes.error || examsRes.error || eventsRes.error) throw studentsRes.error || examsRes.error || eventsRes.error;
        setStudents(studentsRes.data || []);
        setExams(examsRes.data || []);
        setGraduationEvents(eventsRes.data || []);
      } else {
        setDojo(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Data Handlers ---
  const handleDojoCreated = async (dojoData: DojoCreationData) => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('dojos')
      .insert({ ...dojoData, owner_id: currentUser.id })
      .select()
      .single();
    if (error) throw error;
    setDojo(data);
  };

  const handleSaveSettings = async (logoBase64?: string, teamLogoBase64?: string) => {
    if (!dojo) return;
    let updates: Partial<Dojo> = {};
    if (logoBase64) {
        updates.logo_url = logoBase64;
    }
    if (teamLogoBase64) {
        updates.team_logo_url = teamLogoBase64;
    }

    if (Object.keys(updates).length === 0) return;

    const { data, error } = await supabase.from('dojos').update(updates).eq('id', dojo.id).select().single();
    if (error) throw error;
    setDojo(data);
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'dojo_id'>, pictureBase64?: string) => {
    if (!dojo) return;
    
    if (pictureBase64) {
        studentData.profile_picture_url = pictureBase64;
    }
    
    const { data, error } = await supabase.from('students').upsert({ ...studentData, dojo_id: dojo.id }).select().single();
    if (error) throw error;

    setStudents(prev => studentData.id ? prev.map(s => s.id === data.id ? data : s) : [...prev, data]);
  };
  
  const handleAddFight = async (studentId: string, fight: Omit<Fight, 'id'>) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      const newFight: Fight = { ...fight, id: Date.now().toString() };
      const updatedFights = [...student.fights, newFight];
      const { data, error } = await supabase.from('students').update({ fights: updatedFights }).eq('id', studentId).select().single();
      if(error) throw error;
      setStudents(prev => prev.map(s => s.id === data.id ? data : s));
  };
  
  const handleSaveExam = async (examData: Omit<Exam, 'dojo_id'>) => {
      if (!dojo) return;
      const { data, error } = await supabase.from('exams').upsert({ ...examData, dojo_id: dojo.id }).select().single();
      if (error) throw error;
      setExams(prev => examData.id ? prev.map(e => e.id === data.id ? data : e) : [...prev, data]);
  };
  
  const handleDeleteExam = async (examId: string) => {
      const { error } = await supabase.from('exams').delete().eq('id', examId);
      if (error) throw error;
      setExams(prev => prev.filter(e => e.id !== examId));
  };
  
  const handleScheduleGraduation = async (exam_id: string, date: string, attendees: StudentGrading[]) => {
      if(!dojo) return;
      const { data, error } = await supabase.from('graduation_events').insert({ dojo_id: dojo.id, exam_id, date, attendees, status: 'scheduled' }).select().single();
      if(error) throw error;
      setGraduationEvents(prev => [...prev, data]);
  };

  const handleFinalizeGrading = async (event: GraduationEvent, updatedAttendees: StudentGrading[]) => {
      const approvedStudents = students.filter(s => updatedAttendees.find(a => a.studentId === s.id)?.isApproved);
      const exam = exams.find(e => e.id === event.exam_id);
      if (!exam) return;

      const studentUpdates = approvedStudents.map(student => {
          const attendeeInfo = updatedAttendees.find(a => a.studentId === student.id)!;
          const newHistoryEntry: GraduationHistoryEntry = {
              id: `${Date.now()}_${student.id}`,
              date: event.date,
              belt: exam.target_belt,
              grade: attendeeInfo.finalGrade!,
              examName: exam.name,
          };
          return supabase.from('students').update({
              belt: exam.target_belt,
              last_graduation_date: event.date,
              graduation_history: [...student.graduation_history, newHistoryEntry]
          }).eq('id', student.id);
      });

      const eventUpdate = supabase.from('graduation_events').update({
          attendees: updatedAttendees,
          status: 'completed'
      }).eq('id', event.id!);

      // FIX: Explicitly typing `results` prevents TypeScript from inferring it as `unknown[]`,
      // which was causing the "Property 'error' does not exist on type 'unknown'" error.
      const results: { error: any }[] = await Promise.all([...studentUpdates, eventUpdate]);
      const anyError = results.find(r => r.error);
      if (anyError) throw anyError.error;
      
      await fetchData();
  };

  // --- UI Handlers ---
  const toggleTheme = () => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        return newTheme;
    });
  };

  const handleNavigate = (newView: AppView) => {
    if (newView === 'dashboard') handleResetApp();
    else setView(newView);
  };
  
  const handleViewPublicProfile = (student: Student) => {
    setPublicProfileStudent(student);
    setView('public_profile');
  }
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const handleDiplomaFlowReset = () => {
    setDiplomaStep(AppStep.SELECT_ART);
    setSelectedArt(null);
    setDiplomaData(null);
    setGeneratedDiplomas([]);
    setError(null);
  };

  const handleResetApp = () => {
    handleDiplomaFlowReset();
    setView('dashboard');
  }

  // --- Diploma Generation ---
  const handleArtSelect = (art: MartialArt) => {
    setSelectedArt(art);
    setDiplomaStep(AppStep.FILL_FORM);
  };

  const handleFormSubmit = async (data: DiplomaData) => {
    setDiplomaData(data);
    setIsLoading(true);
    setError(null);
    setDiplomaStep(AppStep.GENERATE);

    try {
      if (!selectedArt) throw new Error("Arte marcial não selecionada.");
      const variations = await generateDiplomaVariations(data, selectedArt);
      setGeneratedDiplomas(variations);
    } catch (err: any) {
      setError("Falha ao gerar os diplomas. Verifique os dados e a imagem, e tente novamente.");
      console.error(err);
      setDiplomaStep(AppStep.FILL_FORM); 
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---
  const renderDiplomaGenerator = () => {
    switch (diplomaStep) {
      case AppStep.SELECT_ART:
        return <MartialArtSelector arts={MARTIAL_ARTS} onSelect={handleArtSelect} />;
      case AppStep.FILL_FORM:
        if (!selectedArt) return null;
        return <DiplomaForm martialArt={selectedArt} onSubmit={handleFormSubmit} onBack={handleDiplomaFlowReset} />;
      case AppStep.GENERATE:
        return <DiplomaPreview isLoading={isLoading} error={error} diplomas={generatedDiplomas} formData={diplomaData!} onReset={handleDiplomaFlowReset} />;
      default:
        return <div>Etapa desconhecida</div>;
    }
  }

  const renderCurrentView = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-12 h-12" /></div>;
    }

    if (!dojo && (view === 'dojo_manager' || view === 'exams' || view === 'grading')) {
      return <CreateDojoForm onDojoCreated={handleDojoCreated} />;
    }

    switch(view) {
      case 'dojo_manager':
        return <DojoManager dojo={dojo!} students={students} exams={exams} onSaveStudent={handleSaveStudent} onScheduleGraduation={handleScheduleGraduation} onSaveSettings={handleSaveSettings} onViewPublicProfile={handleViewPublicProfile} onAddFight={handleAddFight}/>;
      case 'diploma_generator':
        return renderDiplomaGenerator();
      case 'exams':
        return <ExamCreator exams={exams} modalities={dojo?.modalities || []} onSaveExam={handleSaveExam} onDeleteExam={handleDeleteExam} />;
      case 'grading':
        return <GradingView events={graduationEvents} exams={exams} students={students} onFinalizeGrading={handleFinalizeGrading} />;
      case 'public_profile':
        if (!publicProfileStudent || !dojo) return <Dashboard onNavigate={setView} />;
        return <PublicStudentProfile student={publicProfileStudent} dojoName={dojo.name} teamName={dojo.team_name} teamLogoUrl={dojo.team_logo_url} onBack={() => setView('dojo_manager')} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setView} />;
    }
  };
  
  if (!sessionChecked) {
     return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><SpinnerIcon className="w-16 h-16"/></div>;
  }
  
  if (!currentUser) {
    return <Auth onAuthSuccess={fetchData} />;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
       <Header user={currentUser} theme={theme} onToggleTheme={toggleTheme} onNavigate={handleNavigate} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default App;