
import React from 'react';
import { Notification } from '../../types';
import BellIcon from '../icons/BellIcon';

interface NotificationModalProps {
    notifications: Notification[];
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md relative flex flex-col max-h-[80vh]">
                
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 rounded-t-lg">
                    <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full text-red-600 dark:text-red-100">
                        <BellIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Novas Notificações</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Você tem {notifications.length} mensagens não lidas.</p>
                    </div>
                </div>

                <div className="p-0 overflow-y-auto flex-grow">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map(notification => (
                            <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{notification.title}</h4>
                                    <span className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-lg text-right">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Ok, Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
