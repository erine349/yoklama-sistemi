import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  ShieldAlert,
  X,
  Check,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { EducationType, Student, StudentStatus } from '../../types';

interface Props {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const MudurStudents: React.FC<Props> = ({ isAddModalOpen, onCloseAddModal }) => {
  const { students, classes, teachers, attendance, addStudent, updateStudent, deleteStudent, exportToCsv } = useSchool();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedEducationType, setSelectedEducationType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('aktif');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Sync external prop if passed
  React.useEffect(() => {
    if (isAddModalOpen !== undefined) {
      setShowAddModal(isAddModalOpen);
    }
  }, [isAddModalOpen]);

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  // Form State for New / Edit Student
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    student_number: '',
    birth_date: '2012-05-15',
    gender: 'Erkek' as 'Erkek' | 'Kız',
    education_type: 'gunduzlu' as EducationType,
    class_id: classes[0]?.id || '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    parent_relation: 'Anne',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.first_name.trim()) errors.first_name = 'Öğrenci adı zorunludur.';
    if (!formData.last_name.trim()) errors.last_name = 'Öğrenci soyadı zorunludur.';
    if (!formData.student_number.trim()) {
      errors.student_number = 'Öğrenci numarası zorunludur.';
    } else {
      // Check duplicate student number
      const duplicate = students.find(
        (s) => s.student_number === formData.student_number.trim() && s.id !== editingStudent?.id
      );
      if (duplicate) {
        errors.student_number = 'Bu öğrenci numarası zaten kullanımda.';
      }
    }
    if (!formData.class_id) errors.class_id = 'Sınıf seçimi zorunludur.';
    if (!formData.parent_name.trim()) errors.parent_name = 'Veli adı soyadı zorunludur.';
    if (!formData.parent_phone.trim()) errors.parent_phone = 'Veli telefonu zorunludur.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        student_number: formData.student_number,
        birth_date: formData.birth_date,
        gender: formData.gender,
        education_type: formData.education_type,
        class_id: formData.class_id,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        parent_email: formData.parent_email,
        parent_relation: formData.parent_relation,
      });
      setEditingStudent(null);
    } else {
      addStudent({
        first_name: formData.first_name,
        last_name: formData.last_name,
        student_number: formData.student_number,
        birth_date: formData.birth_date,
        gender: formData.gender,
        education_type: formData.education_type,
        class_id: formData.class_id,
        status: 'aktif',
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        parent_email: formData.parent_email,
        parent_relation: formData.parent_relation,
      });
      handleCloseAddModal();
    }

    // Reset
    setFormData({
      first_name: '',
      last_name: '',
      student_number: '',
      birth_date: '2012-05-15',
      gender: 'Erkek',
      education_type: 'gunduzlu',
      class_id: classes[0]?.id || '',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      parent_relation: 'Anne',
    });
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      student_number: student.student_number,
      birth_date: student.birth_date,
      gender: student.gender,
      education_type: student.education_type,
      class_id: student.class_id,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      parent_email: student.parent_email,
      parent_relation: student.parent_relation,
    });
    setFormErrors({});
  };

  // Filter Logic
  const filteredStudents = students.filter((s) => {
    if (selectedStatus === 'aktif' && s.deleted_at) return false;
    if (selectedStatus === 'pasif' && !s.deleted_at) return false;
    if (selectedClass !== 'all' && s.class_id !== selectedClass) return false;
    if (selectedEducationType !== 'all' && s.education_type !== selectedEducationType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q);
      const matchNo = s.student_number.includes(q);
      const matchParent = s.parent_name.toLowerCase().includes(q);
      if (!matchName && !matchNo && !matchParent) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Öğrenci Yönetimi</h2>
          <p className="text-xs text-slate-500">
            Tüm öğrencilerin kayıtları, veli ilişkileri ve devam durumları
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv('students')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV Dışa Aktar</span>
          </button>
          <button
            onClick={() => {
              setEditingStudent(null);
              setFormErrors({});
              setFormData({
                first_name: '',
                last_name: '',
                student_number: (800 + students.length + 1).toString(),
                birth_date: '2012-05-15',
                gender: 'Erkek',
                education_type: 'gunduzlu',
                class_id: classes[0]?.id || '',
                parent_name: '',
                parent_phone: '0533 ',
                parent_email: '',
                parent_relation: 'Anne',
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Öğrenci Kaydet</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Öğrenci adı, no veya veli adı ile ara..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">Tüm Sınıflar</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Sınıf {c.name}
              </option>
            ))}
          </select>

          {/* Education Type */}
          <select
            value={selectedEducationType}
            onChange={(e) => {
              setSelectedEducationType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">Tüm Tipler</option>
            <option value="gunduzlu">Gündüzlü</option>
            <option value="yatili">Yatılı</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700 cursor-pointer"
          >
            <option value="aktif">Aktif Kayıtlar</option>
            <option value="pasif">Arşivlenenler</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Öğrenci No</th>
                <th className="py-3.5 px-4">Ad Soyad</th>
                <th className="py-3.5 px-4">Sınıf</th>
                <th className="py-3.5 px-4">Cinsiyet / Tip</th>
                <th className="py-3.5 px-4">Veli İletişim</th>
                <th className="py-3.5 px-4 text-center">Devam Oranı</th>
                <th className="py-3.5 px-4 text-center">Risk Seviyesi</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Kayıtlı öğrenci bulunamadı. Filtreleri temizleyin veya yeni öğrenci ekleyin.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{student.student_number}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {student.first_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-[10px] text-slate-400">Kayıt: {student.registration_date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">{student.class_name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span>{student.gender}</span>
                      <span className="text-slate-300 mx-1">·</span>
                      <span className="capitalize">{student.education_type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">
                        {student.parent_name} <span className="text-slate-400 text-[10px]">({student.parent_relation})</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">{student.parent_phone}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        %{student.attendance_rate || 95}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          student.risk_level === 'Yuksek'
                            ? 'bg-rose-50 text-rose-700'
                            : student.risk_level === 'Orta'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {student.risk_level === 'Yuksek' ? 'Yüksek Risk' : student.risk_level === 'Orta' ? 'Orta Risk' : 'Normal'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Öğrenci Detayı"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!student.deleted_at && (
                          <button
                            onClick={() => setDeletingStudent(student)}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Arşive Kaldır"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Toplam <span className="font-bold text-slate-800">{filteredStudents.length}</span> öğrenci ({currentPage} / {totalPages} sayfa)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">{currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {(showAddModal || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStudent ? 'Öğrenci Bilgilerini Güncelle' : 'Yeni Öğrenci Kaydı (E-Okul Formatı)'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStudent(null);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 pt-4">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                1. Öğrenci Temel Bilgileri
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ad *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Ahmet"
                  />
                  {formErrors.first_name && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.first_name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Soyad *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Yılmaz"
                  />
                  {formErrors.last_name && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.last_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Öğrenci No *</label>
                  <input
                    type="text"
                    value={formData.student_number}
                    onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="821"
                  />
                  {formErrors.student_number && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.student_number}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sınıf / Şube *</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cinsiyet</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Erkek">Erkek</option>
                    <option value="Kız">Kız</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Eğitim Tipi</label>
                  <select
                    value={formData.education_type}
                    onChange={(e) => setFormData({ ...formData, education_type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="gunduzlu">Gündüzlü</option>
                    <option value="yatili">Yatılı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doğum Tarihi</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                2. Veli ve İletişim Bilgileri
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Veli Ad Soyad *</label>
                  <input
                    type="text"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Murat Yılmaz"
                  />
                  {formErrors.parent_name && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.parent_name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Yakınlık Derecesi</label>
                  <select
                    value={formData.parent_relation}
                    onChange={(e) => setFormData({ ...formData, parent_relation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Anne">Anne</option>
                    <option value="Baba">Baba</option>
                    <option value="Vasi">Vasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Veli Telefonu *</label>
                  <input
                    type="tel"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="0532 123 4567"
                  />
                  {formErrors.parent_phone && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.parent_phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Veli E-Posta</label>
                  <input
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="veli@gmail.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStudent(null);
                    if (onCloseAddModal) onCloseAddModal();
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingStudent ? 'Değişiklikleri Kaydet' : 'Öğrenciyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Detail Drawer / Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  {viewingStudent.first_name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {viewingStudent.first_name} {viewingStudent.last_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Öğrenci No: <span className="font-mono font-semibold">{viewingStudent.student_number}</span> · Sınıf: {viewingStudent.class_name}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingStudent(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* General Status Card (Genel Durum Kartı) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">Devam Oranı</span>
                  <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                    %{viewingStudent.attendance_rate || 95}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Devamsızlık</span>
                  <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    {viewingStudent.absenteeism_count || 0} Gün
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Risk Durumu</span>
                  <span className="text-xs font-bold text-emerald-800 mt-1 inline-block">
                    {viewingStudent.risk_level === 'Yuksek' ? 'Yüksek Risk' : 'Düşük'}
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Doğum Tarihi:</span>
                  <span className="font-medium text-slate-800">{viewingStudent.birth_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Cinsiyet & Eğitim Tipi:</span>
                  <span className="font-medium text-slate-800">{viewingStudent.gender} · {viewingStudent.education_type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Kayıt Tarihi:</span>
                  <span className="font-medium text-slate-800">{viewingStudent.registration_date}</span>
                </div>
              </div>

              {/* Parent Info */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5 text-xs">
                <span className="font-semibold text-emerald-900 block text-[11px] uppercase tracking-wider">
                  Veli Bilgisi
                </span>
                <p className="font-medium text-slate-900">
                  {viewingStudent.parent_name} ({viewingStudent.parent_relation})
                </p>
                <p className="text-slate-600 font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" /> {viewingStudent.parent_phone}
                </p>
                {viewingStudent.parent_email && (
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" /> {viewingStudent.parent_email}
                  </p>
                )}
              </div>

              {/* Recent Attendance Logs for Student */}
              <div>
                <span className="text-xs font-bold text-slate-900 mb-2 block">Son Yoklama Hareketleri</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {attendance
                    .filter((a) => a.student_id === viewingStudent.id)
                    .map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                        <span className="font-mono text-slate-500">{a.date}</span>
                        <span
                          className={`font-semibold capitalize px-2 py-0.5 rounded ${
                            a.status === 'geldi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.status === 'gelmedi'
                              ? 'bg-rose-100 text-rose-800'
                              : a.status === 'gec'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    ))}
                </div>
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

      {/* Delete / Archive Confirmation Modal (Soft Delete) */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Öğrenciyi Arşive Kaldır</h3>
            <p className="text-xs text-slate-500 mt-2">
              <span className="font-semibold text-slate-800">
                {deletingStudent.first_name} {deletingStudent.last_name}
              </span> ({deletingStudent.student_number}) kaydını arşive kaldırmak istediğinize emin misiniz? Geçmiş yoklama ve akademik veriler silinmeyecek, korunacaktır (Soft delete).
            </p>

            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  deleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Arşive Kaldır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
