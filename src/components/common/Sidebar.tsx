import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  BarChart3,
  FileText,
  X,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser } = useAuth();
  const { activeAcademicYear } = useSchool();

  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'bolge_sorumlusu':
        return [
          { id: 'dashboard', label: 'Bölge Genel Bakış', icon: LayoutDashboard },
          { id: 'schools', label: 'Okullar & Kampüsler', icon: School },
          { id: 'principals', label: 'Okul Müdürleri', icon: Users },
          { id: 'assignments', label: 'Müdür Atamaları', icon: ShieldCheck },
          { id: 'analytics', label: 'Bölge İstatistikleri', icon: BarChart3 },
          { id: 'audit', label: 'Denetim & Günlük', icon: FileText },
        ];
      case 'mudur':
        return [
          { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
          { id: 'students', label: 'Öğrenci Yönetimi', icon: GraduationCap },
          { id: 'teachers', label: 'Öğretmenler', icon: Users },
          { id: 'classes', label: 'Sınıflar & Şubeler', icon: School },
          { id: 'curriculum', label: 'Müfredat Sistemi', icon: BookOpen },
          { id: 'lessons', label: 'Ders & Yoklama', icon: CalendarCheck },
          { id: 'analytics', label: 'Analiz Merkezi', icon: BarChart3 },
          { id: 'audit', label: 'Aktivite Günlüğü', icon: FileText },
        ];
      case 'ogretmen':
        return [
          { id: 'dashboard', label: 'Öğretmen Paneli', icon: LayoutDashboard },
          { id: 'my_classes', label: 'Sınıflarım & Ders Başlat', icon: School },
          { id: 'attendance', label: 'Canlı Yoklama Ekranı', icon: CalendarCheck, badge: 'Canlı' },
          { id: 'curriculum', label: 'Müfredat Takibi', icon: BookOpen },
          { id: 'students', label: 'Öğrencilerim', icon: GraduationCap },
        ];
      case 'veli':
        return [
          { id: 'dashboard', label: 'Çocuğumun Durumu', icon: LayoutDashboard },
          { id: 'curriculum', label: 'Müfredat İlerlemesi', icon: BookOpen },
          { id: 'attendance', label: 'Yoklama & Devamsızlık', icon: CalendarCheck },
        ];
      case 'ogrenci':
        return [
          { id: 'dashboard', label: 'Akademik Durumum', icon: LayoutDashboard },
          { id: 'curriculum', label: 'Derslerim & Konular', icon: BookOpen },
          { id: 'attendance', label: 'Yoklama Geçmişim', icon: CalendarCheck },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(currentUser.role);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      {/* School Info / Academic Year Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Özel Akademi Koleji</span>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
              Aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            {activeAcademicYear.name} Dönemi
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {currentUser.role === 'bolge_sorumlusu' && 'Bölge Koordinatörlüğü'}
          {currentUser.role === 'mudur' && 'Yönetim Modülleri'}
          {currentUser.role === 'ogretmen' && 'Akademik Süreç'}
          {currentUser.role === 'veli' && 'Öğrenci Takibi'}
          {currentUser.role === 'ogrenci' && 'Öğrenci Portalı'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / User info */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-200">
            {currentUser.full_name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{currentUser.full_name}</p>
            <p className="text-[11px] text-slate-400 truncate capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3">
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
