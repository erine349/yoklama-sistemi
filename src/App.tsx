/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearch } from './components/common/GlobalSearch';
import { SupabaseStatusModal } from './components/common/SupabaseStatusModal';
import { TestRoleSwitcherDock } from './components/common/TestRoleSwitcherDock';
import { LoginPage } from './components/auth/LoginPage';

// Regional Coordinator (Bölge Sorumlusu) Components
import { BolgeDashboard } from './components/bolge/BolgeDashboard';

// Principal (Müdür) Components
import { MudurDashboard } from './components/mudur/MudurDashboard';
import { MudurStudents } from './components/mudur/MudurStudents';
import { MudurTeachers } from './components/mudur/MudurTeachers';
import { MudurClasses } from './components/mudur/MudurClasses';
import { MudurCurriculum } from './components/mudur/MudurCurriculum';
import { MudurAnalytics } from './components/mudur/MudurAnalytics';
import { MudurAuditLog } from './components/mudur/MudurAuditLog';

// Teacher (Öğretmen) Components
import { OgretmenDashboard } from './components/ogretmen/OgretmenDashboard';
import { OgretmenAttendance } from './components/ogretmen/OgretmenAttendance';
import { OgretmenCurriculum } from './components/ogretmen/OgretmenCurriculum';
import { OgretmenStudents } from './components/ogretmen/OgretmenStudents';

// Parent (Veli) Components
import { VeliDashboard } from './components/veli/VeliDashboard';
import { VeliCurriculum } from './components/veli/VeliCurriculum';
import { VeliAttendance } from './components/veli/VeliAttendance';

// Student (Öğrenci) Components
import { OgrenciDashboard } from './components/ogrenci/OgrenciDashboard';

const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Quick Action Modal states for Müdür
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [curriculumModalOpen, setCurriculumModalOpen] = useState(false);
  const [assignCurriculumModalOpen, setAssignCurriculumModalOpen] = useState(false);
  const [startLessonModalOpen, setStartLessonModalOpen] = useState(false);

  // Whenever user role changes, reset to 'dashboard' tab
  React.useEffect(() => {
    setActiveTab('dashboard');
  }, [currentUser.role]);

  // If user is not authenticated, show institutional Login Page!
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onLoginSuccess={() => setActiveTab('dashboard')}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
        <SupabaseStatusModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </>
    );
  }

  const renderRoleViews = () => {
    // 0. BÖLGE SORUMLUSU (REGIONAL COORDINATOR)
    if (currentUser.role === 'bolge_sorumlusu') {
      return <BolgeDashboard activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />;
    }

    // 1. MÜDÜR (PRINCIPAL)
    if (currentUser.role === 'mudur') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <MudurDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewStudent={() => {
                setActiveTab('students');
                setStudentModalOpen(true);
              }}
              onOpenNewTeacher={() => {
                setActiveTab('teachers');
                setTeacherModalOpen(true);
              }}
              onOpenNewClass={() => {
                setActiveTab('classes');
                setClassModalOpen(true);
              }}
              onOpenNewCurriculum={() => {
                setActiveTab('curriculum');
                setCurriculumModalOpen(true);
              }}
              onOpenAssignCurriculum={() => {
                setActiveTab('curriculum');
                setAssignCurriculumModalOpen(true);
              }}
            />
          );
        case 'students':
          return (
            <MudurStudents
              isAddModalOpen={studentModalOpen}
              onCloseAddModal={() => setStudentModalOpen(false)}
            />
          );
        case 'teachers':
          return (
            <MudurTeachers
              isAddModalOpen={teacherModalOpen}
              onCloseAddModal={() => setTeacherModalOpen(false)}
            />
          );
        case 'classes':
          return (
            <MudurClasses
              isAddModalOpen={classModalOpen}
              onCloseAddModal={() => setClassModalOpen(false)}
            />
          );
        case 'curriculum':
          return (
            <MudurCurriculum
              isAddModalOpen={curriculumModalOpen}
              onCloseAddModal={() => setCurriculumModalOpen(false)}
              isAssignModalOpen={assignCurriculumModalOpen}
              onCloseAssignModal={() => setAssignCurriculumModalOpen(false)}
            />
          );
        case 'lessons':
          return (
            <OgretmenAttendance
              isStartModalOpen={startLessonModalOpen}
              onCloseStartModal={() => setStartLessonModalOpen(false)}
            />
          );
        case 'analytics':
          return <MudurAnalytics />;
        case 'audit':
          return <MudurAuditLog />;
        default:
          return (
            <MudurDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewStudent={() => setStudentModalOpen(true)}
              onOpenNewTeacher={() => setTeacherModalOpen(true)}
              onOpenNewClass={() => setClassModalOpen(true)}
              onOpenNewCurriculum={() => setCurriculumModalOpen(true)}
              onOpenAssignCurriculum={() => setAssignCurriculumModalOpen(true)}
            />
          );
      }
    }

    // 2. ÖĞRETMEN (TEACHER)
    if (currentUser.role === 'ogretmen') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <OgretmenDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenStartLesson={() => {
                setActiveTab('attendance');
                setStartLessonModalOpen(true);
              }}
            />
          );
        case 'my_classes':
          return (
            <OgretmenDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenStartLesson={() => {
                setActiveTab('attendance');
                setStartLessonModalOpen(true);
              }}
            />
          );
        case 'attendance':
          return (
            <OgretmenAttendance
              isStartModalOpen={startLessonModalOpen}
              onCloseStartModal={() => setStartLessonModalOpen(false)}
            />
          );
        case 'curriculum':
          return <OgretmenCurriculum />;
        case 'students':
          return <OgretmenStudents />;
        default:
          return (
            <OgretmenDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenStartLesson={() => {
                setActiveTab('attendance');
                setStartLessonModalOpen(true);
              }}
            />
          );
      }
    }

    // 3. VELİ (PARENT)
    if (currentUser.role === 'veli') {
      switch (activeTab) {
        case 'dashboard':
          return <VeliDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        case 'curriculum':
          return <VeliCurriculum />;
        case 'attendance':
          return <VeliAttendance />;
        default:
          return <VeliDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      }
    }

    // 4. ÖĞRENCİ (STUDENT)
    if (currentUser.role === 'ogrenci') {
      switch (activeTab) {
        case 'dashboard':
          return <OgrenciDashboard />;
        case 'curriculum':
          return <VeliCurriculum />;
        case 'attendance':
          return <VeliAttendance />;
        default:
          return <OgrenciDashboard />;
      }
    }

    return null;
  };

  const handleSelectSearchResult = (type: string, item: any) => {
    if (type === 'student') {
      setActiveTab('students');
    } else if (type === 'teacher') {
      setActiveTab('teachers');
    } else if (type === 'class') {
      setActiveTab('classes');
    } else if (type === 'curriculum') {
      setActiveTab('curriculum');
    } else if (type === 'school') {
      setActiveTab('schools');
    } else if (type === 'principal') {
      setActiveTab('principals');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderRoleViews()}
        </main>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Supabase Status & Settings Modal */}
      <SupabaseStatusModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Floating Discreet Developer / Reviewer Dock (Gizlenebilir) */}
      <TestRoleSwitcherDock />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <AppContent />
      </SchoolProvider>
    </AuthProvider>
  );
}
