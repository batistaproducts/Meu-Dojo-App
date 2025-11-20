
import React, { useState, useEffect, useRef } from 'react';
import { User, Notification } from '../../types';
import { fetchNotifications, markNotificationsAsRead } from '../../services/notificationService';
import BellIcon from '../icons/BellIcon';

interface NotificationBellProps {
    user: User;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ user }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadNotifications();
        
        // Optional: Simple polling every 60 seconds to check for new stuff
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        if (!user) return;
        const data = await fetchNotifications(user.id);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
    };

    const handleToggle = async () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);

        if (newIsOpen && unreadCount > 0) {
            // When opening, we optimistically mark displayed ones as read in UI
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            
            // Update DB
            await markNotificationsAsRead(unreadIds);
            
            // Update Local State
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-600';
            case 'warning': return 'bg-yellow-100 text-yellow-600';
            case 'error': return 'bg-red-100 text-red-600';
            default: return 'bg-blue-100 text-blue-600';
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button 
                onClick={handleToggle}
                className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none"
            >
                <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white dark:border-gray-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden z-50 animate-fade-in-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notificações</h3>
                        <button onClick={loadNotifications} className="text-xs text-blue-600 hover:underline">Atualizar</button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map(notification => (
                                    <div key={notification.id} className={`p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(notification.type)}`}>
                                            <BellIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{notification.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-2">{new Date(notification.created_at).toLocaleString('pt-BR')}</p>
                                        </div>
                                        {!notification.read && (
                                            <div className="flex-shrink-0">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                Nenhuma notificação.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
