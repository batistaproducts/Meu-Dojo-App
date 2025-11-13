import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { User, Dojo, Student, Exam, GraduationEvent, StudentGrading, DojoCreationData, Fight, GraduationHistoryEntry, MartialArt } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CreateDojoForm from './components/dojo/CreateDojoForm';
import DojoManager from './components/dojo/DojoManager';
import ExamCreator from './components/exams/ExamCreator';
import GradingView from './components/grading/GradingView';
import PublicStudentProfile from './components/student/PublicStudentProfile';
import Header from './components/layout/Header';
import SpinnerIcon from './components/icons/SpinnerIcon';
import PublicDojoPage from './components/dojo/PublicDojoPage';

export type AppView = 'dashboard' | 'dojo_manager' | 'exams' | 'grading' | 'public_profile' | 'public_dojo_page';

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

  const handleSaveSettings = async (updates: Partial<Dojo>) => {
    if (!dojo || Object.keys(updates).length === 0) return;

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

  const handleUnlinkStudent = async (studentId: string) => {
      const { error } = await supabase
        .from('students')
        .update({ dojo_id: null })
        .eq('id', studentId);

      if (error) {
        // Log the specific error message instead of the whole object to avoid "[object Object]" in the console.
        console.error('Supabase unlink student error:', error.message);
        // We will throw a more detailed error message to make debugging easier.
        // The RLS error message is the real issue.
        throw new Error(
          `Erro de segurança do banco de dados: ${error.message}. ` +
          `Isso geralmente é causado por uma política de segurança (RLS) no Supabase que impede a atualização. ` +
          `Verifique se a política da tabela 'students' permite que o 'dojo_id' seja definido como nulo.`
        );
      }
      
      setStudents(prev => prev.filter(s => s.id !== studentId));
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
    setView(newView);
  };
  
  const handleViewPublicProfile = (student: Student) => {
    setPublicProfileStudent(student);
    setView('public_profile');
  }
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- Render Logic ---
  const renderCurrentView = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-12 h-12" /></div>;
    }

    if (!dojo && (view === 'dojo_manager' || view === 'exams' || view === 'grading' || view === 'public_dojo_page')) {
      return <CreateDojoForm onDojoCreated={handleDojoCreated} />;
    }

    switch(view) {
      case 'dojo_manager':
        return <DojoManager dojo={dojo!} students={students} exams={exams} onSaveStudent={handleSaveStudent} onScheduleGraduation={handleScheduleGraduation} onSaveSettings={handleSaveSettings} onViewPublicProfile={handleViewPublicProfile} onAddFight={handleAddFight} onUnlinkStudent={handleUnlinkStudent} />;
      case 'exams':
        return <ExamCreator exams={exams} modalities={dojo?.modalities || []} onSaveExam={handleSaveExam} onDeleteExam={handleDeleteExam} />;
      case 'grading':
        return <GradingView events={graduationEvents} exams={exams} students={students} onFinalizeGrading={handleFinalizeGrading} />;
      case 'public_profile':
        if (!publicProfileStudent || !dojo) return <Dashboard onNavigate={setView} />;
        return <PublicStudentProfile student={publicProfileStudent} dojoName={dojo.name} teamName={dojo.team_name} teamLogoUrl={dojo.team_logo_url} onBack={() => setView('dojo_manager')} />;
      case 'public_dojo_page':
        return <PublicDojoPage dojo={dojo!} students={students} />;
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