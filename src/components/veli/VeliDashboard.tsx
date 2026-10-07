import React from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNavigate: (tab: string) => void;
}

export const VeliDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { students, selectedParentStudentId, setSelectedParentStudentId, attendance, lessons } = useSchool();
  const { currentUser } = useAuth();

  // Multi-child support: Mustafa Çelik is the parent of Kerem Çelik (stu-801) and Defne Çelik (stu-811)
  const myChildren = students.filter(
    (s) => s.parent_email === currentUser.email || s.parent_name.includes('Mustafa Çelik')
  );

  const activeStudent =
    students.find((s) => s.id === selectedParentStudentId) || myChildren[0] || students[0];

  // Attendance for active child
  const childAttendance = attendance.filter((a) => a.student_id === activeStudent.id);
  const todayRecord = childAttendance.find((a) => a.date === '2026-10-07');

  const attendanceRate = activeStudent.attendance_rate || 95;
  const isAtRisk = attendanceRate < 90 || activeStudent.risk_level === 'Yuksek';

  return (
    <div className="space-y-6">
      {/* Multi-Child Selector Bar */}
      {myChildren.length > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-800">Kayıtlı Çocuklarınız (Çoklu Öğrenci):</span>
          </div>
          <div className="flex items-center gap-2">
            {myChildren.map((child) => {
              const isSelected = child.id === activeStudent.id;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedParentStudentId(child.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {child.first_name} {child.last_name} ({child.class_name})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Student Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xl shadow-xs ring-2 ring-emerald-200">
            {activeStudent.first_name[0]}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Öğrenci Profili
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeStudent.first_name} {activeStudent.last_name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Öğrenci No: <span className="font-mono font-bold text-slate-700">{activeStudent.student_number}</span> · Sınıf: <span className="font-bold text-slate-700">{activeStudent.class_name}</span> · Eğitim Tipi: <span className="capitalize">{activeStudent.education_type}</span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl">
            Aktif Öğrenci
          </span>
        </div>
      </div>

      {/* Devamsızlık Eşiği Uyarısı (Eğer devamsızlık %10'u geçtiyse) */}
      {isAtRisk && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-amber-900">Devamsızlık Sınırı Uyarısı</p>
            <p className="text-amber-800 mt-0.5">
              Öğrencinizin devam oranı %{attendanceRate} seviyesindedir. Yasal devamsızlık sınırına yaklaşmamak için lütfen ders katılımlarını takip ediniz.
            </p>
          </div>
        </div>
      )}

      {/* Genel Durum Kartı (4 Metrik) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Genel Devam Oranı</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            %{attendanceRate}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Toplam 20 iş günü</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Müfredat İlerlemesi</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            %{activeStudent.curriculum_rate || 80}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dönem hedefine uygun</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Bugünkü Katılım Durumu</span>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            {todayRecord ? (
              <span className="capitalize text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {todayRecord.status}
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Derste</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tarih: 07.10.2026</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500 block mb-1">Akademik Risk Düzeyi</span>
          <div className="text-base font-bold text-slate-900 mt-1">
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                isAtRisk ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isAtRisk ? 'Dikkat Edilmeli' : 'Düşük Risk'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Düzenli Takip</p>
        </div>
      </div>

      {/* Two Column Cards: Subject Progress & Recent Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ders Müfredat İlerlemeleri</h3>
                <p className="text-xs text-slate-500">Çocuğunuzun sınıfında işlenen konular</p>
              </div>
              <button
                onClick={() => onNavigate('curriculum')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                Müfredat Detayı <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800">Matematik</span>
                  <span className="font-mono text-emerald-700">%80</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800">Fen Bilimleri</span>
                  <span className="font-mono text-emerald-700">%65</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800">Türkçe</span>
                  <span className="font-mono text-emerald-700">%90</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-700 h-full rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400">
            Müfredat konuları öğretmen tarafından işlendikçe canlı güncellenir.
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Son Yoklama Geçmişi</h3>
                <p className="text-xs text-slate-500">Günlük ders katılım durumları</p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                Tüm Geçmiş <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {childAttendance.slice(0, 4).map((att) => (
                <div key={att.id} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{att.date}</span>
                    <span className="text-[11px] text-slate-400 ml-2">Matematik Dersi</span>
                  </div>
                  <span
                    className={`font-bold capitalize px-2.5 py-1 rounded-lg ${
                      att.status === 'geldi'
                        ? 'bg-emerald-100 text-emerald-800'
                        : att.status === 'gelmedi'
                        ? 'bg-rose-100 text-rose-800'
                        : att.status === 'gec'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400">
            Öğrencinin yoklamaları her ders sonunda anlık olarak veli paneline yansır.
          </div>
        </div>
      </div>
    </div>
  );
};
