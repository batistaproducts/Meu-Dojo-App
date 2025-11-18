
import React, { useState, useMemo } from 'react';
import { GraduationEvent, Exam, Student, StudentGrading } from '../../types';

interface GroupedEvent {
    id: string;
    date: string;
    exam: Exam | undefined;
    rows: GraduationEvent[];
}

interface GradingViewProps {
  events: GraduationEvent[];
  exams: Exam[];
  students: Student[];
  onFinalizeGrading: (originalEventRows: GraduationEvent[], updatedAttendees: StudentGrading[]) => Promise<void>;
}

const GradingView: React.FC<GradingViewProps> = ({ events, exams, students, onFinalizeGrading }) => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [grades, setGrades] = useState<Record<string, number>>({});
    
    const groupedEvents = useMemo(() => {
        const groups: Record<string, { exam: Exam | undefined; date: string; rows: GraduationEvent[] }> = {};
        events
            .filter(e => e.status === 'scheduled')
            .forEach(eventRow => {
                const groupId = `${eventRow.date}-${eventRow.exam_id}`;
                if (!groups[groupId]) {
                    groups[groupId] = {
                        exam: exams.find(ex => ex.id === eventRow.exam_id),
                        date: eventRow.date,
                        rows: [],
                    };
                }
                groups[groupId].rows.push(eventRow);
            });
        return Object.entries(groups).map(([id, data]) => ({ id, ...data }));
    }, [events, exams]);

    const completedEvents = useMemo(() => {
        const groups: Record<string, { exam: Exam | undefined; date: string; rows: GraduationEvent[] }> = {};
         events
            .filter(e => e.status === 'completed')
            .forEach(eventRow => {
                const groupId = `${eventRow.date}-${eventRow.exam_id}`;
                if (!groups[groupId]) {
                    groups[groupId] = {
                        exam: exams.find(ex => ex.id === eventRow.exam_id),
                        date: eventRow.date,
                        rows: [],
                    };
                }
                groups[groupId].rows.push(eventRow);
            });
        return Object.values(groups);
    }, [events, exams]);

    const selectedEvent = useMemo(() => groupedEvents.find(e => e.id === selectedEventId), [selectedEventId, groupedEvents]);
    const selectedExam = selectedEvent?.exam;

    const handleGradeChange = (studentId: string, grade: number) => {
        setGrades(prev => ({ ...prev, [studentId]: Math.max(0, Math.min(10, grade)) }));
    };

    const handleFinalizeGradingWrapper = async () => {
        if (!selectedEvent || !selectedExam) return;

        const updatedAttendees = selectedEvent.rows.map(row => {
            const finalGrade = grades[row.student_id];
            const isApproved = finalGrade !== undefined && finalGrade >= selectedExam.min_passing_grade;
            return { studentId: row.student_id, finalGrade, isApproved };
        });

        await onFinalizeGrading(selectedEvent.rows, updatedAttendees);

        setSelectedEventId(null);
        setGrades({});
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold font-cinzel text-gray-900 dark:text-white mb-8">Gerenciar Graduações</h2>
            
            {!selectedEvent && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Eventos Agendados</h3>
                    <div className="space-y-3">
                        {groupedEvents.map(eventGroup => (
                            <div key={eventGroup.id} onClick={() => setSelectedEventId(eventGroup.id)} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <p className="font-semibold">{eventGroup.exam?.name || 'Prova não encontrada'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Data: {new Date(eventGroup.date + 'T00:00:00').toLocaleDateString('pt-BR')} | Alunos: {eventGroup.rows.length}</p>
                            </div>
                        ))}
                        {groupedEvents.length === 0 && (
                             <p className="text-center text-gray-400 dark:text-gray-500 py-8">Nenhum evento de graduação agendado.</p>
                        )}
                    </div>
                </div>
            )}

            {selectedEvent && selectedExam && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-bold">{selectedExam.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400">Data: {new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('pt-BR')} | Nota Mínima: {selectedExam.min_passing_grade}</p>
                        </div>
                        <button onClick={() => setSelectedEventId(null)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">&larr; Voltar</button>
                    </div>

                    <div className="space-y-6">
                        {selectedEvent.rows.map(row => {
                            const student = students.find(s => s.id === row.student_id);
                            if (!student) return null;
                            const grade = grades[student.id!];
                            const isApproved = grade !== undefined && grade >= selectedExam.min_passing_grade;
                            
                            return (
                                <div key={student.id} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div>
                                            <p className="font-bold text-lg">{student.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Graduação Atual: {student.belt.name}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label htmlFor={`grade-${student.id}`} className="font-semibold">Nota Final:</label>
                                            <input 
                                                id={`grade-${student.id}`}
                                                type="number"
                                                min="0" max="10" step="0.5"
                                                value={grade || ''}
                                                onChange={e => handleGradeChange(student.id!, parseFloat(e.target.value))}
                                                className="w-24 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-2 text-center"
                                            />
                                            {grade !== undefined && (
                                                <span className={`font-bold text-lg ${isApproved ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isApproved ? 'APROVADO' : 'REPROVADO'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <button onClick={handleFinalizeGradingWrapper} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                            Finalizar e Salvar Graduação
                        </button>
                    </div>
                </div>
            )}
            
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Eventos Concluídos</h3>
                <div className="space-y-3">
                    {completedEvents.map(eventGroup => (
                        <div key={eventGroup.id} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                            <p className="font-semibold">{eventGroup.exam?.name || 'Prova não encontrada'} ({new Date(eventGroup.date + 'T00:00:00').toLocaleDateString('pt-BR')})</p>
                            <ul className="mt-2 text-sm space-y-1">
                                {eventGroup.rows.map(row => {
                                    const student = students.find(s => s.id === row.student_id);
                                    return (
                                        <li key={row.id} className={`flex justify-between ${row.is_approved ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                            <span>{student?.name || 'Aluno não encontrado'}</span>
                                            <span>Nota: {row.final_grade} - {row.is_approved ? 'Aprovado' : 'Reprovado'}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                     {completedEvents.length === 0 && (
                         <p className="text-center text-gray-400 dark:text-gray-500 py-8">Nenhum evento de graduação foi concluído ainda.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default GradingView;
