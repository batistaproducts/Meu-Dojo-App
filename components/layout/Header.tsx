
import React, { useState, useRef, useEffect } from 'react';
import { User, RolePermission } from '../../types';
import { AppView } from '../../services/roleService';
import MenuIcon from '../icons/MenuIcon';
import Logo from '../icons/Logo';
import NotificationBell from '../notifications/NotificationBell';

interface HeaderProps {
    user: User;
    onNavigate: (view: AppView) => void;
    onLogout: () => void;
    permissions: RolePermission[];
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout, permissions }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNav = (view: AppView) => {
        onNavigate(view);
        setIsMenuOpen(false);
    }
    
    return (
    <header className="py-4 bg-white dark:bg-black/30 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <div className='cursor-pointer' onClick={() => handleNav('dashboard')}>
                <Logo className="h-10" />
            </div>
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <NotificationBell user={user} />

                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <MenuIcon className="w-5 h-5" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-fade-in-sm">
                           <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">Bem-vindo, {user.user_metadata.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                           </div>
                           <nav className="py-2">
                               {permissions.map(perm => (
                                   <a key={perm.view} onClick={() => handleNav(perm.view)} className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                        {perm.icon_code ? (
                                            <span 
                                                className="w-5 h-5 text-current" 
                                                dangerouslySetInnerHTML={{ __html: perm.icon_code }} 
                                            />
                                        ) : (
                                            // Fallback blank icon
                                            <div className="w-5 h-5 bg-gray-300 rounded-full opacity-50"></div>
                                        )}
                                        <span>{perm.title}</span>
                                   </a>
                               ))}
                           </nav>
                           <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                                <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-700 dark:text-amber-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    <span>Sair</span>
                                </button>
                           </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </header>
    );
}

export default Header;
