import React, { useState } from 'react';
import { CalendarCheck, Filter, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const VeliAttendance: React.FC = () => {
  const { students, selectedParentStudentId, attendance } = useSchool();
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const activeStudent =
    students.find((s) => s.id === selectedParentStudentId) || students[0];

  const studentRecords = attendance.filter((a) => a.student_id === activeStudent.id);

  // Filter logic
  const filteredRecords = studentRecords.filter((rec) => {
    if (filterPeriod === 'today') return rec.date === '2026-10-07';
    return true;
  });

  const presentCount = studentRecords.filter((r) => r.status === 'geldi').length;
  const absentCount = studentRecords.filter((r) => r.status === 'gelmedi').length;
  const lateCount = studentRecords.filter((r) => r.status === 'gec').length;
  const excusedCount = studentRecords.filter((r) => r.status === 'izinli').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            {activeStudent.first_name} {activeStudent.last_name} ({activeStudent.student_number})
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
            Yoklama ve Devamsızlık Takibi
          </h2>
          <p className="text-xs text-slate-500">
            Ders bazında günlük yoklama kayıtları ve mazeret durumları
          </p>
        </div>

        {/* Filter Period Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPeriod === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPeriod === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bugün
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 block">Katıldığı Dersler</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">{presentCount} Ders</div>
          <span className="text-[11px] text-emerald-800 font-semibold block mt-1">Eksiksiz Katılım</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 block">Özürsüz Devamsızlık</span>
          <div className="text-2xl font-bold text-rose-600 font-mono mt-1">{absentCount} Ders</div>
          <span className="text-[11px] text-slate-400 block mt-1">Yasal Hak: 10 Gün</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 block">Geç Kalma</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{lateCount} Kez</div>
          <span className="text-[11px] text-slate-400 block mt-1">İlk 15 Dk Giriş</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 block">İzinli / Raporlu</span>
          <div className="text-2xl font-bold text-blue-600 font-mono mt-1">{excusedCount} Ders</div>
          <span className="text-[11px] text-slate-400 block mt-1">Veli Bildirimli</span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Günlük Yoklama Defteri Kayıtları</span>
          <span>{filteredRecords.length} Kayıt Gösteriliyor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Ders / Şube</th>
                <th className="py-3 px-4 text-center">Durum</th>
                <th className="py-3 px-4">Açıklama / Not</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    Seçilen dönemde yoklama kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{rec.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      Matematik Dersi ({activeStudent.class_name})
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold capitalize px-3 py-1 rounded-lg text-xs ${
                          rec.status === 'geldi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'gelmedi'
                            ? 'bg-rose-100 text-rose-800'
                            : rec.status === 'gec'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic">
                      {rec.note ? rec.note : 'Not eklenmedi.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
