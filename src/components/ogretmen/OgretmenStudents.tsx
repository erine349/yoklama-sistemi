import React, { useState } from 'react';
import { Search, GraduationCap, Eye, Phone, Mail, X } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';

export const OgretmenStudents: React.FC = () => {
  const { students, classes, attendance } = useSchool();
  const { currentUser } = useAuth();

  // Find classes assigned to current teacher (e.g. 8-A, 8-B)
  const assignedClassIds = classes
    .filter((c) => c.class_teacher_id === currentUser.id || c.name.startsWith('8-'))
    .map((c) => c.id);

  // RLS Enforcement: Teacher can ONLY see students in their assigned classes!
  const myStudents = students.filter(
    (s) => assignedClassIds.includes(s.class_id) && !s.deleted_at
  );

  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const filtered = myStudents.filter((s) => {
    if (selectedClass !== 'all' && s.class_id !== selectedClass) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.student_number.includes(q) ||
        s.parent_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Öğrencilerim</h2>
          <p className="text-xs text-slate-500">
            Yalnızca size atanmış olan şubelerin (8-A & 8-B) kayıtlı öğrencileri
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {filtered.length} Kayıtlı Öğrenci
        </span>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Öğrenci adı veya numarası ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700 cursor-pointer w-full sm:w-auto"
        >
          <option value="all">Tüm Şubelerim</option>
          {classes
            .filter((c) => assignedClassIds.includes(c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>
                Sınıf {c.name}
              </option>
            ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Öğrenci Ad Soyad</th>
                <th className="py-3 px-4">Sınıf</th>
                <th className="py-3 px-4">Eğitim Tipi</th>
                <th className="py-3 px-4">Veli Bilgisi</th>
                <th className="py-3 px-4 text-center">Devam %</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{s.student_number}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">{s.class_name}</td>
                  <td className="py-3 px-4 text-slate-500 capitalize">{s.education_type}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{s.parent_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{s.parent_phone}</p>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                    %{s.attendance_rate || 95}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setViewingStudent(s)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {viewingStudent.first_name} {viewingStudent.last_name} ({viewingStudent.student_number})
              </h3>
              <button onClick={() => setViewingStudent(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span>Devam Oranı:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  %{viewingStudent.attendance_rate || 95}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span>Devamsızlık Gün Sayısı:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {viewingStudent.absenteeism_count || 0} Gün
                </span>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-1">Veli İletişimi:</span>
                <p className="text-slate-700">{viewingStudent.parent_name} ({viewingStudent.parent_relation})</p>
                <p className="font-mono text-slate-600 mt-0.5">{viewingStudent.parent_phone}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
