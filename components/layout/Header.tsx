import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { AppView } from '../../App';
import MenuIcon from '../icons/MenuIcon';
import UserIcon from '../icons/UserIcon';
import TrophyIcon from '../icons/TrophyIcon';
import ClipboardCheckIcon from '../icons/ClipboardCheckIcon';
import GlobeIcon from '../icons/GlobeIcon';
import CertificateIcon from '../icons/CertificateIcon';
import MedalIcon from '../icons/MedalIcon';
import Logo from '../icons/Logo';

interface HeaderProps {
    user: User;
    onNavigate: (view: AppView) => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout }) => {
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
                                <a onClick={() => handleNav('dashboard')} className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    <span>Painel Principal</span>
                                </a>
                                <a onClick={() => handleNav('dojo_manager')} className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <UserIcon className="h-5 w-5" />
                                    <span>Gerenciar Dojo</span>
                                </a>
                                <a onClick={() => handleNav('public_dojo_page')} className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <GlobeIcon className="h-5 w-5" />
                                    <span>Minha Página</span>
                                </a>
                                <a onClick={() => handleNav('championships')} className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <MedalIcon className="h-5 w-5" />
                                    <span>Campeonatos</span>
                                </a>
                                <a onClick={() => handleNav('exams')} className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <TrophyIcon className="h-5 w-5" />
                                    <span>Provas</span>
                                </a>
                                 <a onClick={() => handleNav('grading')} className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <ClipboardCheckIcon className="h-5 w-5" />
                                    <span>Próxima Graduação</span>
                                </a>
                                {/* <a onClick={() => handleNav('diploma_generator')} className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <CertificateIcon className="h-5 w-5" />
                                    <span>Gerador de Diplomas</span>
                                </a> */}
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
