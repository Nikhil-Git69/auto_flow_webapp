import React from 'react';
import {
    FileText, User2, Settings, LogOut, Layout
} from 'lucide-react';

interface SidebarProps {
    currentPath: string;
    onNavigate: (path: string) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, onLogout }) => {
    const navItems = [
        { id: 'dashboard', path: '/dashboard', icon: <FileText size={24} />, label: 'Dashboard' },
        { id: 'workspace', path: '/workspace', icon: <Layout size={24} />, label: 'Workspace' },
        { id: 'profile', path: '/profile', icon: <User2 size={24} />, label: 'Profile' },
        { id: 'settings', path: '/settings', icon: <Settings size={24} />, label: 'Settings' },
    ];

    return (
        <aside className="w-20 md:w-24 bg-white border-r border-slate-200 flex flex-col items-center pt-11 pb-8 gap-10 sticky top-0 h-screen z-10 flex-shrink-0">
            <div className="w-10 h-10 border-4 border-[#159e8a] rounded-lg flex items-center justify-center font-black text-xl text-[#159e8a]">A</div>
            <div className="flex flex-col gap-8 flex-1">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.path)}
                            className={`p - 3 transition - colors ${isActive
                                ? 'bg-teal-50 text-[#159e8a] rounded-xl border-r-4 border-[#159e8a]'
                                : 'text-slate-400 hover:text-[#159e8a]'
                                } `}
                            title={item.label}
                        >
                            {item.icon}
                        </button>
                    );
                })}
            </div>
            <button
                onClick={onLogout}
                className="p-3 text-slate-300 hover:text-red-500 transition-colors mb-4"
                title="Logout"
            >
                <LogOut size={24} />
            </button>
        </aside>
    );
};

export default Sidebar;
