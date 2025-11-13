import React, { useState, useEffect } from 'react';
import { Student, MartialArt, Belt, Payment, GraduationHistoryEntry } from '../../types';
import UserIcon from '../icons/UserIcon';
import UploadIcon from '../icons/UploadIcon';

interface StudentFormProps {
  student: Student | null;
  modalities: MartialArt[];
  onSave: (student: Omit<Student, 'dojo_id'>, pictureBase64?: string) => Promise<void>;
  onCancel: () => void;
  isLinked: boolean;
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

const StudentForm: React.FC<StudentFormProps> = ({ student, modalities, onSave, onCancel, isLinked }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [modality, setModality] = useState(modalities[0]?.name || '');
  const [belts, setBelts] = useState<Belt[]>([]);
  const [selectedBelt, setSelectedBelt] = useState<Belt | null>(null);
  const [last_graduation_date, setLastGraduationDate] = useState(new Date().toISOString().split('T')[0]);
  const [tuition_fee, setTuitionFee] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [profilePictureBase64, setProfilePictureBase64] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (student) {
      setName(student.name);
      setEmail(student.email || '');
      setModality(student.modality);
      setLastGraduationDate(student.last_graduation_date);
      setTuitionFee(student.tuition_fee);
      setPayments(student.payments);
      setProfilePictureBase64(student.profile_picture_url);
    } else {
        setPayments(generateLast12Months().map(d => ({...d, status: 'open'})));
    }
  }, [student]);

  useEffect(() => {
    const selectedModality = modalities.find(m => m.name === modality);
    const newBelts = selectedModality ? selectedModality.belts : [];
    setBelts(newBelts);
    
    if (student && student.modality === modality) {
        setSelectedBelt(student.belt);
    } else if (newBelts.length > 0) {
        setSelectedBelt(newBelts[0]);
    } else {
        setSelectedBelt(null);
    }
  }, [modality, modalities, student]);

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

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
    if (!name || !email || !modality || !selectedBelt) {
        alert('Por favor, preencha os campos obrigatórios (Nome, Email, Modalidade e Graduação).');
        return;
    }
    
    const studentData: Omit<Student, 'dojo_id'> = {
        id: student ? student.id : undefined,
        name,
        email,
        modality,
        belt: selectedBelt,
        last_graduation_date,
        tuition_fee,
        payments,
        profile_picture_url: profilePictureBase64, // Pass the base64 string
        championships: student ? student.championships : [],
        fights: student ? student.fights : [],
        graduation_history: student ? student.graduation_history : [],
    };

    if (!student) {
        const initialGraduation: GraduationHistoryEntry = {
            id: Date.now().toString() + '_initial',
            date: last_graduation_date,
            belt: selectedBelt,
            grade: 0, 
            examName: 'Cadastro Inicial',
        };
        studentData.graduation_history = [initialGraduation];
    }

    onSave(studentData, profilePictureBase64);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6 text-gray-900 dark:text-white">
      <h3 className="text-2xl font-bold font-cinzel text-red-800 dark:text-amber-300">{student ? 'Editar Aluno' : 'Adicionar Novo Aluno'}</h3>
      
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <div className="flex-shrink-0">
            <label htmlFor="profile-picture-upload" className="cursor-pointer group relative">
                {profilePictureBase64 ? (
                    <img src={profilePictureBase64} alt="Foto do Aluno" className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600 group-hover:opacity-70 transition-opacity" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-300 dark:border-gray-600 group-hover:bg-gray-300 dark:group-hover:bg-gray-600">
                        <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <UploadIcon className="w-8 h-8 text-white" />
                </div>
            </label>
            <input id="profile-picture-upload" type="file" className="hidden" accept="image/*" onChange={handlePictureUpload} />
        </div>
        <div className="w-full grid md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="studentName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                <input id="studentName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" />
            </div>
            <div>
                <label htmlFor="studentEmail" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email (para login do aluno)</label>
                <input id="studentEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLinked} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="email@doaluno.com" />
                {isLinked && <p className="text-xs text-gray-400 mt-1">Email não pode ser alterado (login vinculado).</p>}
            </div>
            <div>
                <label htmlFor="modality" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Modalidade</label>
                <select id="modality" value={modality} onChange={(e) => setModality(e.target.value)} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5">
                {modalities.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
            </div>
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
            <input id="graduationDate" type="date" value={last_graduation_date} onChange={(e) => setLastGraduationDate(e.target.value)} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" />
          </div>
          <div>
            <label htmlFor="tuitionFee" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Valor da Mensalidade (R$)</label>
            <input id="tuitionFee" type="number" value={tuition_fee} onChange={(e) => setTuitionFee(parseFloat(e.target.value))} required className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-amber-500 focus:border-red-500 dark:focus:border-amber-500 block w-full p-2.5" />
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