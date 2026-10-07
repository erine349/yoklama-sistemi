import React, { useState } from 'react';
import { School, Plus, Users, BookOpen, CalendarCheck, UserCheck, ChevronRight, X } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolClass, Student } from '../../types';

interface Props {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const MudurClasses: React.FC<Props> = ({ isAddModalOpen, onCloseAddModal }) => {
  const { classes, students, teachers, curriculums, addClass, activeAcademicYear } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClassForDetail, setSelectedClassForDetail] = useState<SchoolClass | null>(null);

  React.useEffect(() => {
    if (isAddModalOpen !== undefined) {
      setShowAddModal(isAddModalOpen);
    }
  }, [isAddModalOpen]);

  const handleClose = () => {
    setShowAddModal(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const [formData, setFormData] = useState({
    name: '7-B',
    grade_level: 7,
    section: 'B',
    class_teacher_id: teachers[0]?.id || '',
    capacity: 22,
  });

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === formData.class_teacher_id);
    addClass({
      name: `${formData.grade_level}-${formData.section}`,
      grade_level: Number(formData.grade_level),
      section: formData.section.toUpperCase(),
      academic_year_id: activeAcademicYear.id,
      class_teacher_id: formData.class_teacher_id,
      class_teacher_name: teacher ? `${teacher.full_name} (${teacher.branch})` : undefined,
      capacity: Number(formData.capacity),
      is_active: true,
    });
    handleClose();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sınıflar ve Şubeler</h2>
          <p className="text-xs text-slate-500">
            {activeAcademicYear.name} eğitim dönemi aktif sınıf seviyeleri ve şube atamaları
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Sınıf Oluştur</span>
        </button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.class_id === cls.id && !s.deleted_at);
          const studentCount = classStudents.length;
          const avgAttendance =
            studentCount > 0
              ? Math.round(classStudents.reduce((acc, s) => acc + (s.attendance_rate || 90), 0) / studentCount)
              : 95;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center text-sm ring-1 ring-emerald-200">
                      {cls.name}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Sınıf {cls.name}</h3>
                      <p className="text-[11px] text-slate-400 font-medium">{cls.grade_level}. Sınıf Şubesi</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Aktif
                  </span>
                </div>

                <div className="py-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Sınıf Rehber Öğretmeni:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                      {cls.class_teacher_name || 'Atanmadı'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Kayıtlı Öğrenci / Kontenjan:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {studentCount} / {cls.capacity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Şube Devam Ortalaması:</span>
                    <span className="font-mono font-bold text-emerald-700">%{avgAttendance}</span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (studentCount / cls.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">2026-2027</span>
                <button
                  onClick={() => setSelectedClassForDetail(cls)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  Sınıf Öğrencileri <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Students Detail Modal */}
      {selectedClassForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  {selectedClassForDetail.name}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Sınıf {selectedClassForDetail.name} Öğrenci Listesi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rehber Öğretmen: {selectedClassForDetail.class_teacher_name || 'Atanmadı'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClassForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Ad Soyad</th>
                    <th className="py-2.5 px-3">Veli</th>
                    <th className="py-2.5 px-3 text-center">Devam %</th>
                    <th className="py-2.5 px-3 text-center">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((s) => s.class_id === selectedClassForDetail.id && !s.deleted_at)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{s.student_number}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {s.first_name} {s.last_name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {s.parent_name} ({s.parent_relation})
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                          %{s.attendance_rate || 95}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              s.risk_level === 'Yuksek'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {s.risk_level === 'Yuksek' ? 'Riskli' : 'Düşük'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedClassForDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Yeni Sınıf / Şube Tanımla</h3>
              <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sınıf Seviyesi *</label>
                  <select
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value={5}>5. Sınıf</option>
                    <option value={6}>6. Sınıf</option>
                    <option value={7}>7. Sınıf</option>
                    <option value={8}>8. Sınıf</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Şube Harfi *</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold uppercase"
                    placeholder="A, B, C"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sınıf Rehber Öğretmeni</label>
                <select
                  value={formData.class_teacher_id}
                  onChange={(e) => setFormData({ ...formData, class_teacher_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="">Öğretmen Seçiniz...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maksimum Kontenjan</label>
                <input
                  type="number"
                  min={10}
                  max={35}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Sınıfı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
