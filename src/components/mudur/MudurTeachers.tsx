import React, { useState } from 'react';
import { Users, Plus, Phone, Mail, BookOpen, School, Calendar, Edit2, X } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Teacher } from '../../types';

interface Props {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const MudurTeachers: React.FC<Props> = ({ isAddModalOpen, onCloseAddModal }) => {
  const { teachers, classes, students, addTeacher, updateTeacher } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  React.useEffect(() => {
    if (isAddModalOpen !== undefined) {
      setShowAddModal(isAddModalOpen);
    }
  }, [isAddModalOpen]);

  const handleClose = () => {
    setShowAddModal(false);
    setEditingTeacher(null);
    if (onCloseAddModal) onCloseAddModal();
  };

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    branch: 'Matematik',
    assigned_class_ids: [] as string[],
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) return;

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        branch: formData.branch,
        assigned_class_ids: formData.assigned_class_ids,
      });
    } else {
      addTeacher({
        profile_id: `prof-new-${Date.now()}`,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        branch: formData.branch,
        status: 'aktif',
        assigned_class_ids: formData.assigned_class_ids,
      });
    }

    handleClose();
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      branch: 'Matematik',
      assigned_class_ids: [],
    });
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      full_name: t.full_name,
      email: t.email,
      phone: t.phone,
      branch: t.branch,
      assigned_class_ids: t.assigned_class_ids,
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Öğretmen Kadrosu</h2>
          <p className="text-xs text-slate-500">
            Branş dağılımları, sorumlu oldukları sınıflar ve ders yükleri
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTeacher(null);
            setFormData({
              full_name: '',
              email: '',
              phone: '0532 ',
              branch: 'Matematik',
              assigned_class_ids: [classes[0]?.id || ''],
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Öğretmen Ekle</span>
        </button>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teachers.map((teacher) => {
          const assignedClasses = classes.filter((c) => teacher.assigned_class_ids.includes(c.id));
          const totalAssignedStudents = students
            .filter((s) => !s.deleted_at && teacher.assigned_class_ids.includes(s.class_id))
            .length;

          return (
            <div key={teacher.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm ring-1 ring-teal-200">
                      {teacher.full_name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{teacher.full_name}</h3>
                      <p className="text-xs font-semibold text-emerald-700">{teacher.branch} Öğretmeni</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>İşe Başlama: {teacher.hire_date}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5" /> Sorumlu Sınıflar & Öğrenci Sayısı
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {assignedClasses.map((cls) => (
                      <span key={cls.id} className="text-xs font-bold text-slate-800 px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                        {cls.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Toplam <span className="font-bold text-slate-700">{totalAssignedStudents}</span> öğrenci
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingTeacher ? 'Öğretmen Bilgilerini Düzenle' : 'Yeni Öğretmen Kaydı'}
              </h3>
              <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branş *</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Matematik">Matematik</option>
                    <option value="Fen Bilimleri">Fen Bilimleri</option>
                    <option value="Türkçe">Türkçe</option>
                    <option value="Sosyal Bilgiler">Sosyal Bilgiler</option>
                    <option value="İngilizce">İngilizce</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="0532 000 0000"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-Posta (Sistem Girişi) *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="isim.soyisim@akademipro.k12.tr"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Atanacak Sınıflar</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {classes.map((cls) => {
                    const isSelected = formData.assigned_class_ids.includes(cls.id);
                    return (
                      <button
                        type="button"
                        key={cls.id}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              assigned_class_ids: formData.assigned_class_ids.filter((id) => id !== cls.id),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assigned_class_ids: [...formData.assigned_class_ids, cls.id],
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cls.name}
                      </button>
                    );
                  })}
                </div>
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
                  {editingTeacher ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
