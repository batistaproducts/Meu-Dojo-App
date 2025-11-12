import React, { useState, useEffect } from 'react';
import { Student, Dojo, Belt, Payment, GraduationHistoryEntry } from '../../types';

interface StudentFormProps {
  student: Student | null;
  dojo: Dojo;
  onSave: (student: Student) => void;
  onCancel: () => void;
}

const generateLast12Months = (): { month: number, year: number }[] => {
    const dates = [];
    let currentDate = new Date();
    for (let i = 0; i < 12; i++) {
        dates.push({ month: currentDate.getMonth() + 1, year: currentDate.getFullYear() });
        currentDate.setMonth(currentDate.getMonth() - 1);
    }
    return dates.reverse();
};

const StudentForm: React.FC<StudentFormProps> = ({ student, dojo, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [modality, setModality] = useState(dojo.modalities[0]?.name || '');
  const [belts, setBelts] = useState<Belt[]>([]);
  const [selectedBelt, setSelectedBelt] = useState<Belt | null>(null);
  const [lastGraduationDate, setLastGraduationDate] = useState(new Date().toISOString().split('T')[0]);
  const [tuitionFee, setTuitionFee] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  useEffect(() => {
    if (student) {
      setName(student.name);
      setModality(student.modality);
      setLastGraduationDate(student.lastGraduationDate);
      setTuitionFee(student.tuitionFee);
      setPayments(student.payments);
    } else {
        // Init payments for new student
        setPayments(generateLast12Months().map(d => ({...d, status: 'open'})));
    }
  }, [student]);

  useEffect(() => {
    const selectedModality = dojo.modalities.find(m => m.name === modality);
    const newBelts = selectedModality ? selectedModality.belts : [];
    setBelts(newBelts);
    
    if (student && student.modality === modality) {
        setSelectedBelt(student.belt);
    } else {
        setSelectedBelt(newBelts[0] || null);
    }
  }, [modality, dojo.modalities, student]);

  const handlePaymentToggle = (month: number, year: number) => {
    setPayments(prev => {
        const existing = prev.find(p => p.month === month && p.year === year);
        if (existing) {
            return prev.map(p => p.month === month && p.year === year ? {...p, status: p.status === 'paid' ? 'open' : 'paid'} : p);
        }
        return [...prev, { month, year, status: 'paid' }];
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !modality || !selectedBelt) {
        alert('Por favor, preencha os campos obrigatórios.');
        return;
    }
    
    const studentData: Student = {
        id: student ? student.id : Date.now().toString(),
        name,
        modality,
        belt: selectedBelt,
        lastGraduationDate,
        tuitionFee,
        payments,
        championships: student ? student.championships : [],
        fights: student ? student.fights : [],
        graduationHistory: student ? student.graduationHistory : [],
    };

    if (!student) {
        const initialGraduation: GraduationHistoryEntry = {
            id: Date.now().toString() + '_initial',
            date: lastGraduationDate,
            belt: selectedBelt,
            grade: 0, 
            examName: 'Cadastro Inicial',
        };
        studentData.graduationHistory = [initialGraduation];
    }

    onSave(studentData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6 text-gray-900 dark:text-white">
      <h3 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300">{student ? 'Editar Aluno' : 'Adicionar Novo Aluno'}</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="studentName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
            <input id="studentName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" />
          </div>
          <div>
            <label htmlFor="modality" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Modalidade</label>
            <select id="modality" value={modality} onChange={(e) => setModality(e.target.value)} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5">
              {dojo.modalities.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
            </select>
          </div>
      </div>
      
      <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Graduação</h3>
          <div className="flex flex-wrap gap-2">
            {belts.map((belt) => (
              <button
                type="button"
                key={belt.name}
                onClick={() => setSelectedBelt(belt)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 border-2 ${selectedBelt?.name === belt.name ? 'ring-2 ring-offset-2 ring-red-500 dark:ring-amber-400 ring-offset-white dark:ring-offset-gray-800' : 'border-transparent'}`}
                style={{ backgroundColor: belt.color, color: belt.color === '#FFFFFF' || belt.color === '#FFFF00' ? '#000' : '#FFF', textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
              >
                {belt.name}
              </button>
            ))}
          </div>
      </div>

       <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="graduationDate" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Data da Última Graduação</label>
            <input id="graduationDate" type="date" value={lastGraduationDate} onChange={(e) => setLastGraduationDate(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" />
          </div>
          <div>
            <label htmlFor="tuitionFee" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Valor da Mensalidade (R$)</label>
            <input id="tuitionFee" type="number" value={tuitionFee} onChange={(e) => setTuitionFee(parseFloat(e.target.value))} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" />
          </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Status de Pagamento (Últimos 12 meses)</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {generateLast12Months().map(({month, year}) => {
                const payment = payments.find(p => p.month === month && p.year === year);
                const status = payment ? payment.status : 'open';
                const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'short' });
                return (
                    <button
                        type="button"
                        key={`${year}-${month}`}
                        onClick={() => handlePaymentToggle(month, year)}
                        className={`p-2 text-xs text-white text-center rounded-lg border-2 transition-colors ${status === 'paid' ? 'bg-green-600 border-green-400' : 'bg-gray-500 dark:bg-gray-600 border-gray-400 dark:border-gray-500 hover:bg-gray-600 dark:hover:bg-gray-500'}`}
                    >
                        {monthName}/{year.toString().slice(-2)}
                        <span className="block text-xs opacity-80">{status === 'paid' ? 'Pago' : 'Aberto'}</span>
                    </button>
                )
            })}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-semibold">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg transition-colors font-semibold">Salvar</button>
      </div>
    </form>
  );
};

export default StudentForm;