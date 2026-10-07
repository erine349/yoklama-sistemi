import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Layers,
  ChevronDown,
  ChevronRight,
  School,
  CheckCircle,
  Clock,
  Send,
  X,
  FileCheck,
  Archive,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Curriculum, CurriculumTopic, CurriculumUnit } from '../../types';

interface Props {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  isAssignModalOpen?: boolean;
  onCloseAssignModal?: () => void;
}

export const MudurCurriculum: React.FC<Props> = ({
  isAddModalOpen,
  onCloseAddModal,
  isAssignModalOpen,
  onCloseAssignModal,
}) => {
  const {
    curriculums,
    classes,
    teachers,
    subjects,
    activeAcademicYear,
    topicProgress,
    addCurriculum,
    assignCurriculumToClass,
  } = useSchool();

  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>(curriculums[0]?.id || '');
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  React.useEffect(() => {
    if (isAddModalOpen !== undefined) setShowCreateModal(isAddModalOpen);
  }, [isAddModalOpen]);

  React.useEffect(() => {
    if (isAssignModalOpen !== undefined) setShowAssignModal(isAssignModalOpen);
  }, [isAssignModalOpen]);

  const handleCloseCreate = () => {
    setShowCreateModal(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleCloseAssign = () => {
    setShowAssignModal(false);
    if (onCloseAssignModal) onCloseAssignModal();
  };

  const activeCurriculum =
    curriculums.find((c) => c.id === selectedCurriculumId) || curriculums[0];

  // Create Curriculum Form State
  const [createForm, setCreateForm] = useState({
    name: '2026-2027 8. Sınıf Sosyal Bilgiler Müfredatı',
    subject_id: subjects[0]?.id || '',
    grade_level: 8,
    unit1_title: '1. Ünite: Bir Kahraman Doğuyor',
    unit1_topics: 'Uyanan Avrupa ve Değişen Osmanlı\nMavi Gözlü Çocuk: Mustafa\nBu Bunalımdan Nasıl Çıkılabilir?',
    unit2_title: '2. Ünite: Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar',
    unit2_topics: 'I. Dünya Savaşı ve Osmanlı\nİşgallere Karşı Tepkiler ve Kuvâ-yı Millîye\nTBMM’nin Açılışı',
  });

  const handleSaveCurriculum = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = subjects.find((s) => s.id === createForm.subject_id);

    const units: CurriculumUnit[] = [];

    if (createForm.unit1_title.trim()) {
      const topics1: CurriculumTopic[] = createForm.unit1_topics
        .split('\n')
        .filter((t) => t.trim().length > 0)
        .map((t, idx) => ({
          id: `top-new-1-${idx}-${Date.now()}`,
          unit_id: `unit-new-1`,
          title: t.trim(),
          order_index: idx + 1,
          estimated_hours: 4,
        }));

      units.push({
        id: `unit-new-1-${Date.now()}`,
        curriculum_id: '',
        title: createForm.unit1_title.trim(),
        order_index: 1,
        topics: topics1,
      });
    }

    if (createForm.unit2_title.trim()) {
      const topics2: CurriculumTopic[] = createForm.unit2_topics
        .split('\n')
        .filter((t) => t.trim().length > 0)
        .map((t, idx) => ({
          id: `top-new-2-${idx}-${Date.now()}`,
          unit_id: `unit-new-2`,
          title: t.trim(),
          order_index: idx + 1,
          estimated_hours: 4,
        }));

      units.push({
        id: `unit-new-2-${Date.now()}`,
        curriculum_id: '',
        title: createForm.unit2_title.trim(),
        order_index: 2,
        topics: topics2,
      });
    }

    const created = addCurriculum({
      name: createForm.name,
      subject_id: createForm.subject_id,
      subject_name: subject?.name || 'Sosyal Bilgiler',
      grade_level: Number(createForm.grade_level),
      academic_year_id: activeAcademicYear.id,
      version: 'v1.0',
      units,
    });

    setSelectedCurriculumId(created.id);
    handleCloseCreate();
  };

  // Assign Curriculum Form State
  const [assignForm, setAssignForm] = useState({
    curriculum_id: selectedCurriculumId,
    class_id: classes[0]?.id || '',
    teacher_id: teachers[0]?.id || '',
  });

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    assignCurriculumToClass(assignForm.class_id, assignForm.curriculum_id, assignForm.teacher_id);
    handleCloseAssign();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Müfredat Yönetim Sistemi</h2>
          <p className="text-xs text-slate-500">
            Hiyerarşik MEB & Özel Okul ünite, konu ve alt konu yapısı · Sınıf eşleştirmeleri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAssignForm({
                curriculum_id: selectedCurriculumId,
                class_id: classes[0]?.id || '',
                teacher_id: teachers[0]?.id || '',
              });
              setShowAssignModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span>Müfredatı Sınıfa Ata</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Müfredat Oluştur</span>
          </button>
        </div>
      </div>

      {/* Curriculum Selector & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left List of Curriculums */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">
            Aktif Müfredatlar ({curriculums.length})
          </div>

          {curriculums.map((curr) => {
            const isSelected = curr.id === activeCurriculum?.id;
            let totalTopics = 0;
            curr.units.forEach((u) => (totalTopics += u.topics.length));

            return (
              <button
                key={curr.id}
                onClick={() => setSelectedCurriculumId(curr.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-xs font-bold leading-snug ${
                      isSelected ? 'text-emerald-950' : 'text-slate-800'
                    }`}
                  >
                    {curr.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                  <span>{curr.grade_level}. Sınıf</span>
                  <span aria-hidden="true">·</span>
                  <span>{curr.units.length} Ünite</span>
                  <span aria-hidden="true">·</span>
                  <span>{totalTopics} Konu</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Details of Selected Curriculum */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6">
          {activeCurriculum ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{activeCurriculum.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeCurriculum.grade_level}. Sınıf · Ders: {activeCurriculum.subject_name} · Sürüm: {activeCurriculum.version}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
                    {activeAcademicYear.name} Dönemi
                  </span>
                </div>
              </div>

              {/* Units & Topics Accordion List */}
              <div className="mt-6 space-y-4">
                <div className="text-xs font-bold text-slate-700">Üniteler ve Konu Dağılımları</div>

                {activeCurriculum.units.map((unit, uIdx) => {
                  const isExpanded = expandedUnitId === unit.id || expandedUnitId === null;

                  return (
                    <div
                      key={unit.id}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs"
                    >
                      <button
                        onClick={() => setExpandedUnitId(isExpanded ? '' : unit.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                            {uIdx + 1}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">{unit.title}</span>
                            <span className="text-[11px] text-slate-400 block font-normal">
                              {unit.topics.length} Konu başlığı
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="p-3 divide-y divide-slate-100">
                          {unit.topics.map((topic, tIdx) => {
                            const prog = topicProgress.find((p) => p.topic_id === topic.id);
                            const isDone = prog?.status === 'tamamlandi';
                            const isOngoing = prog?.status === 'devam_ediyor';

                            return (
                              <div
                                key={topic.id}
                                className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-50/50 rounded-xl transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-slate-400 font-semibold">
                                    {uIdx + 1}.{tIdx + 1}
                                  </span>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-800">{topic.title}</p>
                                    {topic.description && (
                                      <p className="text-[11px] text-slate-400">{topic.description}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    {topic.estimated_hours} Saat
                                  </span>
                                  <span
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                      isDone
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : isOngoing
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {isDone ? 'Tamamlandı' : isOngoing ? 'Devam Ediyor' : 'Başlamadı'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">Müfredat seçiniz.</div>
          )}
        </div>
      </div>

      {/* Modal: Yeni Müfredat Oluştur */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Yeni Müfredat Tanımla</h3>
              <button onClick={handleCloseCreate} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCurriculum} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Müfredat Başlığı *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ders *</label>
                  <select
                    value={createForm.subject_id}
                    onChange={(e) => setCreateForm({ ...createForm, subject_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sınıf Seviyesi</label>
                  <select
                    value={createForm.grade_level}
                    onChange={(e) => setCreateForm({ ...createForm, grade_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value={5}>5. Sınıf</option>
                    <option value={6}>6. Sınıf</option>
                    <option value={7}>7. Sınıf</option>
                    <option value={8}>8. Sınıf</option>
                  </select>
                </div>
              </div>

              {/* Unit 1 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-semibold text-slate-800">1. Ünite Başlığı</label>
                <input
                  type="text"
                  value={createForm.unit1_title}
                  onChange={(e) => setCreateForm({ ...createForm, unit1_title: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                />
                <label className="block font-semibold text-slate-600 text-[11px]">Konular (Her satıra bir konu)</label>
                <textarea
                  rows={3}
                  value={createForm.unit1_topics}
                  onChange={(e) => setCreateForm({ ...createForm, unit1_topics: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                />
              </div>

              {/* Unit 2 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-semibold text-slate-800">2. Ünite Başlığı</label>
                <input
                  type="text"
                  value={createForm.unit2_title}
                  onChange={(e) => setCreateForm({ ...createForm, unit2_title: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                />
                <label className="block font-semibold text-slate-600 text-[11px]">Konular (Her satıra bir konu)</label>
                <textarea
                  rows={3}
                  value={createForm.unit2_topics}
                  onChange={(e) => setCreateForm({ ...createForm, unit2_topics: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Müfredatı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Müfredatı Sınıfa Ata */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Müfredatı Sınıfa Ata</h3>
              <button onClick={handleCloseAssign} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Müfredat</label>
                <select
                  value={assignForm.curriculum_id}
                  onChange={(e) => setAssignForm({ ...assignForm, curriculum_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {curriculums.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hedef Sınıf / Şube</label>
                <select
                  value={assignForm.class_id}
                  onChange={(e) => setAssignForm({ ...assignForm, class_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Sınıf {c.name} ({c.grade_level}. Sınıf)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dersi Yürütecek Öğretmen</label>
                <select
                  value={assignForm.teacher_id}
                  onChange={(e) => setAssignForm({ ...assignForm, teacher_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseAssign}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Atamayı Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
