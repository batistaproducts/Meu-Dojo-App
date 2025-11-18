
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { User, Dojo, Student, Exam, GraduationEvent, StudentGrading, DojoCreationData, Fight, GraduationHistoryEntry, MartialArt, Championship, ChampionshipResult, StudentUserLink, StudentRequest, UserRole, Product } from './types';
import { AppView, getPermissionsForRole } from './services/roleService';
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
import StoreView from './components/store/StoreView';
import SysAdminPanel from './components/admin/SysAdminPanel';
import DojoSettingsModal from './components/dojo/DojoSettingsModal';

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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<AppView[]>([]);
  const [studentProfile, setStudentProfile] = useState<(Student & { dojos: Dojo | null }) | null>(null);
  const [scheduledGraduationEvent, setScheduledGraduationEvent] = useState<GraduationEvent | null>(null);
  const [scheduledExamDetails, setScheduledExamDetails] = useState<Exam | null>(null);
  const [studentRequest, setStudentRequest] = useState<(StudentRequest & { dojos: { name: string; } | null; }) | null>(null);


  // Dojo Data State (for masters)
  const [dojo, setDojo] = useState<Dojo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [graduationEvents, setGraduationEvents] = useState<GraduationEvent[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [studentUserLinks, setStudentUserLinks] = useState<StudentUserLink[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);

  // SysAdmin State
  const [allDojos, setAllDojos] = useState<Dojo[]>([]);
  const [adminSelectedDojo, setAdminSelectedDojo] = useState<Dojo | null>(null);


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
        setPermissions([]);
        setStudentProfile(null);
        setDojo(null);
        setStudents([]);
        setExams([]);
        setGraduationEvents([]);
        setChampionships([]);
        setProducts([]);
        setStudentUserLinks([]);
        setStudentRequests([]);
        setScheduledGraduationEvent(null);
        setScheduledExamDetails(null);
        setStudentRequest(null);
        setAllDojos([]);
        setView('dashboard');
      }
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchDojoSpecificData = async (dojoId: string) => {
    const [studentsRes, examsRes, eventsRes, championshipsRes, requestsRes, linksRes] = await Promise.all([
      supabase.from('students').select('*').eq('dojo_id', dojoId),
      supabase.from('exams').select('*').eq('dojo_id', dojoId),
      supabase.from('graduation_events').select('*').eq('dojo_id', dojoId),
      supabase.from('championships').select('*').eq('dojo_id', dojoId),
      supabase.from('student_requests').select('*').eq('dojo_id', dojoId).eq('status', 'pending'),
      supabase.from('student_user_links').select('student_id, user_id').eq('user_role_type', 'A')
    ]);

    // Check for critical errors in core tables
    const criticalError = [studentsRes, examsRes, eventsRes, championshipsRes, requestsRes, linksRes].find(res => res.error)?.error;
    if (criticalError) throw criticalError;

    return {
        students: studentsRes.data || [],
        exams: examsRes.data || [],
        graduationEvents: eventsRes.data || [],
        championships: championshipsRes.data || [],
        studentRequests: requestsRes.data || [],
        studentUserLinks: linksRes.data || []
    };
  };

  const loadMasterData = async (userId: string, role: UserRole) => {
    // If Admin (S), fetch all dojos first
    if (role === 'S') {
        const { data: allDojosData, error: allDojosError } = await supabase
            .from('dojos')
            .select('*');
        
        if (allDojosError) throw allDojosError;
        setAllDojos(allDojosData || []);
    }

    const { data: dojoData, error: dojoError } = await supabase
        .from('dojos')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

    if (dojoError) throw dojoError;
    
    if (dojoData) {
        setDojo(dojoData);
        const fetchedData = await fetchDojoSpecificData(dojoData.id);
        setStudents(fetchedData.students);
        setExams(fetchedData.exams);
        setGraduationEvents(fetchedData.graduationEvents);
        setChampionships(fetchedData.championships);
        setStudentRequests(fetchedData.studentRequests);
        setStudentUserLinks(fetchedData.studentUserLinks);
        
        // Fetch products separately.
        const productsRes = await supabase
          .from('products')
          .select('*')
          .or(`dojo_id.eq.${dojoData.id},dojo_id.is.null`);

        if (productsRes.error) {
            const isIgnorable = productsRes.error.code === '42P01' || 
                                (productsRes.error.message && productsRes.error.message.includes('Could not find the table')) ||
                                (productsRes.error.message && productsRes.error.message.includes('does not exist'));
            if (!isIgnorable) throw productsRes.error;
        }
        setProducts(productsRes.data || []);

    } else {
        setDojo(null);
        
        // If SysAdmin, fetch products anyway
        if (role === 'S') {
             const { data: productsData, error: productsError } = await supabase.from('products').select('*');
             if (!productsError) setProducts(productsData || []);
        }
    }
  };


  useEffect(() => {
    const loadUserData = async () => {
        if (!currentUser) {
            setUserRole(null);
            setPermissions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Try to fetch the user's established link/role
            const { data: linkData, error: linkError } = await supabase
                .from('student_user_links')
                .select('student_id, user_role_type')
                .eq('user_id', currentUser.id)
                .maybeSingle(); // Use maybeSingle to avoid error if no link exists yet

            if (linkError) throw linkError;

            if (linkData) {
                // User has an established role (M, S, or approved A)
                const role = linkData.user_role_type as UserRole;
                const studentId = linkData.student_id;
                setUserRole(role);

                const userPermissions = await getPermissionsForRole(role);
                setPermissions(userPermissions);

                if (role === 'A' && studentId) {
                    const { data: studentData, error: studentError } = await supabase
                        .from('students')
                        .select('*, dojos(*)')
                        .eq('id', studentId)
                        .single();
                    if (studentError) throw studentError;
                    
                    setStudentProfile(studentData);
                    
                    const { data: eventData, error: eventError } = await supabase
                        .from('graduation_events')
                        .select('*')
                        .eq('student_id', studentId)
                        .eq('status', 'scheduled')
                        .limit(1)
                        .maybeSingle();
                    
                    if (eventData) {
                        setScheduledGraduationEvent(eventData);
                        const { data: examData, error: examError } = await supabase
                          .from('exams')
                          .select('*')
                          .eq('id', eventData.exam_id)
                          .single();
                        if (examError) console.error("Error fetching exam details:", examError.message);
                        else setScheduledExamDetails(examData);
                    } else {
                        setScheduledGraduationEvent(null);
                        setScheduledExamDetails(null);
                    }

                } else if (role === 'M' || role === 'S') {
                    await loadMasterData(currentUser.id, role);
                }
            } else {
                // No link found, check if they are a student awaiting approval
                const { data: requestData, error: requestError } = await supabase
                    .from('student_requests')
                    .select('*, dojos(name)')
                    .eq('user_id', currentUser.id)
                    .in('status', ['pending', 'rejected']) // Check for pending or rejected requests
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (requestError) throw requestError;

                if (requestData) {
                    // This is a student whose request is pending or was rejected
                    setUserRole('A'); // Treat them as a student for UI purposes
                    setPermissions(await getPermissionsForRole('A'));
                    setStudentRequest(requestData as any);
                    setStudentProfile(null);
                } else {
                    // No link and no request, check if we can recover the user's role from auth metadata.
                    const intendedRole = currentUser.user_metadata?.user_role;

                    if (intendedRole === 'master') {
                        // Workaround: A master user exists but has no link, likely due to a DB constraint
                        // (e.g., student_id is NOT NULL). Proceed by loading their data directly,
                        // bypassing the need for a link entry.
                        console.warn("User has 'master' role in metadata but no user link. Proceeding without link entry due to potential DB constraint.");
                        setUserRole('M');
                        const userPermissions = await getPermissionsForRole('M');
                        setPermissions(userPermissions);
                        await loadMasterData(currentUser.id, 'M');

                    } else if (intendedRole === 'student') {
                        // A student without a request is an orphan because we don't know which dojo they applied to.
                        // Provide a more specific error message.
                        throw new Error("Sua conta de aluno foi criada, mas a solicitação de matrícula falhou ou não foi encontrada. Por favor, tente se cadastrar novamente ou contate o responsável pela sua academia.");
                    } else {
                        // No link, no request, and no role in metadata. This is the original unrecoverable state.
                        throw new Error("Seu perfil não foi encontrado. Se você é um novo mestre, pode haver um atraso na configuração. Se for um aluno, sua solicitação pode não ter sido encontrada. Contate o suporte.");
                    }
                }
            }
        } catch (err: any) {
            setError(err.message);
            setUserRole(null);
            setPermissions([]);
        } finally {
            setIsLoading(false);
        }
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

  const handleAdminSaveSettings = async (updates: Partial<Dojo>) => {
      if (!adminSelectedDojo) return;
      
      const { data, error } = await supabase.from('dojos').update(updates).eq('id', adminSelectedDojo.id).select().single();
      if (error) throw error;
      
      // Update local allDojos state
      setAllDojos(prev => prev.map(d => d.id === data.id ? data : d));
      // Also update current dojo if it matches
      if (dojo && dojo.id === data.id) {
          setDojo(data);
      }
  };
  
  const handleAdminEnterDojoContext = async (targetDojo: Dojo, targetView: AppView) => {
      setIsLoading(true);
      try {
          const fetchedData = await fetchDojoSpecificData(targetDojo.id);
          
          setDojo(targetDojo);
          setStudents(fetchedData.students);
          setExams(fetchedData.exams);
          setGraduationEvents(fetchedData.graduationEvents);
          setChampionships(fetchedData.championships);
          setStudentRequests(fetchedData.studentRequests);
          setStudentUserLinks(fetchedData.studentUserLinks);
          
          // Refresh products for the specific dojo context + globals
          const productsRes = await supabase
            .from('products')
            .select('*')
            .or(`dojo_id.eq.${targetDojo.id},dojo_id.is.null`);
           if (!productsRes.error) setProducts(productsRes.data || []);
           
          setView(targetView);
      } catch (e: any) {
          console.error("Failed to load Dojo context:", e);
          alert(`Erro ao carregar dados do Dojo: ${e.message}`);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'dojo_id'>, pictureBase64?: string) => {
    if (!dojo) return;

    if (pictureBase64) {
      studentData.profile_picture_url = pictureBase64;
    }

    // --- UPDATE EXISTING STUDENT ---
    if (studentData.id) {
      const { data, error } = await supabase
        .from('students')
        .update({ ...studentData, dojo_id: dojo.id })
        .eq('id', studentData.id)
        .select()
        .single();
      if (error) throw error;
      setStudents(prev => prev.map(s => s.id === data.id ? data : s));
      return;
    }

    // --- CREATE NEW STUDENT PROFILE (WITHOUT AUTH) ---
    try {
        const { data: studentProfileData, error: studentError } = await supabase
            .from('students')
            .insert({ ...studentData, dojo_id: dojo.id })
            .select()
            .single();

        if (studentError) throw studentError;

        // Update local state
        setStudents(prev => [...prev, studentProfileData]);

    } catch (err: any) {
        console.error("Erro ao criar perfil do aluno:", err);
        throw new Error(`Falha ao criar o perfil do aluno: ${err.message}`);
    }
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
  
  const handleScheduleGraduation = async (exam_id: string, date: string, attendees: Pick<StudentGrading, 'studentId'>[]) => {
      if(!dojo) return;

      const eventsToInsert = attendees.map(attendee => ({
        dojo_id: dojo.id,
        exam_id,
        date,
        student_id: attendee.studentId,
        status: 'scheduled' as const,
      }));

      const { data, error } = await supabase.from('graduation_events').insert(eventsToInsert).select();
      if(error) throw error;
      setGraduationEvents(prev => [...prev, ...data]);
  };

  const handleFinalizeGrading = async (originalEventRows: GraduationEvent[], updatedAttendees: StudentGrading[]) => {
    if (!dojo) return;
    const exam = exams.find(e => e.id === originalEventRows[0].exam_id);
    if (!exam) return;

    const studentUpdates: Promise<any>[] = [];
    const eventUpdates: Promise<any>[] = [];

    for (const attendee of updatedAttendees) {
        const student = students.find(s => s.id === attendee.studentId);
        if (!student) continue;

        const eventRow = originalEventRows.find(r => r.student_id === attendee.studentId);
        if (eventRow) {
            eventUpdates.push(
                supabase.from('graduation_events').update({
                    final_grade: attendee.finalGrade,
                    is_approved: attendee.isApproved,
                    status: 'completed'
                }).eq('id', eventRow.id!)
            );
        }
        
        if (attendee.isApproved) {
            const newHistoryEntry: GraduationHistoryEntry = {
                id: `${Date.now()}_${student.id}`,
                date: originalEventRows[0].date,
                belt: exam.target_belt,
                grade: attendee.finalGrade!,
                examName: exam.name,
            };
            studentUpdates.push(
                supabase.from('students').update({
                    belt: exam.target_belt,
                    last_graduation_date: originalEventRows[0].date,
                    graduation_history: [...student.graduation_history, newHistoryEntry]
                }).eq('id', student.id)
            );
        }
    }
    
    const results = await Promise.all([...eventUpdates, ...studentUpdates]);
    const anyError = results.find(r => r.error);
    if (anyError) throw anyError.error;
    
    // Refresh local state
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

  const handleRejectStudentRequest = async (requestId: string) => {
      const { error } = await supabase
          .from('student_requests')
          .update({ status: 'rejected' })
          .eq('id', requestId);
      if (error) throw error;
      setStudentRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleApproveStudentRequest = async (request: StudentRequest) => {
      if (!dojo) return;

      const defaultModality = dojo.modalities[0];
      if (!defaultModality) throw new Error("O dojo não tem modalidades cadastradas para matricular um novo aluno.");
      
      const defaultBelt = defaultModality.belts[0];
      if (!defaultBelt) throw new Error(`A modalidade "${defaultModality.name}" não tem faixas cadastradas.`);
      
      const today = new Date().toISOString().split('T')[0];

      const newStudentPayload: Omit<Student, 'id'> = {
          name: request.user_name,
          email: request.user_email,
          dojo_id: request.dojo_id,
          modality: defaultModality.name,
          belt: defaultBelt,
          last_graduation_date: today,
          tuition_fee: 0,
          payments: [],
          championships: [],
          fights: [],
          graduation_history: [{
              id: Date.now().toString() + '_initial',
              date: today,
              belt: defaultBelt,
              grade: 0,
              examName: 'Cadastro Inicial',
          }],
      };

      let newStudent: Student | null = null;
      try {
        const { data, error: studentError } = await supabase.from('students').insert(newStudentPayload).select().single();
        if (studentError) throw studentError;
        newStudent = data;

        const { error: linkError } = await supabase.from('student_user_links').insert({ user_id: request.user_id, student_id: newStudent.id, user_role_type: 'A' });
        if (linkError) throw linkError;
        
        const { error: requestError } = await supabase.from('student_requests').update({ status: 'approved' }).eq('id', request.id);
        if (requestError) throw requestError;

        // --- Success ---
        setStudents(prev => [...prev, newStudent!]);
        setStudentRequests(prev => prev.filter(req => req.id !== request.id));
        setStudentUserLinks(prev => [...prev, { user_id: request.user_id, student_id: newStudent!.id!, user_role_type: 'A' }]);

      } catch (error: any) {
         console.error("Erro no processo de aprovação:", error.message);
         // --- Rollback Logic ---
         if (newStudent) {
            console.warn(`ROLLBACK: Deletando perfil do aluno ${newStudent.id}`);
            // Attempt to delete the student user link first if it exists
            await supabase.from('student_user_links').delete().match({ student_id: newStudent.id });
            // Then delete the student profile
            await supabase.from('students').delete().match({ id: newStudent.id });
         }
         throw new Error(`Ocorreu um erro: ${error.message}. As alterações foram desfeitas.`);
      }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'dojo_id' | 'created_at'>) => {
      let dojoId = null;
      
      // If we are in the admin_store view, we force dojo_id to be null to create a global product.
      // Otherwise, if a dojo is loaded, we use its ID.
      if (view !== 'admin_store' && dojo) {
        dojoId = dojo.id;
      } 
      // If in admin_store view or no dojo loaded, dojoId remains null.

      const { data, error } = await supabase
          .from('products')
          .insert({ ...productData, dojo_id: dojoId })
          .select()
          .single();
      
      if(error) throw error;
      setProducts(prev => [...prev, data]);
  };

  const handleEditProduct = async (product: Product) => {
      const { data, error } = await supabase
          .from('products')
          .update({ 
              name: product.name, 
              description: product.description, 
              price: product.price, 
              affiliate_url: product.affiliate_url, 
              image_url: product.image_url,
              status: product.status,
              market: product.market 
          })
          .eq('id', product.id)
          .select()
          .single();

      if(error) throw error;
      setProducts(prev => prev.map(p => p.id === data.id ? data : p));
  };

  const handleDeleteProduct = async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if(error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
  };


  // --- UI Handlers ---
  const handleNavigate = (newView: AppView) => {
    if (!permissions.includes(newView)) {
        console.warn(`Access denied to view: ${newView}`);
        return;
    }
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
    if (!permissions.includes(view)) {
        setView('dashboard');
        // The component will re-render, and on the next pass, this will render the dashboard.
        // Return dashboard immediately to avoid rendering an unauthorized component for a frame.
        return <Dashboard onNavigate={handleNavigate} permissions={permissions} />;
    }
    
    if (!dojo && (view !== 'dashboard') && (view !== 'admin_store' || userRole !== 'S') && (view !== 'store' || userRole !== 'M') && (view !== 'sysadmin_panel' || userRole !== 'S')) {
      return <CreateDojoForm onDojoCreated={handleDojoCreated} />;
    }
    
    switch(view) {
      case 'dojo_manager':
        return <DojoManager dojo={dojo!} students={students} exams={exams} studentUserLinks={studentUserLinks} studentRequests={studentRequests} onSaveStudent={handleSaveStudent} onScheduleGraduation={handleScheduleGraduation} onSaveSettings={handleSaveSettings} onViewPublicProfile={handleViewPublicProfile} onAddFight={handleAddFight} onUnlinkStudent={handleUnlinkStudent} onNavigateToDiplomaGenerator={handleNavigateToDiplomaGenerator} onApproveRequest={handleApproveStudentRequest} onRejectRequest={handleRejectStudentRequest} />;
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
      case 'admin_store':
        return <StoreView 
            products={products} 
            isAdmin={true}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
        />;
      case 'store': // View para o Mestre
        return <StoreView 
            products={products} 
            isAdmin={true} // Mestre pode administrar seus produtos
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
        />;
      case 'sysadmin_panel':
        return userRole === 'S' ? (
            <SysAdminPanel 
                dojos={allDojos} 
                onConfigure={(dojoToEdit) => setAdminSelectedDojo(dojoToEdit)}
                onViewStudents={(dojoToView) => handleAdminEnterDojoContext(dojoToView, 'dojo_manager')}
                onViewGraduations={(dojoToView) => handleAdminEnterDojoContext(dojoToView, 'grading')}
            />
        ) : <Dashboard onNavigate={handleNavigate} permissions={permissions} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} permissions={permissions} />;
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
    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col justify-center items-center text-center p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-4">Ocorreu um Erro</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
                <button 
                    onClick={handleLogout} 
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
                >
                    Voltar para o Login
                </button>
            </div>
        </div>
    );
  }

  if (userRole === 'A') {
    return <StudentDashboard 
        student={studentProfile} 
        user={currentUser} 
        scheduledEvent={scheduledGraduationEvent}
        scheduledExam={scheduledExamDetails}
        studentRequest={studentRequest}
    />;
  }
  
  if (userRole === 'M' || userRole === 'S') {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
         <Header user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} permissions={permissions} />
        <main className="container mx-auto px-4 py-8">
          {renderMasterView()}
        </main>

        {adminSelectedDojo && (
            <DojoSettingsModal 
                dojo={adminSelectedDojo}
                onClose={() => setAdminSelectedDojo(null)}
                onSave={handleAdminSaveSettings}
            />
        )}
      </div>
    );
  }

  return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center"><p>Carregando perfil de usuário...</p></div>;
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
