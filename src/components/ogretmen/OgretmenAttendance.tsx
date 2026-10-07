import React, { useState } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  UserCheck,
  Play,
  Lock,
  Unlock,
  AlertCircle,
  Users,
  CheckCheck,
  Save,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus, Lesson } from '../../types';

interface Props {
  isStartModalOpen?: boolean;
  onCloseStartModal?: () => void;
}

export const OgretmenAttendance: React.FC<Props> = ({ isStartModalOpen, onCloseStartModal }) => {
  const { lessons, classes, students, attendance, startLesson, saveAttendance, markAllPresent, activeAcademicYear } =
    useSchool();

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    lessons.find((l) => !l.is_attendance_locked)?.id || lessons[0]?.id || ''
  );
  const [showStartModal, setShowStartModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (isStartModalOpen !== undefined) setShowStartModal(isStartModalOpen);
  }, [isStartModalOpen]);

  const handleCloseStartModal = () => {
    setShowStartModal(false);
    if (onCloseStartModal) onCloseStartModal();
  };

  const currentLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];
  const lessonStudents = students.filter(
    (s) => s.class_id === currentLesson?.class_id && !s.deleted_at
  );

  // Local attendance state for current lesson editing
  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});

  // Sync statuses from attendance store when currentLesson changes
  React.useEffect(() => {
    if (currentLesson) {
      const records = attendance.filter((a) => a.lesson_id === currentLesson.id);
      const newMap: Record<string, AttendanceStatus> = {};
      const noteMap: Record<string, string> = {};
      lessonStudents.forEach((s) => {
        const found = records.find((r) => r.student_id === s.id);
        newMap[s.id] = found ? found.status : 'geldi';
        if (found?.note) noteMap[s.id] = found.note;
      });
      setStudentStatuses(newMap);
      setStudentNotes(noteMap);
    }
  }, [currentLesson?.id, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (currentLesson?.is_attendance_locked) return;
    setStudentStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    if (currentLesson?.is_attendance_locked) return;
    const newMap: Record<string, AttendanceStatus> = {};
    lessonStudents.forEach((s) => {
      newMap[s.id] = 'geldi';
    });
    setStudentStatuses(newMap);
  };

  const handleSave = (lockLesson: boolean = false) => {
    if (!currentLesson) return;
    const records = lessonStudents.map((s) => ({
      student_id: s.id,
      status: studentStatuses[s.id] || 'geldi',
      note: studentNotes[s.id] || '',
    }));

    saveAttendance(currentLesson.id, records, lockLesson);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Start new lesson form
  const [newLessonForm, setNewLessonForm] = useState({
    class_id: classes[0]?.id || '',
    subject_name: 'Matematik',
    topic_name: 'Tam Sayıların Tam Sayı Kuvvetleri Alıştırmaları',
    start_time: '14:20',
    end_time: '15:00',
    lesson_date: '2026-10-07',
  });

  const handleStartNewLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === newLessonForm.class_id);
    const created = startLesson({
      class_id: newLessonForm.class_id,
      class_name: targetClass?.name || '8-A',
      subject_id: 'sub-mat',
      subject_name: newLessonForm.subject_name,
      teacher_id: 'teach-1',
      teacher_name: 'Ayşe Yılmaz',
      topic_name: newLessonForm.topic_name,
      lesson_date: newLessonForm.lesson_date,
      start_time: newLessonForm.start_time,
      end_time: newLessonForm.end_time,
    });

    setSelectedLessonId(created.id);
    handleCloseStartModal();
  };

  // Counts
  const counts = {
    geldi: Object.values(studentStatuses).filter((st) => st === 'geldi').length,
    gelmedi: Object.values(studentStatuses).filter((st) => st === 'gelmedi').length,
    gec: Object.values(studentStatuses).filter((st) => st === 'gec').length,
    izinli: Object.values(studentStatuses).filter((st) => st === 'izinli').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Canlı Yoklama Ekranı</h2>
          <p className="text-xs text-slate-500">
            Ders seçimi yapın, tek tıkla veya öğrenci bazlı yoklama alıp kilitleyin
          </p>
        </div>

        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Yeni Ders Başlat</span>
        </button>
      </div>

      {/* Lesson Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-700 shrink-0">Aktif Ders Oturumu:</label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full md:w-80 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
          >
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.class_name} · {l.subject_name} ({l.start_time} - {l.end_time}) {l.is_attendance_locked ? '🔒' : '⚡'}
              </option>
            ))}
          </select>
        </div>

        {/* Lock indicator & Batch button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {currentLesson?.is_attendance_locked ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bu Yoklama Kilitlendi</span>
            </span>
          ) : (
            <>
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-700" />
                <span>Tümünü Geldi Yap</span>
              </button>
              <button
                onClick={() => handleSave(false)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-600" />
                <span>Kaydet</span>
              </button>
              <button
                onClick={() => handleSave(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kaydet & Kilitle</span>
              </button>
            </>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" /> Yoklama başarıyla kaydedildi ve veritabanı güncellendi!
        </div>
      )}

      {/* Summary Chips */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-500 block">Geldi</span>
          <span className="text-lg font-bold text-emerald-700 font-mono tabular-nums">{counts.geldi}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-500 block">Gelmedi</span>
          <span className="text-lg font-bold text-rose-600 font-mono tabular-nums">{counts.gelmedi}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-500 block">Geç</span>
          <span className="text-lg font-bold text-amber-600 font-mono tabular-nums">{counts.gec}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-500 block">İzinli</span>
          <span className="text-lg font-bold text-blue-600 font-mono tabular-nums">{counts.izinli}</span>
        </div>
      </div>

      {/* Interactive Student Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Öğrenci Ad Soyad</th>
                <th className="py-3 px-4">Eğitim Tipi</th>
                <th className="py-3 px-4 text-center">Katılım Durumu (Tek Tıkla Seç)</th>
                <th className="py-3 px-4">Öğretmen Notu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessonStudents.map((student) => {
                const currentStatus = studentStatuses[student.id] || 'geldi';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{student.student_number}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {student.first_name[0]}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 capitalize">{student.education_type}</td>
                    <td className="py-3 px-4">
                      {/* 4 Big Touch-Friendly Buttons */}
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          disabled={currentLesson?.is_attendance_locked}
                          onClick={() => handleStatusChange(student.id, 'geldi')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            currentStatus === 'geldi'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Geldi
                        </button>
                        <button
                          type="button"
                          disabled={currentLesson?.is_attendance_locked}
                          onClick={() => handleStatusChange(student.id, 'gelmedi')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            currentStatus === 'gelmedi'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Gelmedi
                        </button>
                        <button
                          type="button"
                          disabled={currentLesson?.is_attendance_locked}
                          onClick={() => handleStatusChange(student.id, 'gec')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            currentStatus === 'gec'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Geç
                        </button>
                        <button
                          type="button"
                          disabled={currentLesson?.is_attendance_locked}
                          onClick={() => handleStatusChange(student.id, 'izinli')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            currentStatus === 'izinli'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          İzinli
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        disabled={currentLesson?.is_attendance_locked}
                        placeholder="Örn: 10 dk geç geldi..."
                        value={studentNotes[student.id] || ''}
                        onChange={(e) =>
                          setStudentNotes((prev) => ({ ...prev, [student.id]: e.target.value }))
                        }
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Lesson Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Yeni Canlı Ders Başlat</h3>
              <button onClick={handleCloseStartModal} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartNewLesson} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sınıf *</label>
                <select
                  value={newLessonForm.class_id}
                  onChange={(e) => setNewLessonForm({ ...newLessonForm, class_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Sınıf {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ders Adı *</label>
                <input
                  type="text"
                  required
                  value={newLessonForm.subject_name}
                  onChange={(e) => setNewLessonForm({ ...newLessonForm, subject_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">İşlenecek Konu Başlığı *</label>
                <input
                  type="text"
                  required
                  value={newLessonForm.topic_name}
                  onChange={(e) => setNewLessonForm({ ...newLessonForm, topic_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Başlangıç Saati</label>
                  <input
                    type="time"
                    value={newLessonForm.start_time}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bitiş Saati</label>
                  <input
                    type="time"
                    value={newLessonForm.end_time}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseStartModal}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Dersi Başlat & Yoklamayı Aç
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
