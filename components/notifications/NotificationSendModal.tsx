
import React, { useState, useEffect } from 'react';
import { Student, StudentUserLink } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import BellIcon from '../icons/BellIcon';
import SpinnerIcon from '../icons/SpinnerIcon';

interface NotificationSendModalProps {
    students: Student[];
    links: StudentUserLink[];
    onClose: () => void;
    onSend: (category: 'Aviso' | 'Cobrança', message: string, targetUserIds: string[]) => Promise<void>;
}

const NotificationSendModal: React.FC<NotificationSendModalProps> = ({ students, links, onClose, onSend }) => {
    const [category, setCategory] = useState<'Aviso' | 'Cobrança'>('Aviso');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Identify which students have a linked User ID (can receive notifications)
    const targetUsers = students.map(s => {
        const link = links.find(l => l.student_id === s.id);
        return {
            student: s,
            userId: link?.user_id || null
        };
    });

    const recipients = targetUsers.filter(t => t.userId !== null);
    const unlinked = targetUsers.filter(t => t.userId === null);

    // Load last message for the selected category from LocalStorage
    useEffect(() => {
        const savedMessage = localStorage.getItem(`last_notification_msg_${category}`);
        if (savedMessage) {
            setMessage(savedMessage);
        } else {
            // Default templates if nothing saved
            if (category === 'Cobrança') {
                setMessage('Olá! Gostaríamos de lembrar que sua mensalidade está em aberto. Por favor, procure seu mestre.');
            } else {
                setMessage('');
            }
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            alert("Por favor, insira uma mensagem.");
            return;
        }
        if (recipients.length === 0) {
            alert("Nenhum dos alunos selecionados possui conta vinculada no sistema para receber a notificação.");
            return;
        }

        setLoading(true);
        try {
            // Save message template for next time
            localStorage.setItem(`last_notification_msg_${category}`, message);

            const userIds = recipients.map(r => r.userId as string);
            await onSend(category, message, userIds);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar notificações.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <CloseIcon className="w-6 h-6" />
                </button>
                
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <BellIcon className="w-6 h-6 text-red-600" />
                        <h3 className="text-2xl font-bold font-cinzel text-gray-900 dark:text-white">Enviar Notificação</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A notificação aparecerá no painel dos alunos selecionados.</p>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                    <form id="notification-form" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                            <select 
                                id="category" 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value as any)}
                                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 block w-full p-2.5"
                            >
                                <option value="Aviso">Aviso Geral</option>
                                <option value="Cobrança">Cobrança da Mensalidade</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem</label>
                            <textarea 
                                id="message" 
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 block w-full p-2.5 resize-none"
                                placeholder="Digite o conteúdo da notificação..."
                                required
                            ></textarea>
                            <p className="mt-1 text-xs text-gray-400">A mensagem acima foi recuperada do seu último envio nesta categoria.</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">Destinatários ({recipients.length})</h4>
                            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600">
                                <ul className="space-y-1 text-sm">
                                    {recipients.map((r, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {r.student.name}
                                        </li>
                                    ))}
                                    {unlinked.map((u, idx) => (
                                        <li key={`unlinked-${idx}`} className="flex items-center gap-2 text-gray-400 line-through" title="Este aluno não possui conta vinculada ao sistema">
                                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                            {u.student.name} (Sem acesso)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {unlinked.length > 0 && (
                                <p className="mt-2 text-xs text-orange-500">* Alunos "Sem acesso" ainda não criaram conta no app e não receberão a notificação.</p>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        form="notification-form"
                        disabled={loading || recipients.length === 0} 
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <SpinnerIcon className="w-5 h-5" /> : (
                            <>
                                <BellIcon className="w-5 h-5" />
                                Enviar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSendModal;
