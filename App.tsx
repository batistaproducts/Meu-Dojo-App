
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { User, UserRole, Dojo, Student, Exam, StudentUserLink, StudentRequest, GraduationEvent, Championship, Product, StudentGrading, Fight, DojoCreationData } from './types';
import { getPermissionsForRole, AppView } from './services/roleService';

import Auth from './components/Auth';
import Header from './components/layout/Header';
import Dashboard from './components/Dashboard';
import StudentDashboard from './components/student/StudentDashboard';

import CreateDojoForm from './components/dojo/CreateDojoForm';
import DojoManager from './components/dojo/DojoManager';
import ExamCreator from './components/exams/ExamCreator';
import GradingView from './components/grading/GradingView';
import ChampionshipManager from './components/championships/ChampionshipManager';
import PublicDojoPage from './components/dojo/PublicDojoPage';
import StoreView from './components/store/StoreView';
import SysAdminPanel from './components/admin/SysAdminPanel';
import DiplomaGenerator from './features/diploma/DiplomaGenerator';
import MetricsView from './components/metrics/MetricsView'; // Import new view
import SpinnerIcon from './components/icons/SpinnerIcon';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<AppView>('dashboard');
  const [permissions, setPermissions] = useState<AppView[]>([]);
  
  // Master/Admin Data
  const [dojo, setDojo] = useState<Dojo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [studentUserLinks, setStudentUserLinks] = useState<StudentUserLink[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [graduationEvents, setGraduationEvents] = useState<GraduationEvent[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // SysAdmin
  const [allDojos, setAllDojos] = useState<Dojo[]>([]);
  const [adminSelectedDojo, setAdminSelectedDojo] = useState<Dojo | null>(null);

  // Diploma
  const [studentsForDiploma, setStudentsForDiploma] = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null); 

  // Student View Data
  const [currentStudent, setCurrentStudent] = useState<(Student & { dojos: Dojo | null }) | null>(null);
  const [scheduledEvent, setScheduledEvent] = useState<GraduationEvent | null>(null);
  const [scheduledExam, setScheduledExam] = useState<Exam | null>(null);
  const [currentStudentRequest, setCurrentStudentRequest] = useState<(StudentRequest & { dojos: { name: string } | null }) | null>(null);


  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
          handleUserSession(session.user);
      } else {
          setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
          handleUserSession(session.user);
      } else {
          setUser(null);
          setUserRole(null);
          setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (sessionUser: User) => {
      setLoading(true);
      setUser(sessionUser);
      setCurrentUser(sessionUser);
      
      try {
        // Determine role
        let role: UserRole = 'M'; // Default
        
        // Check metadata or db for role. Using metadata as per Auth component.
        const roleMeta = sessionUser.user_metadata.user_role;
        if (roleMeta === 'student') role = 'A';
        // Simple check for SysAdmin (can be improved)
        if (sessionUser.email === 'admin@meudojo.com' || sessionUser.email === 'admin@sys.com') role = 'S';

        setUserRole(role);
        const perms = await getPermissionsForRole(role);
        setPermissions(perms);

        if (role === 'M') {
            await fetchMasterData(sessionUser.id);
        } else if (role === 'A') {
            await fetchStudentData(sessionUser.id);
        } else if (role === 'S') {
            await fetchSysAdminData();
        }

      } catch (e) {
          console.error("Error fetching user data:", e);
      } finally {
          setLoading(false);
      }
  };

  const fetchMasterData = async (userId: string) => {
      const { data: dojoData } = await supabase.from('dojos').select('*').eq('owner_id', userId).single();
      if (dojoData) {
          setDojo(dojoData);
          
          const { data: sData } = await supabase.from('students').select('*').eq('dojo_id', dojoData.id);
          setStudents(sData || []);

          const { data: eData } = await supabase.from('exams').select('*').eq('dojo_id', dojoData.id);
          setExams(eData || []);

          const { data: rData } = await supabase.from('student_requests').select('*').eq('dojo_id', dojoData.id).eq('status', 'pending');
          setStudentRequests(rData || []);

          const { data: lData } = await supabase.from('student_user_links').select('*'); // Filter by students normally
          setStudentUserLinks(lData || []);

          const { data: gData } = await supabase.from('graduation_events').select('*').eq('dojo_id', dojoData.id);
          setGraduationEvents(gData || []);

          const { data: cData } = await supabase.from('championships').select('*').eq('dojo_id', dojoData.id);
          setChampionships(cData || []);

          const { data: pData } = await supabase.from('products').select('*'); // fetch global for admin purposes, filtered in view
          setProducts(pData || []);
      } else {
          setDojo(null); // New master
      }
  };
  
  const fetchStudentData = async (userId: string) => {
      // 1. Check if linked student
      const { data: link } = await supabase.from('student_user_links').select('student_id').eq('user_id', userId).single();
      
      if (link) {
          const { data: student } = await supabase.from('students').select('*, dojos(*)').eq('id', link.student_id).single();
          setCurrentStudent(student);
          
          // Check for scheduled events
          if (student) {
             const { data: event } = await supabase.from('graduation_events')
                .select('*')
                .eq('student_id', student.id)
                .eq('status', 'scheduled')
                .order('date', { ascending: true })
                .limit(1)
                .single();
             
             setScheduledEvent(event);
             if (event) {
                 const { data: exam } = await supabase.from('exams').select('*').eq('id', event.exam_id).single();
                 setScheduledExam(exam);
             }
          }
      } else {
          // Check pending requests
           const { data: req } = await supabase.from('student_requests').select('*, dojos(name)').eq('user_id', userId).order('created_at', {ascending: false}).limit(1).single();
           setCurrentStudentRequest(req);
      }
  };

  const fetchSysAdminData = async () => {
      // Fetch ALL data for global analytics
      const { data } = await supabase.from('dojos').select('*');
      setAllDojos(data || []);
      
      const { data: p } = await supabase.from('products').select('*');
      setProducts(p || []);

      const { data: s } = await supabase.from('students').select('*');
      setStudents(s || []);

      const { data: g } = await supabase.from('graduation_events').select('*');
      setGraduationEvents(g || []);
      
      const { data: e } = await supabase.from('exams').select('*');
      setExams(e || []);
  };

  // --- Handlers ---

  const handleNavigate = (v: AppView) => {
      // When Admin navigates to top-level dashboards, reset the specific Dojo context to show global data
      if (userRole === 'S' && (v === 'dashboard' || v === 'sysadmin_panel' || v === 'metrics' || v === 'admin_store')) {
          setDojo(null);
          // Reload global data to ensure it's fresh if they were just editing a specific dojo
          if (v === 'dashboard' || v === 'metrics') fetchSysAdminData();
      }
      setView(v);
  };
  
  const handleDojoCreated = async (d: DojoCreationData) => {
      if (!user) return;
      const { data } = await supabase.from('dojos').insert({
        ...d, 
        owner_id: user.id,
        master_name: user.user_metadata.name // Save the master's name on creation
      }).select().single();
      
      if (data) {
          setDojo(data);
          fetchMasterData(user.id);
      }
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'dojo_id'>, pictureBase64?: string) => {
       if (!dojo) return;
       const payload: any = { ...studentData, dojo_id: dojo.id };
       if (pictureBase64 !== undefined) payload.profile_picture_url = pictureBase64;

       if (studentData.id) {
           await supabase.from('students').update(payload).eq('id', studentData.id);
       } else {
           await supabase.from('students').insert(payload);
       }
       
       // Refresh data based on role/context
       if (userRole === 'S') {
           // If Admin is in Dojo Context, refresh that dojo's data
           handleAdminEnterDojoContext(dojo, view);
       } else {
           await fetchMasterData(user!.id);
       }
  };

  const handleScheduleGraduation = async (examId: string, date: string, attendees: StudentGrading[]) => {
       if (!dojo) return;
       const events = attendees.map(a => ({
           dojo_id: dojo.id,
           exam_id: examId,
           date,
           student_id: a.studentId,
           status: 'scheduled' as const
       }));
       await supabase.from('graduation_events').insert(events);
       if (userRole === 'S') {
           handleAdminEnterDojoContext(dojo, view);
       } else {
           await fetchMasterData(user!.id);
       }
  };
  
  const handleSaveSettings = async (updates: Partial<Dojo>) => {
       if (!dojo) return;
       await supabase.from('dojos').update(updates).eq('id', dojo.id);
       
       if (userRole === 'S') {
            // Refresh global list as well
            const { data } = await supabase.from('dojos').select('*');
            setAllDojos(data || []);
            // Refresh current context
            setDojo({ ...dojo, ...updates });
       } else {
           await fetchMasterData(user!.id);
       }
  };
  
  const handleViewPublicProfile = (s: Student) => {
       console.log("View public profile:", s.name);
  };
  
  const handleAddFight = async (studentId: string, fight: Omit<Fight, 'id'>) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      const newFight = { ...fight, id: Date.now().toString() };
      const updatedFights = [...student.fights, newFight];
      
      await supabase.from('students').update({ fights: updatedFights }).eq('id', studentId);
      if (userRole === 'S') {
        handleAdminEnterDojoContext(dojo!, view);
      } else {
        await fetchMasterData(user!.id);
      }
  };
  
  const handleUnlinkStudent = async (studentId: string) => {
      await supabase.from('students').delete().eq('id', studentId);
      if (userRole === 'S') {
        handleAdminEnterDojoContext(dojo!, view);
      } else {
        await fetchMasterData(user!.id);
      }
  };
  
  const handleNavigateToDiplomaGenerator = (selectedStudents: Student[]) => {
       setStudentsForDiploma(selectedStudents);
       setView('diploma_generator');
  };
  
  const handleApproveStudentRequest = async (req: StudentRequest) => {
       const { data: student } = await supabase.from('students').select('id').eq('email', req.user_email).single();
       let studentId = student?.id;
       
       if (!studentId) {
            // Logic to determine default modality
            let assignedModality = 'Definir';
            let assignedBelt = { name: 'Branca', color: '#FFFFFF' };

            // Fetch dojo details to check modalities
            const { data: dojoData } = await supabase.from('dojos').select('modalities').eq('id', req.dojo_id).single();
            
            if (dojoData && dojoData.modalities && dojoData.modalities.length === 1) {
                const defaultModality = dojoData.modalities[0];
                assignedModality = defaultModality.name;
                if (defaultModality.belts.length > 0) {
                     assignedBelt = defaultModality.belts[0];
                }
            }
            // If modalities.length > 1, it remains 'Definir' and Belt remains 'Branca' (default)

            const { data: newStudent } = await supabase.from('students').insert({
               dojo_id: req.dojo_id,
               name: req.user_name,
               email: req.user_email,
               modality: assignedModality,
               belt: assignedBelt,
               last_graduation_date: new Date().toISOString().split('T')[0],
               tuition_fee: 0,
               payments: [],
               championships: [],
               fights: [],
               graduation_history: [{
                   id: Date.now().toString(),
                   date: new Date().toISOString().split('T')[0],
                   belt: assignedBelt,
                   grade: 0,
                   examName: 'Início'
               }]
           }).select().single();
           studentId = newStudent.id;
       } else {
           await supabase.from('students').update({ dojo_id: req.dojo_id }).eq('id', studentId);
       }

       await supabase.from('student_user_links').insert({
           student_id: studentId,
           user_id: req.user_id,
           user_role_type: 'A'
       });
       
       await supabase.from('student_requests').update({ status: 'approved' }).eq('id', req.id);
       if (userRole === 'S') {
         handleAdminEnterDojoContext(dojo!, view);
       } else {
         await fetchMasterData(user!.id);
       }
  };
  
  const handleRejectStudentRequest = async (requestId: string) => {
       await supabase.from('student_requests').update({ status: 'rejected' }).eq('id', requestId);
       if (userRole === 'S') {
         handleAdminEnterDojoContext(dojo!, view);
       } else {
         await fetchMasterData(user!.id);
       }
  };
  
  const handleSaveExam = async (exam: Omit<Exam, 'dojo_id'>) => {
      if (!dojo) return;
      const payload: any = { ...exam, dojo_id: dojo.id };
      if (exam.id) {
          await supabase.from('exams').update(payload).eq('id', exam.id);
      } else {
          await supabase.from('exams').insert(payload);
      }
      if (userRole === 'S') {
         handleAdminEnterDojoContext(dojo, view);
      } else {
         await fetchMasterData(user!.id);
      }
  };
  
  const handleDeleteExam = async (examId: string) => {
      await supabase.from('exams').delete().eq('id', examId);
      if (userRole === 'S') {
         handleAdminEnterDojoContext(dojo!, view);
      } else {
         await fetchMasterData(user!.id);
      }
  };
  
  const handleFinalizeGrading = async (originalRows: GraduationEvent[], updatedAttendees: StudentGrading[]) => {
      for (const att of updatedAttendees) {
          const event = originalRows.find(r => r.student_id === att.studentId);
          if (event) {
              await supabase.from('graduation_events').update({
                  status: 'completed',
                  final_grade: att.finalGrade,
                  is_approved: att.isApproved
              }).eq('id', event.id);
              
              if (att.isApproved) {
                  const student = students.find(s => s.id === att.studentId);
                  const exam = exams.find(e => e.id === event.exam_id);
                  if (student && exam) {
                      const newHistory = [...student.graduation_history, {
                          id: Date.now().toString(),
                          date: event.date,
                          belt: exam.target_belt,
                          grade: att.finalGrade || 0,
                          examName: exam.name
                      }];
                      await supabase.from('students').update({
                          belt: exam.target_belt,
                          last_graduation_date: event.date,
                          graduation_history: newHistory
                      }).eq('id', student.id);
                  }
              }
          }
      }
      if (userRole === 'S') {
         handleAdminEnterDojoContext(dojo!, view);
      } else {
         await fetchMasterData(user!.id);
      }
  };
  
  const handleSaveChampionship = async (championship: Omit<Championship, 'dojo_id' | 'id'> & { id?: string }) => {
      if (!dojo) return;
      const payload: any = { ...championship, dojo_id: dojo.id };
      if (championship.id) {
          await supabase.from('championships').update(payload).eq('id', championship.id);
      } else {
          await supabase.from('championships').insert(payload);
      }
      if (userRole === 'S') {
         handleAdminEnterDojoContext(dojo, view);
      } else {
         await fetchMasterData(user!.id);
      }
  };
  
  const handleDeleteChampionship = async (id: string) => {
      await supabase.from('championships').delete().eq('id', id);
      if (userRole === 'S') {
         handleAdminEnterDojoContext(dojo!, view);
      } else {
         await fetchMasterData(user!.id);
      }
  };
  
  const handleAddParticipation = async (championship: Championship, studentId: string, result: string) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      const newResult = { id: championship.id!, name: championship.name, date: championship.date, result };
      const updated = [...student.championships, newResult];
      await supabase.from('students').update({ championships: updated }).eq('id', studentId);
      if (userRole === 'S') {
         handleAdminEnterDojoContext(dojo!, view);
      } else {
         await fetchMasterData(user!.id);
      }
  };
  
  const handleRemoveParticipation = async (championshipId: string, studentId: string) => {
       const student = students.find(s => s.id === studentId);
       if (!student) return;
       const updated = student.championships.filter(c => c.id !== championshipId);
       await supabase.from('students').update({ championships: updated }).eq('id', studentId);
       if (userRole === 'S') {
         handleAdminEnterDojoContext(dojo!, view);
      } else {
         await fetchMasterData(user!.id);
      }
  };
  
  const handleAddProduct = async (product: Omit<Product, 'id' | 'dojo_id' | 'created_at'>) => {
       if (!dojo && userRole !== 'S') return;
       const payload: any = { ...product };
       if (view === 'admin_store' && userRole === 'S') {
            payload.dojo_id = null; // Force null for admin store
       } else if (dojo) {
            payload.dojo_id = dojo.id;
       }
       await supabase.from('products').insert(payload);
       if(userRole === 'S') fetchSysAdminData(); else fetchMasterData(user!.id);
  };
  
  const handleEditProduct = async (product: Product) => {
      await supabase.from('products').update(product).eq('id', product.id!);
      if(userRole === 'S') fetchSysAdminData(); else fetchMasterData(user!.id);
  };
  
  const handleDeleteProduct = async (productId: string) => {
      await supabase.from('products').delete().eq('id', productId);
      if(userRole === 'S') fetchSysAdminData(); else fetchMasterData(user!.id);
  };
  
  const handleAdminEnterDojoContext = async (d: Dojo, v: AppView) => {
      setDojo(d);
      // Fetch detailed data for the specific dojo
      const { data: sData } = await supabase.from('students').select('*').eq('dojo_id', d.id);
      setStudents(sData || []);
      
      const { data: gData } = await supabase.from('graduation_events').select('*').eq('dojo_id', d.id);
      setGraduationEvents(gData || []);
      
      const { data: eData } = await supabase.from('exams').select('*').eq('dojo_id', d.id);
      setExams(eData || []);

      const { data: rData } = await supabase.from('student_requests').select('*').eq('dojo_id', d.id).eq('status', 'pending');
      setStudentRequests(rData || []);

      setView(v);
  };

  // --- Render Logic ---
  const renderMasterView = () => {
    if (!permissions.includes(view)) {
        if (view !== 'dashboard') {
             setView('dashboard');
             return null;
        }
    }
    
    // Allow access to Admin Store / SysAdmin Panel even without a dojo
    if (!dojo && (view !== 'dashboard') && (view !== 'admin_store' || userRole !== 'S') && (view !== 'store' || userRole !== 'M') && (view !== 'sysadmin_panel' || userRole !== 'S') && (view !== 'metrics')) {
      return <CreateDojoForm onDojoCreated={handleDojoCreated} />;
    }
    
    switch(view) {
      case 'dojo_manager':
        if (userRole === 'S' && !dojo) {
             // If admin tries to access manager without selecting a dojo, redirect to panel
             return (
                 <SysAdminPanel 
                    dojos={allDojos} 
                    onConfigure={(dojoToEdit) => setAdminSelectedDojo(dojoToEdit)}
                    onViewStudents={(dojoToView) => handleAdminEnterDojoContext(dojoToView, 'dojo_manager')}
                    onViewGraduations={(dojoToView) => handleAdminEnterDojoContext(dojoToView, 'grading')}
                />
             );
        }
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
            userRole={userRole || undefined}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
        />;
      case 'store': // View para o Mestre
        return <StoreView 
            products={products} 
            isAdmin={true} // Mestre pode administrar seus produtos
            userRole={userRole || undefined}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
        />;
      case 'metrics':
        return <MetricsView students={students} dojo={dojo} />;
      case 'sysadmin_panel':
        return userRole === 'S' ? (
            <SysAdminPanel 
                dojos={allDojos} 
                onConfigure={(dojoToEdit) => setAdminSelectedDojo(dojoToEdit)}
                onViewStudents={(dojoToView) => handleAdminEnterDojoContext(dojoToView, 'dojo_manager')}
                onViewGraduations={(dojoToView) => handleAdminEnterDojoContext(dojoToView, 'grading')}
            />
        ) : <Dashboard onNavigate={handleNavigate} permissions={permissions} students={students} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} permissions={permissions} students={students} />;
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <SpinnerIcon className="w-16 h-16 text-red-600"/>
          </div>
      );
  }

  if (!user) {
      return <Auth onAuthSuccess={() => { /* managed by listener */ }} />;
  }
  
  if (userRole === 'A') {
      return <StudentDashboard student={currentStudent} user={user} scheduledEvent={scheduledEvent} scheduledExam={scheduledExam} studentRequest={currentStudentRequest} />;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
      <Header user={user} onNavigate={handleNavigate} onLogout={() => supabase.auth.signOut()} permissions={permissions} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderMasterView()}
      </main>
    </div>
  );
};

export default App;