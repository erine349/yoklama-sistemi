import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, GraduationCap, School, BookOpen, ChevronRight } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Student, Teacher, SchoolClass, Curriculum } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (
    type: 'student' | 'teacher' | 'class' | 'curriculum' | 'school' | 'principal',
    item: any
  ) => void;
}

export const GlobalSearch: React.FC<Props> = ({ isOpen, onClose, onSelectResult }) => {
  const { students, teachers, classes, curriculums, schools, principals } = useSchool();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled by parent or opened
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  const matchingStudents = cleanQuery
    ? students
        .filter((s) => !s.deleted_at)
        .filter(
          (s) =>
            s.first_name.toLowerCase().includes(cleanQuery) ||
            s.last_name.toLowerCase().includes(cleanQuery) ||
            s.student_number.includes(cleanQuery) ||
            s.parent_name.toLowerCase().includes(cleanQuery)
        )
        .slice(0, 4)
    : [];

  const matchingTeachers = cleanQuery
    ? teachers
        .filter(
          (t) =>
            t.full_name.toLowerCase().includes(cleanQuery) ||
            t.branch.toLowerCase().includes(cleanQuery) ||
            t.phone.includes(cleanQuery)
        )
        .slice(0, 3)
    : [];

  const matchingClasses = cleanQuery
    ? classes
        .filter((c) => c.name.toLowerCase().includes(cleanQuery) || c.class_teacher_name?.toLowerCase().includes(cleanQuery))
        .slice(0, 3)
    : [];

  const matchingCurriculums = cleanQuery
    ? curriculums
        .filter((curr) => curr.name.toLowerCase().includes(cleanQuery) || curr.subject_name?.toLowerCase().includes(cleanQuery))
        .slice(0, 3)
    : [];

  const matchingSchools = cleanQuery
    ? schools
        .filter(
          (s) =>
            s.name.toLowerCase().includes(cleanQuery) ||
            s.code.toLowerCase().includes(cleanQuery) ||
            s.city.toLowerCase().includes(cleanQuery) ||
            s.district.toLowerCase().includes(cleanQuery) ||
            (s.principal_name && s.principal_name.toLowerCase().includes(cleanQuery))
        )
        .slice(0, 3)
    : [];

  const matchingPrincipals = cleanQuery
    ? principals
        .filter(
          (p) =>
            p.full_name.toLowerCase().includes(cleanQuery) ||
            p.email.toLowerCase().includes(cleanQuery) ||
            (p.assigned_school_name && p.assigned_school_name.toLowerCase().includes(cleanQuery))
        )
        .slice(0, 3)
    : [];

  const hasResults =
    matchingStudents.length > 0 ||
    matchingTeachers.length > 0 ||
    matchingClasses.length > 0 ||
    matchingCurriculums.length > 0 ||
    matchingSchools.length > 0 ||
    matchingPrincipals.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Öğrenci adı, no, öğretmen, sınıf veya müfredat ara... (örn: Kerem, 8-A, Matematik)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">ESC</span>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="py-8 text-center text-xs text-slate-400">
              Aramak istediğiniz terimi yazın. Hızlı sonuçlar listelenecektir.
            </div>
          )}

          {query && !hasResults && (
            <div className="py-8 text-center text-xs text-slate-500">
              "<span className="font-semibold">{query}</span>" ile eşleşen kayıt bulunamadı.
            </div>
          )}

          {matchingStudents.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Öğrenciler
              </div>
              <div className="space-y-1">
                {matchingStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectResult('student', s);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {s.first_name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {s.first_name} {s.last_name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          No: {s.student_number} · Sınıf: {s.class_name} · Veli: {s.parent_name}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingTeachers.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Öğretmenler
              </div>
              <div className="space-y-1">
                {matchingTeachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectResult('teacher', t);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{t.full_name}</p>
                      <p className="text-[11px] text-slate-400">{t.branch} · {t.phone}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingClasses.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" /> Sınıflar
              </div>
              <div className="space-y-1">
                {matchingClasses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectResult('class', c);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Sınıf {c.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {c.student_count || 0} Öğrenci · Rehber: {c.class_teacher_name || 'Atanmadı'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingCurriculums.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Müfredatlar
              </div>
              <div className="space-y-1">
                {matchingCurriculums.map((curr) => (
                  <button
                    key={curr.id}
                    onClick={() => {
                      onSelectResult('curriculum', curr);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{curr.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {curr.grade_level}. Sınıf · {curr.units.length} Ünite
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingSchools.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" /> Okullar & Kampüsler
              </div>
              <div className="space-y-1">
                {matchingSchools.map((sch) => (
                  <button
                    key={sch.id}
                    onClick={() => {
                      onSelectResult('school', sch);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{sch.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {sch.code} · {sch.city} / {sch.district} · Müdür: {sch.principal_name || 'Atanmadı'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingPrincipals.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Okul Müdürleri
              </div>
              <div className="space-y-1">
                {matchingPrincipals.map((prn) => (
                  <button
                    key={prn.id}
                    onClick={() => {
                      onSelectResult('principal', prn);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{prn.full_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {prn.title} · {prn.assigned_school_name || 'Boşta (Atanmamış)'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
