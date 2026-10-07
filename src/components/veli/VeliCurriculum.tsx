import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, Users, ChevronDown } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const VeliCurriculum: React.FC = () => {
  const { students, selectedParentStudentId, curriculums, topicProgress } = useSchool();

  const activeStudent =
    students.find((s) => s.id === selectedParentStudentId) || students[0];

  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>(curriculums[0]?.id || '');

  const activeCurriculum =
    curriculums.find((c) => c.id === selectedCurriculumId) || curriculums[0];

  let totalTopics = 0;
  let completedTopics = 0;
  activeCurriculum.units.forEach((u) => {
    totalTopics += u.topics.length;
    u.topics.forEach((t) => {
      const prog = topicProgress.find((p) => p.topic_id === t.id);
      if (prog?.status === 'tamamlandi') completedTopics += 1;
    });
  });

  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            {activeStudent.first_name} {activeStudent.last_name} ({activeStudent.class_name})
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
            Ders Müfredat İlerleme Raporu
          </h2>
          <p className="text-xs text-slate-500">
            Ders bazında tamamlanan, devam eden ve planlanan tüm akademik konular
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Ders:</label>
          <select
            value={selectedCurriculumId}
            onChange={(e) => setSelectedCurriculumId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium cursor-pointer"
          >
            {curriculums.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{activeCurriculum.name}</h3>
            <p className="text-xs text-slate-500">
              {completedTopics} / {totalTopics} Konu Tamamlandı
            </p>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
            %{percentage}
          </div>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* Units & Topics Accordion */}
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
                const isCompleted = prog?.status === 'tamamlandi';
                const isOngoing = prog?.status === 'devam_ediyor';

                return (
                  <div key={topic.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-mono font-bold text-slate-400 mt-0.5">
                          {uIdx + 1}.{tIdx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{topic.title}</p>
                          {topic.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{topic.description}</p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOngoing
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isCompleted ? 'Tamamlandı' : isOngoing ? 'Devam Ediyor' : 'Başlamadı'}
                      </span>
                    </div>

                    {prog?.teacher_notes && (
                      <div className="pl-6 pt-1 text-[11px] text-emerald-800 italic">
                        Öğretmen Notu: "{prog.teacher_notes}"
                      </div>
                    )}
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
