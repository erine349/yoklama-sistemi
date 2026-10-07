import React from 'react';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useSchool } from '../../context/SchoolContext';

interface Props {
  onNavigate: (tab: string) => void;
  onOpenNewStudent: () => void;
  onOpenNewTeacher: () => void;
  onOpenNewClass: () => void;
  onOpenNewCurriculum: () => void;
  onOpenAssignCurriculum: () => void;
}

export const MudurDashboard: React.FC<Props> = ({
  onNavigate,
  onOpenNewStudent,
  onOpenNewTeacher,
  onOpenNewClass,
  onOpenNewCurriculum,
  onOpenAssignCurriculum,
}) => {
  const { students, teachers, classes, curriculums, topicProgress, activityLogs, exportToCsv } = useSchool();

  const activeStudents = students.filter((s) => !s.deleted_at);
  const totalStudents = activeStudents.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.filter((c) => c.is_active).length;
  const totalCurriculums = curriculums.filter((c) => !c.is_archived).length;

  // Average attendance rate
  const avgAttendance = Math.round(
    activeStudents.reduce((acc, curr) => acc + (curr.attendance_rate || 90), 0) / (totalStudents || 1)
  );

  // At-risk students (>10% absenteeism or risk_level === 'Yuksek')
  const atRiskStudents = activeStudents.filter(
    (s) => (s.attendance_rate && s.attendance_rate < 90) || s.risk_level === 'Yuksek'
  );

  // Class comparison data for charts
  const classChartData = classes.map((c) => {
    const classStus = activeStudents.filter((s) => s.class_id === c.id);
    const avg =
      classStus.length > 0
        ? Math.round(classStus.reduce((a, b) => a + (b.attendance_rate || 0), 0) / classStus.length)
        : c.attendance_rate || 92;
    return {
      name: c.name,
      ogrenci: classStus.length,
      devam: avg,
    };
  });

  // Curriculum progress calculation
  const curriculumChartData = curriculums.map((curr) => {
    let totalTopics = 0;
    let completedTopics = 0;
    curr.units.forEach((u) => {
      totalTopics += u.topics.length;
      u.topics.forEach((t) => {
        const prog = topicProgress.find((p) => p.topic_id === t.id);
        if (prog?.status === 'tamamlandi') completedTopics += 1;
      });
    });
    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return {
      name: curr.subject_name || curr.name.split(' ')[2] || 'Ders',
      tamamlanan: completedTopics,
      toplam: totalTopics,
      yuzde: percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Yönetim Kurulu Genel Bakış
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            2026-2027 Eğitim Öğretim Yılı · Tüm akademik birimlerin anlık canlı verileri
          </p>
        </div>

        {/* Quick CSV Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv('students')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Öğrenci Raporu (CSV)</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards (Single elevation, zero-pill, tabular numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Öğrenci */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Toplam Öğrenci</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalStudents}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span>{activeStudents.filter((s) => s.education_type === 'yatili').length} Yatılı</span>
            <span aria-hidden="true">·</span>
            <span>{activeStudents.filter((s) => s.education_type === 'gunduzlu').length} Gündüzlü</span>
          </div>
        </div>

        {/* Toplam Öğretmen */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Öğretmen Kadrosu</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalTeachers}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span>3 Aktif Branş</span>
            <span aria-hidden="true">·</span>
            <span>Tam Zamanlı</span>
          </div>
        </div>

        {/* Aktif Sınıflar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Aktif Şubeler</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalClasses}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span>8-A & 8-B Şubeleri</span>
            <span aria-hidden="true">·</span>
            <span>Kontenjan: 44</span>
          </div>
        </div>

        {/* Ortalama Devam Oranı */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Genel Devam Oranı</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums flex items-baseline gap-1">
            %{avgAttendance}
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium mt-2">
            <span>Normal Eşikte</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">Hedef: %90+</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Hızlı İşlemler Barı) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <div className="text-xs font-semibold text-slate-700 mb-3 flex items-center justify-between">
          <span>Hızlı İdari İşlemler</span>
          <span className="text-[11px] text-slate-400 font-normal">Tek tıkla yeni kayıt veya müfredat tanımlama</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewStudent}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Öğrenci Kaydet
          </button>
          <button
            onClick={onOpenNewTeacher}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Öğretmen Ekle
          </button>
          <button
            onClick={onOpenNewClass}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Sınıf Oluştur
          </button>
          <button
            onClick={onOpenNewCurriculum}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Müfredat Oluştur
          </button>
          <button
            onClick={onOpenAssignCurriculum}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            Müfredatı Sınıfa Ata
          </button>
        </div>
      </div>

      {/* Two Column Charts: Curriculum Progress + Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Müfredat İlerleme Oranları */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ders Bazlı Müfredat İlerlemesi</h3>
                <p className="text-xs text-slate-500">Tamamlanan konu sayısı ve müfredat yüzdesi</p>
              </div>
              <button
                onClick={() => onNavigate('curriculum')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Müfredat Detayı <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={curriculumChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(val: any) => [`%${val}`, 'İlerleme Oranı']}
                  />
                  <Bar dataKey="yuzde" fill="#047857" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            {curriculumChartData.map((item) => (
              <div key={item.name} className="p-2 rounded-xl bg-slate-50">
                <span className="text-[11px] text-slate-500 block truncate">{item.name}</span>
                <span className="text-xs font-bold text-slate-800 font-mono tabular-nums">
                  {item.tamamlanan}/{item.toplam} Konu (%{item.yuzde})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sınıflara Göre Devam Durumları */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sınıf Bazlı Devam Oranları</h3>
                <p className="text-xs text-slate-500">Şubelerin anlık devam yüzdesi</p>
              </div>
              <button
                onClick={() => onNavigate('classes')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Sınıflar <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[70, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(val: any) => [`%${val}`, 'Devam Oranı']}
                  />
                  <Bar dataKey="devam" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-around text-xs">
            {classChartData.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-slate-600 font-medium">{c.name}:</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">%{c.devam} ({c.ogrenci} Öğrenci)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: At-Risk Students & Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Devamsızlık Eşiği Uyarısı (Riskli Öğrenciler) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Devamsızlık Riski Taşıyan Öğrenciler</h3>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {atRiskStudents.length} Riskli Kayıt
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Devamsızlık oranı %10 eşiğini aşan veya aşmak üzere olan öğrenciler otomatik tespit edilmiştir.
          </p>

          <div className="space-y-2.5">
            {atRiskStudents.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-amber-200/60 bg-amber-50/30 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {s.first_name} {s.last_name} ({s.student_number})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sınıf: {s.class_name} · Veli: {s.parent_name} ({s.parent_phone})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-700 font-mono tabular-nums block">
                    %{s.attendance_rate} Devam
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {s.absenteeism_count} Gün Devamsız
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Son İdari İşlemler (Audit Logs) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Son Sistem Aktiviteleri (Audit Trail)</h3>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Tümünü Gör
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Müdür ve öğretmenler tarafından gerçekleştirilen son kritik işlemler
          </p>

          <div className="space-y-3">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 mt-0.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">{log.user_name}</p>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.created_at}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate">{log.target_entity}</p>
                  <p className="text-[11px] text-slate-400 truncate">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
