import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  Users,
  GraduationCap,
  Building2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const TestRoleSwitcherDock: React.FC = () => {
  const { currentUser, switchRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-4 right-4 z-50 p-2.5 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 transition-all text-xs flex items-center gap-1.5 cursor-pointer opacity-70 hover:opacity-100"
        title="Test Menüsünü Göster"
      >
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span className="hidden sm:inline font-medium text-[11px]">Test Ortamı</span>
      </button>
    );
  }

  const roles: { id: UserRole; title: string; subtitle: string; icon: any }[] = [
    {
      id: 'bolge_sorumlusu',
      title: 'Bölge Sorumlusu',
      subtitle: 'Kemal Sunar (Tüm Okullar & Müdürler)',
      icon: Building2,
    },
    { id: 'mudur', title: 'Müdür', subtitle: 'Dr. Selim Karahan', icon: Shield },
    { id: 'ogretmen', title: 'Öğretmen', subtitle: 'Ayşe Yılmaz (Matematik)', icon: UserCheck },
    { id: 'veli', title: 'Veli', subtitle: 'Mustafa Çelik (2 Çocuk)', icon: Users },
    { id: 'ogrenci', title: 'Öğrenci', subtitle: 'Kerem Çelik (8-A)', icon: GraduationCap },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-800 p-3 max-w-xs sm:max-w-sm">
        {/* Dock Header */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200 text-[11px]">Geliştirici Test Ortamı</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-slate-400 hover:text-white rounded"
              title={isOpen ? 'Küçült' : 'Genişlet'}
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Gizle (Tam Gerçek Görünüm)"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Role Indicator */}
        <div className="pt-2 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Aktif Panel:</span>
          <span className="font-bold text-emerald-400 capitalize">{currentUser.role} Portalı</span>
        </div>

        {/* Expanded Panel Switcher */}
        {isOpen && (
          <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5 animate-in fade-in duration-150">
            <p className="text-[10px] text-slate-400 mb-2">
              Panelleri incelemek için rol seçin (Gerçek üretimde her kullanıcı kendi şifresiyle giriş yapar):
            </p>
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = currentUser.role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => switchRole(r.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-xs leading-tight">{r.title} Paneli</p>
                      <p className="text-[10px] opacity-75">{r.subtitle}</p>
                    </div>
                  </div>
                  {isActive && <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded">Aktif</span>}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => logout()}
                className="w-full text-center py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Giriş Ekranına Git (Oturumu Kapat)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
