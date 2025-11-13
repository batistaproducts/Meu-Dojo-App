
import React, { useState, useMemo } from 'react';
import { GraduationEvent, Exam, Student, StudentGrading } from '../../types';

interface GradingViewProps {
  events: GraduationEvent[];
  exams: Exam[];
  students: Student[];
  onFinalizeGrading: (event: GraduationEvent, updatedAttendees: StudentGrading[]) => Promise<void>;
}

const GradingView: React.FC<GradingViewProps> = ({ events, exams, students, onFinalizeGrading }) => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [grades, setGrades] = useState<Record<string, number>>({});
    
    const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [selectedEventId, events]);
    const selectedExam = useMemo(() => exams.find(ex => ex.id === selectedEvent?.exam_id), [selectedEvent, exams]);

    const handleGradeChange = (studentId: string, grade: number) => {
        setGrades(prev => ({ ...prev, [studentId]: Math.max(0, Math.min(10, grade)) }));
    };

    const handleFinalizeGradingWrapper = async () => {
        if (!selectedEvent || !selectedExam) return;

        const updatedAttendees = selectedEvent.attendees.map(attendee => {
            const finalGrade = grades[attendee.studentId];
            const isApproved = finalGrade !== undefined && finalGrade >= selectedExam.min_passing_grade;
            return { ...attendee, finalGrade, isApproved };
        });

        await onFinalizeGrading(selectedEvent, updatedAttendees);

        setSelectedEventId(null);
        setGrades({});
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold font-cinzel text-red-800 dark:text-amber-300 mb-8">Gerenciar Graduações</h2>
            
            {!selectedEvent && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Eventos Agendados</h3>
                    <div className="space-y-3">
                        {events.filter(e => e.status === 'scheduled').map(event => {
                            const exam = exams.find(ex => ex.id === event.exam_id);
                            return (
                                <div key={event.id} onClick={() => setSelectedEventId(event.id!)} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <p className="font-semibold">{exam?.name || 'Prova não encontrada'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Data: {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')} | Alunos: {event.attendees.length}</p>
                                </div>
                            )
                        })}
                        {events.filter(e => e.status === 'scheduled').length === 0 && (
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
                        {selectedEvent.attendees.map(attendee => {
                            const student = students.find(s => s.id === attendee.studentId);
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
                        <button onClick={handleFinalizeGradingWrapper} className="px-6 py-3 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-bold rounded-lg transition-colors">
                            Finalizar e Salvar Graduação
                        </button>
                    </div>
                </div>
            )}
            
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Eventos Concluídos</h3>
                <div className="space-y-3">
                    {events.filter(e => e.status === 'completed').map(event => {
                        const exam = exams.find(ex => ex.id === event.exam_id);
                        return (
                            <div key={event.id} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                                <p className="font-semibold">{exam?.name || 'Prova não encontrada'} ({new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')})</p>
                                <ul className="mt-2 text-sm space-y-1">
                                    {event.attendees.map(attendee => {
                                        const student = students.find(s => s.id === attendee.studentId);
                                        return (
                                            <li key={attendee.studentId} className={`flex justify-between ${attendee.isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                <span>{student?.name || 'Aluno não encontrado'}</span>
                                                <span>Nota: {attendee.finalGrade} - {attendee.isApproved ? 'Aprovado' : 'Reprovado'}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )
                    })}
                     {events.filter(e => e.status === 'completed').length === 0 && (
                         <p className="text-center text-gray-400 dark:text-gray-500 py-8">Nenhum evento de graduação foi concluído ainda.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default GradingView;