import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, Edit3, Save, Check } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { TopicStatus } from '../../types';

export const OgretmenCurriculum: React.FC = () => {
  const { curriculums, topicProgress, updateTopicProgress } = useSchool();
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>(curriculums[0]?.id || '');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCurriculum =
    curriculums.find((c) => c.id === selectedCurriculumId) || curriculums[0];

  let totalTopics = 0;
  let completedTopics = 0;
  let ongoingTopics = 0;

  activeCurriculum?.units.forEach((u) => {
    totalTopics += u.topics.length;
    u.topics.forEach((t) => {
      const prog = topicProgress.find((p) => p.topic_id === t.id);
      if (prog?.status === 'tamamlandi') completedTopics += 1;
      if (prog?.status === 'devam_ediyor') ongoingTopics += 1;
    });
  });

  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const handleStatusChange = (topicId: string, status: TopicStatus) => {
    updateTopicProgress(topicId, `cc-8a-${activeCurriculum.id}`, status);
    setToastMessage(`Konu durumu "${status === 'tamamlandi' ? 'Tamamlandı' : status === 'devam_ediyor' ? 'Devam Ediyor' : 'Başlamadı'}" olarak güncellendi.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveNote = (topicId: string) => {
    const prog = topicProgress.find((p) => p.topic_id === topicId);
    updateTopicProgress(topicId, `cc-8a-${activeCurriculum.id}`, prog?.status || 'devam_ediyor', noteText);
    setEditingTopicId(null);
    setToastMessage('Öğretmen ders notu kaydedildi.');
    setTimeout(() => setToastMessage(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Müfredat İlerleme Takibi</h2>
          <p className="text-xs text-slate-500">
            Ders konularının tamamlanma aşamalarını işaretleyin ve öğretmen değerlendirme notları ekleyin
          </p>
        </div>

        {/* Curriculum Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Ders:</label>
          <select
            value={selectedCurriculumId}
            onChange={(e) => setSelectedCurriculumId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
          >
            {curriculums.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* Progress Metric Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{activeCurriculum.name}</h3>
            <p className="text-xs text-slate-500">
              Toplam {totalTopics} Konu · {completedTopics} Tamamlandı · {ongoingTopics} Devam Ediyor
            </p>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
            %{percentage}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Units & Topics List */}
      <div className="space-y-4">
        {activeCurriculum.units.map((unit, uIdx) => (
          <div key={unit.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {uIdx + 1}
              </span>
              <h4 className="font-bold text-slate-900 text-xs">{unit.title}</h4>
            </div>

            <div className="divide-y divide-slate-100">
              {unit.topics.map((topic, tIdx) => {
                const prog = topicProgress.find((p) => p.topic_id === topic.id);
                const currentStatus: TopicStatus = prog?.status || 'baslamadi';
                const isEditingThis = editingTopicId === topic.id;

                return (
                  <div key={topic.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-mono font-bold text-slate-400 mt-0.5">
                          {uIdx + 1}.{tIdx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{topic.title}</p>
                          {topic.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{topic.description}</p>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            Tahmini Süre: {topic.estimated_hours} Saat
                          </span>
                        </div>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-1.5 self-start md:self-center">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(topic.id, 'baslamadi')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            currentStatus === 'baslamadi'
                              ? 'bg-slate-800 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Başlamadı
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(topic.id, 'devam_ediyor')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            currentStatus === 'devam_ediyor'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Devam Ediyor
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(topic.id, 'tamamlandi')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            currentStatus === 'tamamlandi'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Tamamlandı
                        </button>
                      </div>
                    </div>

                    {/* Teacher Note Area */}
                    <div className="pt-2 pl-7 flex items-center justify-between gap-3 text-xs">
                      {isEditingThis ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Ders notu veya öğrenci kavrama durumu..."
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => handleSaveNote(topic.id)}
                            className="px-3 py-1.5 bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Kaydet
                          </button>
                          <button
                            onClick={() => setEditingTopicId(null)}
                            className="px-2 py-1.5 text-slate-500 hover:text-slate-800"
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <p className="text-[11px] text-slate-500 italic">
                            {prog?.teacher_notes ? `Not: "${prog.teacher_notes}"` : 'Öğretmen notu eklenmedi.'}
                          </p>
                          <button
                            onClick={() => {
                              setEditingTopicId(topic.id);
                              setNoteText(prog?.teacher_notes || '');
                            }}
                            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Not Ekle/Düzenle
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
