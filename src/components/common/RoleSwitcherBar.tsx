import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Briefcase, UserCheck, Globe, ChevronRight, LogIn } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const RoleSwitcherBar: React.FC = () => {
  const { 
    role, 
    setRole, 
    publicPage,
    setPublicPage,
    vendorPage, 
    userPage,
    firebaseUser,
    authenticatedRole
  } = useApp();

  const roles: { id: UserRole; label: string; icon: React.ReactNode; currentSub: string }[] = [
    { 
      id: 'public', 
      label: 'Public Website', 
      icon: <Globe className="h-3.5 w-3.5" />,
      currentSub: publicPage.replace('-', ' ')
    },
    ...(firebaseUser && authenticatedRole === 'vendor'
      ? [
          { 
            id: 'vendor' as UserRole, 
            label: 'Vendor Portal', 
            icon: <Briefcase className="h-3.5 w-3.5" />,
            currentSub: vendorPage.replace('-', ' ')
          }
        ]
      : []),
    ...(firebaseUser && authenticatedRole === 'user'
      ? [
          { 
            id: 'user' as UserRole, 
            label: 'User Rewards', 
            icon: <UserCheck className="h-3.5 w-3.5" />,
            currentSub: userPage.replace('-', ' ')
          }
        ]
      : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-purple-900/30 px-3 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 font-mono">
          PROMOVIEW
        </span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto py-0.5">
        {roles.map((r) => {
          const isActive = role === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {r.icon}
              <span>{r.label}</span>
              {isActive && (
                <span className="hidden lg:inline-flex items-center text-[10px] text-purple-200 ml-1 opacity-80 capitalize">
                  <ChevronRight className="h-2.5 w-2.5 inline" /> {r.currentSub}
                </span>
              )}
            </button>
          );
        })}

        {(!firebaseUser || !authenticatedRole) && (
          <button
            onClick={() => {
              setRole('public');
              setPublicPage('login');
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md font-medium text-xs transition-all whitespace-nowrap bg-slate-900/80 text-purple-300 hover:text-white hover:bg-purple-600/30 border border-purple-500/20 cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Login</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />
        <ThemeToggle variant="compact" />
      </div>
    </header>
  );
};
