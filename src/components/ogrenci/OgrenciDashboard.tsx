import React from 'react';
import {
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

export const OgrenciDashboard: React.FC = () => {
  const { students, curriculums, attendance, lessons } = useSchool();
  const { currentUser } = useAuth();

  // Find student profile (Kerem Çelik stu-801)
  const myStudent =
    students.find((s) => s.profile_id === currentUser.id) ||
    students.find((s) => s.student_number === '801') ||
    students[0];

  const myAttendance = attendance.filter((a) => a.student_id === myStudent.id);
  const myLessons = lessons.filter((l) => l.class_id === myStudent.class_id);

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 font-extrabold flex items-center justify-center text-xl shadow-xs ring-2 ring-indigo-200">
            {myStudent.first_name[0]}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider">
              Öğrenci Portalı
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Hoş Geldin, {myStudent.first_name} {myStudent.last_name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Okul No: <span className="font-mono font-bold text-slate-700">{myStudent.student_number}</span> · Sınıfın: <span className="font-bold text-slate-700">{myStudent.class_name}</span> · Durum: <span className="text-emerald-700 font-semibold">Aktif</span>
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-xl self-start sm:self-auto">
          2026-2027 Eğitim Yılı
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Ders Katılım Oranın</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            %{myStudent.attendance_rate || 96}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Devamsızlık: {myStudent.absenteeism_count || 1} gün</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Müfredat İlerlemen</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            %{myStudent.curriculum_rate || 82}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Konular başarıyla işleniyor</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Akademik Durum</span>
          <div className="text-base font-bold text-emerald-800 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Tüm Dersler Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sınıf Başarı Ortalaması: Yüksek</p>
        </div>
      </div>

      {/* Today Lessons & Attendance Record */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Lessons */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Bugünkü Ders Programım</h3>
          <p className="text-xs text-slate-500 mb-4">Sınıfına ait oturumlar</p>

          <div className="space-y-3">
            {myLessons.map((l) => (
              <div key={l.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{l.subject_name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({l.start_time} - {l.end_time})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{l.topic_name}</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                  {l.teacher_name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* My Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Son Yoklama Hareketlerim</h3>
          <p className="text-xs text-slate-500 mb-4">Ders katılım onayları</p>

          <div className="space-y-2">
            {myAttendance.slice(0, 5).map((att) => (
              <div key={att.id} className="p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-600 font-medium">{att.date}</span>
                <span
                  className={`font-bold capitalize px-2.5 py-1 rounded-lg ${
                    att.status === 'geldi'
                      ? 'bg-emerald-100 text-emerald-800'
                      : att.status === 'gelmedi'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
