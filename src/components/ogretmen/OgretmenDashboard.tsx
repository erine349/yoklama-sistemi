import React from 'react';
import {
  CalendarCheck,
  School,
  BookOpen,
  GraduationCap,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNavigate: (tab: string) => void;
  onOpenStartLesson: () => void;
}

export const OgretmenDashboard: React.FC<Props> = ({ onNavigate, onOpenStartLesson }) => {
  const { currentUser } = useAuth();
  const { lessons, classes, students, curriculums, topicProgress } = useSchool();

  // Find teacher's assigned classes
  const myClasses = classes.filter((c) => c.class_teacher_id === currentUser.id || c.name.startsWith('8-'));
  const myClassIds = myClasses.map((c) => c.id);
  const myStudents = students.filter((s) => myClassIds.includes(s.class_id) && !s.deleted_at);

  // Today's lessons
  const todayLessons = lessons.filter((l) => l.lesson_date === '2026-10-07');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Öğretmen Çalışma Masası
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            İyi Günler, {currentUser.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bugün planlanan <span className="font-bold text-slate-700">{todayLessons.length}</span> ders oturumunuz bulunmaktadır.
          </p>
        </div>

        <button
          onClick={onOpenStartLesson}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Yeni Ders Başlat & Yoklama Al</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Bugünkü Derslerim</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {todayLessons.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {todayLessons.filter((l) => l.is_attendance_locked).length} Yoklama Alındı
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Sorumlu Öğrencilerim</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {myStudents.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">8-A ve 8-B Şubeleri</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Atanmış Sınıflarım</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {myClasses.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">8-A (Rehber Şube)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Müfredat İlerlemem</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            %78
          </div>
          <p className="text-xs text-slate-500 mt-1">2. Ünite Devam Ediyor</p>
        </div>
      </div>

      {/* Today Lessons List & Live Attendance Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Today's Schedule */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bugünkü Ders Programım</h3>
              <p className="text-xs text-slate-500">Tarih: 07 Ekim 2026</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              Tüm Yoklamalar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-mono">{lesson.start_time}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{lesson.class_name}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-semibold text-emerald-800 text-xs">{lesson.subject_name}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">{lesson.topic_name || 'Genel Konu'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Süre: {lesson.start_time} - {lesson.end_time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {lesson.is_attendance_locked ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Yoklama Alındı
                    </span>
                  ) : (
                    <button
                      onClick={() => onNavigate('attendance')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                    >
                      Yoklama Al
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 col: Quick Class Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Müfredat Konu Durumu</h3>
            <p className="text-xs text-slate-500 mb-4">8-A Matematik Müfredatı</p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[11px] block">İşlenen Son Konu:</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  Tam Sayıların Tam Sayı Kuvvetleri
                </span>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  Devam Ediyor
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[11px] block">Sıradaki Konu:</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  Üslü İfadelerle Temel İşlemler
                </span>
                <span className="text-[10px] text-slate-500 font-semibold bg-slate-200 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  Başlamadı
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('curriculum')}
              className="w-full py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              Müfredat Takip Ekranına Git
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
