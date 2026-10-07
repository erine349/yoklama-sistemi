import React, { useState } from 'react';
import {
  Bell,
  Search,
  Database,
  Menu,
  ChevronDown,
  UserCheck,
  Shield,
  GraduationCap,
  Users,
  LogOut,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenSupabaseModal: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenSupabaseModal,
  activeTab,
}) => {
  const { currentUser, switchRole, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useSchool();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isConfigured = isSupabaseConfigured();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string }> = {
    bolge_sorumlusu: { label: 'Bölge Sorumlusu', icon: Building2, color: 'text-amber-800 bg-amber-50' },
    mudur: { label: 'Müdür Paneli', icon: Shield, color: 'text-emerald-700 bg-emerald-50' },
    ogretmen: { label: 'Öğretmen Paneli', icon: UserCheck, color: 'text-teal-700 bg-teal-50' },
    veli: { label: 'Veli Paneli', icon: Users, color: 'text-blue-700 bg-blue-50' },
    ogrenci: { label: 'Öğrenci Paneli', icon: GraduationCap, color: 'text-indigo-700 bg-indigo-50' },
  };

  const currentRoleInfo = roleLabels[currentUser.role] || roleLabels.mudur;
  const CurrentIcon = currentRoleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Brand & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Menüyü aç"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors">
              <span className="font-extrabold text-base tracking-tighter">AP</span>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                AkademiPro
              </span>
              <span className="text-[10px] text-slate-500 block leading-none">
                Özel Okul Yönetimi
              </span>
            </div>
          </a>
        </div>

        {/* Center: Authentic Portal Title & Breadcrumb */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1.5">
            <CurrentIcon className="w-3.5 h-3.5" />
            <span>{currentRoleInfo.label}</span>
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500 font-medium">2026-2027 Güz Dönemi</span>
        </div>

        {/* Right Actions: Search, Supabase status, Notifications, User profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Ara...</span>
            <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Supabase status badge button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl border transition-colors cursor-pointer ${
              isConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Veritabanı ve Supabase Yapılandırması"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden xl:inline font-medium">
              {isConfigured ? 'Supabase Bağlı' : 'Yerel Veritabanı'}
            </span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Bildirimler"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                  <span className="text-xs font-bold text-slate-900">Bildirimler ({unreadCount})</span>
                  <span className="text-[11px] text-slate-400">Bugün</span>
                </div>
                <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Yeni bildirim bulunmuyor.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                          n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/60 hover:bg-emerald-50'
                        }`}
                      >
                        <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.created_at}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile & Role badge */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 pl-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-200">
                {currentUser.full_name[0]}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-slate-800 block leading-tight truncate max-w-[120px]">
                  {currentUser.full_name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block leading-none">
                  {currentRoleInfo.label.replace(' Paneli', '')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>

                <div className="py-1">
                  <div className="text-[10px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    Rol Değiştir (Demo)
                  </div>
                  {(['bolge_sorumlusu', 'mudur', 'ogretmen', 'veli', 'ogrenci'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                        currentUser.role === r
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{roleLabels[r].label}</span>
                      {currentUser.role === r && <span className="text-[10px] text-emerald-600">Aktif</span>}
                    </button>
                  ))}
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logout();
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
