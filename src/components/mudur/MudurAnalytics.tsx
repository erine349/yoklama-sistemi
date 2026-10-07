import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const MudurAnalytics: React.FC = () => {
  const { students, classes, teachers, curriculums, topicProgress, attendance, exportToCsv, activeAcademicYear } = useSchool();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedRange, setSelectedRange] = useState<string>('month');

  const activeStudents = students.filter((s) => !s.deleted_at);

  // 1. Weekly Attendance Trend Data
  const weeklyAttendanceData = [
    { day: '01 Eki', katilim: 96, devamsiz: 4 },
    { day: '02 Eki', katilim: 95, devamsiz: 5 },
    { day: '05 Eki', katilim: 92, devamsiz: 8 },
    { day: '06 Eki', katilim: 97, devamsiz: 3 },
    { day: '07 Eki (Bugün)', katilim: 94, devamsiz: 6 },
  ];

  // 2. Class Comparison Data
  const classComparisonData = classes.map((c) => {
    const classStus = activeStudents.filter((s) => s.class_id === c.id);
    const avgAttendance =
      classStus.length > 0
        ? Math.round(classStus.reduce((acc, s) => acc + (s.attendance_rate || 90), 0) / classStus.length)
        : 90;
    const avgCurriculum =
      classStus.length > 0
        ? Math.round(classStus.reduce((acc, s) => acc + (s.curriculum_rate || 80), 0) / classStus.length)
        : 80;

    return {
      name: `Sınıf ${c.name}`,
      devam: avgAttendance,
      mufredat: avgCurriculum,
      ogrenci: classStus.length,
    };
  });

  // 3. Gender / Education Type Distribution
  const educationTypeData = [
    { name: 'Gündüzlü', value: activeStudents.filter((s) => s.education_type === 'gunduzlu').length },
    { name: 'Yatılı', value: activeStudents.filter((s) => s.education_type === 'yatili').length },
  ];
  const COLORS = ['#059669', '#0d9488'];

  // 4. Curriculum Progress by Subject
  const subjectProgressData = curriculums.map((curr) => {
    let totalTopics = 0;
    let completedTopics = 0;
    curr.units.forEach((u) => {
      totalTopics += u.topics.length;
      u.topics.forEach((t) => {
        const prog = topicProgress.find((p) => p.topic_id === t.id);
        if (prog?.status === 'tamamlandi') completedTopics += 1;
      });
    });

    return {
      name: curr.subject_name || curr.name.split(' ')[2] || 'Ders',
      tamamlanan: completedTopics,
      kalan: totalTopics - completedTopics,
      yuzde: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with Export buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Akademik Analiz Merkezi</h2>
          <p className="text-xs text-slate-500">
            {activeAcademicYear.name} Dönemi · Yoklama trendleri, ders ilerleme hızları ve sınıf başarı grafikleri
          </p>
        </div>

        {/* CSV Reports */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToCsv('students')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Öğrenci Raporu</span>
          </button>
          <button
            onClick={() => exportToCsv('attendance')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Yoklama Raporu</span>
          </button>
          <button
            onClick={() => exportToCsv('curriculum')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Müfredat Raporu</span>
          </button>
        </div>
      </div>

      {/* Row 1: Weekly Attendance Trend + Sınıf Başarı / Müfredat Karşılaştırması */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yoklama Trendi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Günlük Katılım ve Devamsızlık Trendi</h3>
              <p className="text-xs text-slate-500">Okul geneli günlük katılım yüzdesi (%)</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Ortalama: %94.8
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[80, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(val: any) => [`%${val}`, 'Katılım Oranı']}
                />
                <Line
                  type="monotone"
                  dataKey="katilim"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sınıf Karşılaştırması (Devam vs Müfredat İlerlemesi) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Şube Bazlı Devam ve Müfredat Karşılaştırması</h3>
              <p className="text-xs text-slate-500">8-A ve 8-B şubelerinin karşılaştırmalı verisi</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar name="Devam Oranı" dataKey="devam" fill="#047857" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar name="Müfredat Tamamlama" dataKey="mufredat" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Ders Konu Tamamlanma Grafiği & Yatılı/Gündüzlü Dağılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ders Müfredat Durumu (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Ders Bazında Konu İlerleme Hızı</h3>
          <p className="text-xs text-slate-500 mb-4">Tamamlanan ve kalan konu sayıları</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={subjectProgressData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar name="Tamamlanan Konu" dataKey="tamamlanan" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
                <Bar name="Kalan Konu" dataKey="kalan" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Eğitim Tipi Pasta Grafiği (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Eğitim Tipi Dağılımı</h3>
            <p className="text-xs text-slate-500 mb-3">Yatılı vs Gündüzlü öğrenci oranı</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={educationTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {educationTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-slate-600">Gündüzlü:</span>
              <span className="font-bold text-slate-900 font-mono">
                {activeStudents.filter((s) => s.education_type === 'gunduzlu').length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              <span className="text-slate-600">Yatılı:</span>
              <span className="font-bold text-slate-900 font-mono">
                {activeStudents.filter((s) => s.education_type === 'yatili').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
