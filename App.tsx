import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { User, Dojo, Student, Exam, GraduationEvent, StudentGrading, DojoCreationData, Fight, GraduationHistoryEntry, MartialArt, Championship, ChampionshipResult, StudentUserLink } from './types';
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
import DiplomaGenerator from './features/diploma/DiplomaGenerator';
import StudentDashboard from './components/student/StudentDashboard';
import ChampionshipManager from './components/championships/ChampionshipManager';

export type AppView = 'dashboard' | 'dojo_manager' | 'exams' | 'grading' | 'public_dojo_page' | 'diploma_generator' | 'championships';

// --- Public Page Loader Components ---

const PublicDojoPageLoader: React.FC<{ dojoIdOrSlug: string }> = ({ dojoIdOrSlug }) => {
  const [dojo, setDojo] = useState<Dojo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const metaDesc = document.querySelector('meta[name="description"]');

    const fetchPublicDojoData = async () => {
      try {
        setIsLoading(true);
        const { data: dojoData, error: dojoError } = await supabase
          .from('dojos')
          .select('*')
          .eq('id', dojoIdOrSlug)
          .single();

        if (dojoError) throw dojoError;
        if (!dojoData) throw new Error('Dojo não encontrado.');
        
        setDojo(dojoData);

        // SEO Update
        document.title = `Dojo ${dojoData.name} | ${dojoData.team_name}`;
        if (metaDesc) {
          metaDesc.setAttribute('content', `Página pública do dojo ${dojoData.name}, equipe ${dojoData.team_name}. Conheça nossas modalidades e atletas.`);
        }

        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('dojo_id', dojoData.id);
        
        if (studentsError) throw studentsError;

        setStudents(studentsData || []);
      } catch (err: any) {
        setError(err.message);
        document.title = 'Erro | Meu Dojo';
        if (metaDesc) {
          metaDesc.setAttribute('content', 'Não foi possível carregar a página deste dojo.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicDojoData();

    return () => {
        document.title = 'Meu Dojo';
        if (metaDesc) {
          metaDesc.setAttribute('content', 'Uma aplicação para gerenciar seu Dojo, alunos, graduações e emissão de diplomas.');
        }
    };
  }, [dojoIdOrSlug]);

  const handleViewPublicProfile = (student: Student) => {
    window.location.href = `/student/${student.id}`;
  };

  if (isLoading) {
    return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><SpinnerIcon className="w-16 h-16"/></div>;
  }
  if (error) {
    return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><p className="text-red-500">{error}</p></div>;
  }
  if (!dojo) {
    return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><p>Dojo não encontrado.</p></div>;
  }

  return (
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
          <main className="container mx-auto px-4 py-8">
              <PublicDojoPage dojo={dojo} students={students} onViewPublicProfile={handleViewPublicProfile} />
          </main>
      </div>
  );
};

const PublicStudentProfileLoader: React.FC<{ studentId: string }> = ({ studentId }) => {
    const [student, setStudent] = useState<Student | null>(null);
    const [dojo, setDojo] = useState<Dojo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const metaDesc = document.querySelector('meta[name="description"]');

        const fetchPublicStudentData = async () => {
            try {
                setIsLoading(true);
                const { data: studentData, error: studentError } = await supabase
                    .from('students')
                    .select('*')
                    .eq('id', studentId)
                    .single();

                if (studentError) throw studentError;
                if (!studentData) throw new Error('Aluno não encontrado.');
                setStudent(studentData);

                // SEO Update part 1
                document.title = `Perfil de ${studentData.name}`;

                if (studentData.dojo_id) {
                    const { data: dojoData, error: dojoError } = await supabase
                        .from('dojos')
                        .select('*')
                        .eq('id', studentData.dojo_id)
                        .single();

                    if (dojoError && dojoError.code !== 'PGRST116') throw dojoError;

                    if (dojoData) {
                        setDojo(dojoData);
                        // SEO Update part 2
                        document.title = `Perfil de ${studentData.name} | ${dojoData.name}`;
                        if (metaDesc) {
                          metaDesc.setAttribute('content', `Perfil público do atleta ${studentData.name}, praticante de ${studentData.modality} na equipe ${dojoData.team_name}.`);
                        }
                    }
                }

            } catch (err: any) {
                setError(err.message);
                document.title = 'Erro | Meu Dojo';
                if (metaDesc) {
                  metaDesc.setAttribute('content', 'Não foi possível carregar o perfil deste aluno.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicStudentData();

        return () => {
            document.title = 'Meu Dojo';
            if (metaDesc) {
              metaDesc.setAttribute('content', 'Uma aplicação para gerenciar seu Dojo, alunos, graduações e emissão de diplomas.');
            }
        };
    }, [studentId]);

    if (isLoading) {
        return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><SpinnerIcon className="w-16 h-16"/></div>;
    }
    if (error) {
        return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><p className="text-red-500">{error}</p></div>;
    }
    if (!student) {
        return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><p>Não foi possível carregar o perfil do aluno.</p></div>;
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
            <main className="container mx-auto px-4 py-8">
                <PublicStudentProfile 
                    student={student} 
                    dojoName={dojo?.name}
                    teamName={dojo?.team_name}
                    teamLogoUrl={dojo?.team_logo_url}
                    onBack={() => window.history.back()}
                />
            </main>
        </div>
    );
};


// --- Authenticated App Component ---

const AuthenticatedApp: React.FC = () => {
  // Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role-based State
  const [userRole, setUserRole] = useState<'master' | 'student' | null>(null);
  const [studentProfile, setStudentProfile] = useState<(Student & { dojos: Dojo | null }) | null>(null);

  // Dojo Data State (for masters)
  const [dojo, setDojo] = useState<Dojo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [graduationEvents, setGraduationEvents] = useState<GraduationEvent[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [studentUserLinks, setStudentUserLinks] = useState<StudentUserLink[]>([]);

  // Diploma Generator State
  const [studentsForDiploma, setStudentsForDiploma] = useState<Student[]>([]);

  // UI/Navigation State
  const [view, setView] = useState<AppView>('dashboard');
  
  // --- Effects ---
  useEffect(() => {
    setSessionChecked(false);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (!session) {
        // Reset everything on logout
        setUserRole(null);
        setStudentProfile(null);
        setDojo(null);
        setStudents([]);
        setExams([]);
        setGraduationEvents([]);
        setChampionships([]);
        setStudentUserLinks([]);
        setView('dashboard');
      }
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // 1. Is user a dojo owner?
      const { data: dojoData, error: dojoError } = await supabase
        .from('dojos')
        .select('*')
        .eq('owner_id', currentUser.id)
        .single();
      
      if (dojoError && dojoError.code !== 'PGRST116') {
        setError("Erro ao buscar dados do dojo: " + dojoError.message);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      if (dojoData) {
        // User is a MASTER
        setDojo(dojoData);
        const [studentsRes, examsRes, eventsRes, championshipsRes] = await Promise.all([
          supabase.from('students').select('*').eq('dojo_id', dojoData.id),
          supabase.from('exams').select('*').eq('dojo_id', dojoData.id),
          supabase.from('graduation_events').select('*').eq('dojo_id', dojoData.id),
          supabase.from('championships').select('*').eq('dojo_id', dojoData.id)
        ]);
        if (studentsRes.error || examsRes.error || eventsRes.error || championshipsRes.error) {
            setError( (studentsRes.error || examsRes.error || eventsRes.error || championshipsRes.error)!.message );
        } else {
            const fetchedStudents = studentsRes.data || [];
            setStudents(fetchedStudents);
            setExams(examsRes.data || []);
            setGraduationEvents(eventsRes.data || []);
            setChampionships(championshipsRes.data || []);

            const studentIds = fetchedStudents.map(s => s.id!).filter(Boolean);
            if (studentIds.length > 0) {
                const { data: linksData, error: linksError } = await supabase
                    .from('student_user_links')
                    .select('student_id, user_id')
                    .in('student_id', studentIds);
                if (linksError) {
                    setError("Erro ao buscar vínculos de alunos: " + linksError.message);
                } else {
                    setStudentUserLinks(linksData || []);
                }
            } else {
                setStudentUserLinks([]);
            }
        }
        setUserRole('master');
      } else {
        // Not a dojo owner. Are they a STUDENT?
        // 1. Check for an existing link
        const { data: linkData, error: linkError } = await supabase
            .from('student_user_links')
            .select('student_id')
            .eq('user_id', currentUser.id)
            .single();

        if (linkError && linkError.code !== 'PGRST116') { // PGRST116: no rows found
            setError("Erro ao buscar vínculo de aluno: " + linkError.message);
            setIsLoading(false);
            return;
        }

        let studentId: string | null = linkData?.student_id || null;

        // 2. If no link, try to link by email
        if (!studentId && currentUser.email) {
            const { data: studentByEmail, error: studentByEmailError } = await supabase
                .from('students')
                .select('id')
                .eq('email', currentUser.email)
                .single();
            
            if (studentByEmail && !studentByEmailError) {
                // Found a student by email, create the link
                const { error: insertLinkError } = await supabase
                    .from('student_user_links')
                    .insert({ user_id: currentUser.id, student_id: studentByEmail.id });

                if (insertLinkError) {
                    setError("Falha ao vincular conta de aluno: " + insertLinkError.message);
                } else {
                    studentId = studentByEmail.id; // Link created, proceed to fetch profile
                }
            }
        }
        
        // 3. If we have a studentId (either from link or just created), fetch the full profile
        if (studentId) {
            const { data: studentData, error: studentError } = await supabase
                .from('students')
                .select('*, dojos(*)')
                .eq('id', studentId)
                .single();

            if (studentError) {
                setError("Erro ao buscar perfil de aluno: " + studentError.message);
            } else if (studentData) {
                setUserRole('student');
                setStudentProfile(studentData);
            } else {
                // Link exists but student profile not found, might be an issue.
                // For now, treat as non-student.
                setUserRole('master');
                setDojo(null);
            }
        } else {
            // No link, no email match -> new MASTER
            setUserRole('master');
            setDojo(null);
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, [currentUser]);

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
        console.error('Supabase unlink student error:', error.message);
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
      if (!exam || !dojo) return;

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
      
      const { data: updatedStudents } = await supabase.from('students').select('*').eq('dojo_id', dojo.id);
      const { data: updatedEvents } = await supabase.from('graduation_events').select('*').eq('dojo_id', dojo.id);
      setStudents(updatedStudents || []);
      setGraduationEvents(updatedEvents || []);
  };
  
  const handleSaveChampionship = async (championshipData: Omit<Championship, 'dojo_id' | 'id'> & { id?: string }) => {
    if (!dojo) return;
    const { data, error } = await supabase.from('championships').upsert({ ...championshipData, dojo_id: dojo.id }).select().single();
    if (error) throw error;
    setChampionships(prev => championshipData.id ? prev.map(c => c.id === data.id ? data : c) : [...prev, data]);
  };

  const handleDeleteChampionship = async (championshipId: string) => {
    if (!dojo) return;
    // First, remove participations from all students
    const studentUpdates = students
        .filter(s => s.championships.some(c => c.id === championshipId))
        .map(student => {
            const updatedChampionships = student.championships.filter(c => c.id !== championshipId);
            return supabase.from('students').update({ championships: updatedChampionships }).eq('id', student.id);
        });
    if (studentUpdates.length > 0) {
      const results = await Promise.all(studentUpdates);
      const anyError = results.find(r => r.error);
      if (anyError) throw anyError.error;
    }
    // Then, delete the championship itself
    const { error: deleteError } = await supabase.from('championships').delete().eq('id', championshipId);
    if (deleteError) throw deleteError;
    // Finally, update local state
    const { data: updatedStudents } = await supabase.from('students').select('*').eq('dojo_id', dojo.id);
    setStudents(updatedStudents || []);
    setChampionships(prev => prev.filter(c => c.id !== championshipId));
  };
  
  const handleAddParticipation = async (championship: Championship, studentId: string, result: string) => {
      const student = students.find(s => s.id === studentId);
      if (!student || !championship.id) return;
      const newResult: ChampionshipResult = {
          id: championship.id,
          name: championship.name,
          date: championship.date,
          result: result,
      };
      const updatedChampionships = [...student.championships, newResult];
      const { data, error } = await supabase.from('students').update({ championships: updatedChampionships }).eq('id', studentId).select().single();
      if (error) throw error;
      setStudents(prev => prev.map(s => s.id === data.id ? data : s));
  };

  const handleRemoveParticipation = async (championshipId: string, studentId: string) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      const updatedChampionships = student.championships.filter(c => c.id !== championshipId);
      const { data, error } = await supabase.from('students').update({ championships: updatedChampionships }).eq('id', studentId).select().single();
      if (error) throw error;
      setStudents(prev => prev.map(s => s.id === data.id ? data : s));
  };


  // --- UI Handlers ---
  const handleNavigate = (newView: AppView) => {
    if (newView === 'diploma_generator') {
        setStudentsForDiploma([]);
    }
    setView(newView);
  };
  
  const handleViewPublicProfile = (student: Student) => {
    window.open(`/student/${student.id}`, '_blank');
  }

  const handleNavigateToDiplomaGenerator = (studentsToCertify: Student[]) => {
    setStudentsForDiploma(studentsToCertify);
    setView('diploma_generator');
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- Render Logic ---
  const renderMasterView = () => {
    if (!dojo && (view === 'dojo_manager' || view === 'exams' || view === 'grading' || view === 'public_dojo_page' || view === 'diploma_generator' || view === 'championships')) {
      return <CreateDojoForm onDojoCreated={handleDojoCreated} />;
    }

    switch(view) {
      case 'dojo_manager':
        return <DojoManager dojo={dojo!} students={students} exams={exams} studentUserLinks={studentUserLinks} onSaveStudent={handleSaveStudent} onScheduleGraduation={handleScheduleGraduation} onSaveSettings={handleSaveSettings} onViewPublicProfile={handleViewPublicProfile} onAddFight={handleAddFight} onUnlinkStudent={handleUnlinkStudent} onNavigateToDiplomaGenerator={handleNavigateToDiplomaGenerator} />;
      case 'exams':
        return <ExamCreator exams={exams} modalities={dojo?.modalities || []} onSaveExam={handleSaveExam} onDeleteExam={handleDeleteExam} />;
      case 'grading':
        return <GradingView events={graduationEvents} exams={exams} students={students} onFinalizeGrading={handleFinalizeGrading} />;
      case 'championships':
        return <ChampionshipManager championships={championships} students={students} onSaveChampionship={handleSaveChampionship} onDeleteChampionship={handleDeleteChampionship} onAddParticipation={handleAddParticipation} onRemoveParticipation={handleRemoveParticipation} />;
      case 'public_dojo_page':
        return <PublicDojoPage dojo={dojo!} students={students} onViewPublicProfile={handleViewPublicProfile} isOwnerPreview={true} />;
      case 'diploma_generator':
        return <DiplomaGenerator students={studentsForDiploma} dojo={dojo!} onBack={() => setView('dojo_manager')} user={currentUser!} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setView} />;
    }
  };
  
  if (!sessionChecked) {
     return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><SpinnerIcon className="w-16 h-16"/></div>;
  }
  
  if (!currentUser) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  if (isLoading) {
    return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><SpinnerIcon className="w-16 h-16"/></div>;
  }

  if (error) {
    return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><p className="text-red-500">{error}</p></div>;
  }

  if (userRole === 'student' && studentProfile) {
    return <StudentDashboard student={studentProfile} user={currentUser} />;
  }
  
  if (userRole === 'master') {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
         <Header user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          {renderMasterView()}
        </main>
      </div>
    );
  }

  return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><SpinnerIcon className="w-16 h-16"/></div>;
};

// --- Main App Router ---

const App: React.FC = () => {
  const pathParts = window.location.pathname.split('/').filter(Boolean);

  if (pathParts[0] === 'dojo' && pathParts[1]) {
    return <PublicDojoPageLoader dojoIdOrSlug={pathParts[1]} />;
  }

  if (pathParts[0] === 'student' && pathParts[1]) {
    return <PublicStudentProfileLoader studentId={pathParts[1]} />;
  }

  return <AuthenticatedApp />;
};


export default App;