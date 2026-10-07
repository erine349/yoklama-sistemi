import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AcademicYear,
  ActivityLog,
  AttendanceRecord,
  AttendanceStatus,
  Curriculum,
  CurriculumTopic,
  CurriculumUnit,
  Lesson,
  NotificationItem,
  Parent,
  Principal,
  School,
  SchoolClass,
  Student,
  Subject,
  Teacher,
  TopicProgress,
  TopicStatus,
} from '../types';
import {
  initialAcademicYears,
  initialActivityLogs,
  initialAttendance,
  initialClasses,
  initialCurriculums,
  initialLessons,
  initialNotifications,
  initialParents,
  initialPrincipals,
  initialSchools,
  initialStudents,
  initialSubjects,
  initialTeachers,
  initialTopicProgress,
} from '../lib/seedData';
import { useAuth } from './AuthContext';

interface SchoolContextType {
  // Regional & Multi-School Entities
  schools: School[];
  principals: Principal[];
  addSchool: (school: Omit<School, 'id' | 'created_at'>) => School;
  updateSchool: (id: string, updates: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  addPrincipal: (principal: Omit<Principal, 'id'>) => Principal;
  updatePrincipal: (id: string, updates: Partial<Principal>) => void;
  assignPrincipalToSchool: (principalId: string, schoolId: string) => void;

  // Core Entities
  academicYears: AcademicYear[];
  activeAcademicYear: AcademicYear;
  classes: SchoolClass[];
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  subjects: Subject[];
  curriculums: Curriculum[];
  topicProgress: TopicProgress[];
  lessons: Lesson[];
  attendance: AttendanceRecord[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];

  // Multi-child selection for Parents
  selectedParentStudentId: string;
  setSelectedParentStudentId: (id: string) => void;

  // Student CRUD
  addStudent: (student: Omit<Student, 'id' | 'registration_date'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void; // Soft delete

  // Teacher CRUD
  addTeacher: (teacher: Omit<Teacher, 'id' | 'hire_date'>) => Teacher;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;

  // Class CRUD
  addClass: (cls: Omit<SchoolClass, 'id'>) => SchoolClass;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;

  // Curriculum Management
  addCurriculum: (curriculum: Omit<Curriculum, 'id' | 'is_archived'>) => Curriculum;
  assignCurriculumToClass: (classId: string, curriculumId: string, teacherId: string) => void;
  updateTopicProgress: (
    topicId: string,
    classCurriculumId: string,
    status: TopicStatus,
    notes?: string
  ) => void;

  // Lessons & Attendance
  startLesson: (lesson: Omit<Lesson, 'id' | 'is_attendance_locked' | 'status'>) => Lesson;
  saveAttendance: (lessonId: string, records: { student_id: string; status: AttendanceStatus; note?: string }[], lockLesson?: boolean) => void;
  markAllPresent: (lessonId: string) => void;

  // Notifications & Audit
  markNotificationAsRead: (id: string) => void;
  addActivityLog: (action: string, target_entity: string, details: string) => void;

  // Export
  exportToCsv: (type: 'students' | 'attendance' | 'curriculum') => void;

  // Reset to initial seed
  resetToSeedData: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, registerProfile } = useAuth();

  // Load from localStorage or defaults
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`akademipro_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [academicYears] = useState<AcademicYear[]>(() => loadStored('years', initialAcademicYears));
  const [schools, setSchools] = useState<School[]>(() => loadStored('schools', initialSchools));
  const [principals, setPrincipals] = useState<Principal[]>(() => loadStored('principals', initialPrincipals));
  const [classes, setClasses] = useState<SchoolClass[]>(() => loadStored('classes', initialClasses));
  const [students, setStudents] = useState<Student[]>(() => loadStored('students', initialStudents));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadStored('teachers', initialTeachers));
  const [parents, setParents] = useState<Parent[]>(() => loadStored('parents', initialParents));
  const [subjects] = useState<Subject[]>(() => loadStored('subjects', initialSubjects));
  const [curriculums, setCurriculums] = useState<Curriculum[]>(() => loadStored('curriculums', initialCurriculums));
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>(() => loadStored('topic_prog', initialTopicProgress));
  const [lessons, setLessons] = useState<Lesson[]>(() => loadStored('lessons', initialLessons));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadStored('attendance', initialAttendance));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStored('notifs', initialNotifications));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadStored('logs', initialActivityLogs));

  // Active parent's selected student (Defaults to Kerem Çelik stu-801)
  const [selectedParentStudentId, setSelectedParentStudentId] = useState<string>('stu-801');

  // Persistence effects
  useEffect(() => { localStorage.setItem('akademipro_schools', JSON.stringify(schools)); }, [schools]);
  useEffect(() => { localStorage.setItem('akademipro_principals', JSON.stringify(principals)); }, [principals]);
  useEffect(() => { localStorage.setItem('akademipro_classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('akademipro_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('akademipro_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('akademipro_parents', JSON.stringify(parents)); }, [parents]);
  useEffect(() => { localStorage.setItem('akademipro_curriculums', JSON.stringify(curriculums)); }, [curriculums]);
  useEffect(() => { localStorage.setItem('akademipro_topic_prog', JSON.stringify(topicProgress)); }, [topicProgress]);
  useEffect(() => { localStorage.setItem('akademipro_lessons', JSON.stringify(lessons)); }, [lessons]);
  useEffect(() => { localStorage.setItem('akademipro_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('akademipro_notifs', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('akademipro_logs', JSON.stringify(activityLogs)); }, [activityLogs]);

  const activeAcademicYear = academicYears.find((y) => y.is_active) || academicYears[0];

  // Audit Logger
  const addActivityLog = (action: string, target_entity: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      action,
      target_entity,
      details,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Student CRUD
  const addStudent = (newStudentData: Omit<Student, 'id' | 'registration_date'>): Student => {
    const targetClass = classes.find((c) => c.id === newStudentData.class_id);
    const newStudent: Student = {
      ...newStudentData,
      id: `stu-${Date.now()}`,
      class_name: targetClass?.name || 'Belirtilmedi',
      registration_date: new Date().toISOString().split('T')[0],
      attendance_rate: 100,
      curriculum_rate: 0,
      absenteeism_count: 0,
      late_count: 0,
      excused_count: 0,
      risk_level: 'Dusuk',
      status: 'aktif',
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Update class student count
    if (newStudentData.class_id) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === newStudentData.class_id ? { ...c, student_count: (c.student_count || 0) + 1 } : c
        )
      );
    }

    addActivityLog(
      'OGRENCI_KAYDI',
      `Öğrenci: ${newStudent.first_name} ${newStudent.last_name} (${newStudent.student_number})`,
      `${newStudent.class_name} sınıfına kayıt yapıldı.`
    );

    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          if (updates.class_id && updates.class_id !== s.class_id) {
            const cls = classes.find((c) => c.id === updates.class_id);
            updated.class_name = cls?.name || s.class_name;
          }
          return updated;
        }
        return s;
      })
    );
    addActivityLog('OGRENCI_GUNCELLENDI', `Öğrenci ID: ${id}`, 'Öğrenci bilgileri güncellendi.');
  };

  const deleteStudent = (id: string) => {
    // Soft Delete
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, deleted_at: new Date().toISOString(), status: 'pasif' } : s))
    );
    const target = students.find((s) => s.id === id);
    addActivityLog(
      'OGRENCI_ARSIVLENDI',
      `Öğrenci: ${target ? `${target.first_name} ${target.last_name}` : id}`,
      'Öğrenci kaydı arşive kaldırıldı (Soft delete).'
    );
  };

  // Teacher CRUD
  const addTeacher = (data: Omit<Teacher, 'id' | 'hire_date'>): Teacher => {
    const newTeacher: Teacher = {
      ...data,
      id: `teach-${Date.now()}`,
      hire_date: new Date().toISOString().split('T')[0],
      status: 'aktif',
    };
    setTeachers((prev) => [...prev, newTeacher]);
    addActivityLog('OGRETMEN_EKLENDI', `Öğretmen: ${newTeacher.full_name}`, `${newTeacher.branch} branşı.`);
    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    addActivityLog('OGRETMEN_GUNCELLENDI', `Öğretmen ID: ${id}`, 'Öğretmen bilgileri güncellendi.');
  };

  // School & Principal Management (Bölge Sorumlusu Yetkileri)
  const addSchool = (schoolData: Omit<School, 'id' | 'created_at'>): School => {
    const newSchool: School = {
      ...schoolData,
      id: `sch-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      student_count: schoolData.student_count || 0,
      teacher_count: schoolData.teacher_count || 0,
      class_count: schoolData.class_count || 0,
      status: 'aktif',
    };
    setSchools((prev) => [newSchool, ...prev]);
    addActivityLog(
      'YENI_OKUL_ACILDI',
      `Okul: ${newSchool.name} (${newSchool.code})`,
      `${newSchool.city} / ${newSchool.district} - Kapasite: ${newSchool.capacity}`
    );
    return newSchool;
  };

  const updateSchool = (id: string, updates: Partial<School>) => {
    setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addActivityLog('OKUL_GUNCELLENDI', `Okul ID: ${id}`, 'Okul bilgileri güncellendi.');
  };

  const deleteSchool = (id: string) => {
    const target = schools.find((s) => s.id === id);
    setSchools((prev) => prev.filter((s) => s.id !== id));
    // Also remove assigned school from principals
    setPrincipals((prev) =>
      prev.map((p) =>
        p.assigned_school_id === id
          ? { ...p, assigned_school_id: undefined, assigned_school_name: undefined }
          : p
      )
    );
    addActivityLog(
      'OKUL_SILINDI',
      `Okul: ${target ? target.name : id}`,
      'Bölge sorumlusu tarafından okul kaydı sistemden silindi.'
    );
  };

  const addPrincipal = (principalData: Omit<Principal, 'id'>): Principal => {
    const newPrincipal: Principal = {
      ...principalData,
      id: `prn-${Date.now()}`,
      status: 'aktif',
    };
    setPrincipals((prev) => [newPrincipal, ...prev]);

    // Also register a profile so the newly added principal can immediately log into the system
    registerProfile({
      id: newPrincipal.profile_id,
      role: 'mudur',
      full_name: newPrincipal.full_name,
      email: newPrincipal.email,
      phone: newPrincipal.phone,
      created_at: new Date().toISOString().split('T')[0],
    });

    // If an assigned school was selected, link it
    if (principalData.assigned_school_id) {
      setSchools((prev) =>
        prev.map((s) =>
          s.id === principalData.assigned_school_id
            ? { ...s, principal_id: newPrincipal.profile_id, principal_name: newPrincipal.full_name }
            : s
        )
      );
    }

    addActivityLog(
      'MUDUR_EKLENDI',
      `Müdür: ${newPrincipal.full_name}`,
      `Atandığı Okul: ${newPrincipal.assigned_school_name || 'Henüz Atanmadı'}`
    );
    return newPrincipal;
  };

  const updatePrincipal = (id: string, updates: Partial<Principal>) => {
    setPrincipals((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addActivityLog('MUDUR_GUNCELLENDI', `Müdür ID: ${id}`, 'Müdür bilgileri güncellendi.');
  };

  const assignPrincipalToSchool = (principalId: string, schoolId: string) => {
    const targetPrincipal = principals.find((p) => p.id === principalId);
    const targetSchool = schools.find((s) => s.id === schoolId);

    if (targetPrincipal && targetSchool) {
      // Update principal
      setPrincipals((prev) =>
        prev.map((p) =>
          p.id === principalId
            ? {
                ...p,
                assigned_school_id: schoolId,
                assigned_school_name: targetSchool.name,
              }
            : p
        )
      );

      // Update school
      setSchools((prev) =>
        prev.map((s) =>
          s.id === schoolId
            ? {
                ...s,
                principal_id: targetPrincipal.profile_id,
                principal_name: targetPrincipal.full_name,
              }
            : s
        )
      );

      addActivityLog(
        'MUDUR_OKULA_ATANDI',
        `Müdür: ${targetPrincipal.full_name} → ${targetSchool.name}`,
        'Bölge sorumlusu tarafından okul müdürü ataması onaylandı.'
      );
    }
  };

  // Class CRUD
  const addClass = (clsData: Omit<SchoolClass, 'id'>): SchoolClass => {
    const newClass: SchoolClass = {
      ...clsData,
      id: `cls-${Date.now()}`,
      student_count: 0,
      attendance_rate: 100,
      is_active: true,
    };
    setClasses((prev) => [...prev, newClass]);
    addActivityLog('SINIF_OLUSTURULDU', `Sınıf: ${newClass.name}`, `${newClass.grade_level}. sınıf.`);
    return newClass;
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Curriculum Management
  const addCurriculum = (currData: Omit<Curriculum, 'id' | 'is_archived'>): Curriculum => {
    const newCurriculum: Curriculum = {
      ...currData,
      id: `curr-${Date.now()}`,
      is_archived: false,
    };
    setCurriculums((prev) => [...prev, newCurriculum]);
    addActivityLog('MUFREDAT_OLUSTURULDU', `Müfredat: ${newCurriculum.name}`, `${newCurriculum.units.length} ünite.`);
    return newCurriculum;
  };

  const assignCurriculumToClass = (classId: string, curriculumId: string, teacherId: string) => {
    const targetClass = classes.find((c) => c.id === classId);
    const targetCurriculum = curriculums.find((c) => c.id === curriculumId);
    const targetTeacher = teachers.find((t) => t.id === teacherId);

    // Initial progress entries for all topics in this curriculum
    if (targetCurriculum) {
      const classCurrId = `cc-${classId}-${curriculumId}`;
      const newProgress: TopicProgress[] = [];
      targetCurriculum.units.forEach((unit) => {
        unit.topics.forEach((topic) => {
          newProgress.push({
            id: `prog-${Date.now()}-${topic.id}`,
            class_curriculum_id: classCurrId,
            topic_id: topic.id,
            status: 'baslamadi',
          });
        });
      });

      setTopicProgress((prev) => {
        const filtered = prev.filter((p) => p.class_curriculum_id !== classCurrId);
        return [...filtered, ...newProgress];
      });
    }

    addActivityLog(
      'MUFREDAT_ATANDI',
      `Sınıf: ${targetClass?.name} - Müfredat: ${targetCurriculum?.name}`,
      `Öğretmen: ${targetTeacher?.full_name}`
    );
  };

  const updateTopicProgress = (
    topicId: string,
    classCurriculumId: string,
    status: TopicStatus,
    notes?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setTopicProgress((prev) => {
      const index = prev.findIndex((p) => p.topic_id === topicId);
      if (index >= 0) {
        const current = prev[index];
        const updated: TopicProgress = {
          ...current,
          status,
          teacher_notes: notes !== undefined ? notes : current.teacher_notes,
          started_at: current.started_at || today,
          completed_at: status === 'tamamlandi' ? today : undefined,
          updated_by: currentUser.id,
          updated_at: today,
        };
        const next = [...prev];
        next[index] = updated;
        return next;
      } else {
        return [
          ...prev,
          {
            id: `prog-${Date.now()}`,
            class_curriculum_id: classCurriculumId,
            topic_id: topicId,
            status,
            started_at: today,
            completed_at: status === 'tamamlandi' ? today : undefined,
            teacher_notes: notes,
            updated_by: currentUser.id,
            updated_at: today,
          },
        ];
      }
    });

    addActivityLog(
      'MUFREDAT_ILERLEME',
      `Konu ID: ${topicId}`,
      `Durum: ${status === 'tamamlandi' ? 'Tamamlandı' : status === 'devam_ediyor' ? 'Devam Ediyor' : 'Başlamadı'}`
    );
  };

  // Lessons and Attendance
  const startLesson = (lessonData: Omit<Lesson, 'id' | 'is_attendance_locked' | 'status'>): Lesson => {
    const newLesson: Lesson = {
      ...lessonData,
      id: `les-${Date.now()}`,
      status: 'planlandi',
      is_attendance_locked: false,
    };
    setLessons((prev) => [newLesson, ...prev]);

    // Pre-populate attendance records as 'geldi' for students of this class
    const classStudents = students.filter((s) => s.class_id === lessonData.class_id && !s.deleted_at);
    const newAttendance: AttendanceRecord[] = classStudents.map((s) => ({
      id: `att-${Date.now()}-${s.id}`,
      lesson_id: newLesson.id,
      student_id: s.id,
      student_name: `${s.first_name} ${s.last_name}`,
      student_number: s.student_number,
      date: lessonData.lesson_date,
      status: 'geldi',
    }));

    setAttendance((prev) => [...prev, ...newAttendance]);

    addActivityLog(
      'DERS_BASLATILDI',
      `${lessonData.class_name} - ${lessonData.subject_name}`,
      `Konu: ${lessonData.topic_name || 'Genel Konu'}`
    );

    return newLesson;
  };

  const saveAttendance = (
    lessonId: string,
    records: { student_id: string; status: AttendanceStatus; note?: string }[],
    lockLesson: boolean = false
  ) => {
    const targetLesson = lessons.find((l) => l.id === lessonId);
    const dateStr = targetLesson?.lesson_date || new Date().toISOString().split('T')[0];

    setAttendance((prev) => {
      const otherRecords = prev.filter((r) => r.lesson_id !== lessonId);
      const updatedRecords: AttendanceRecord[] = records.map((rec) => {
        const student = students.find((s) => s.id === rec.student_id);
        return {
          id: `att-${lessonId}-${rec.student_id}`,
          lesson_id: lessonId,
          student_id: rec.student_id,
          student_name: student ? `${student.first_name} ${student.last_name}` : 'Öğrenci',
          student_number: student?.student_number || '',
          date: dateStr,
          status: rec.status,
          note: rec.note,
        };
      });
      return [...otherRecords, ...updatedRecords];
    });

    if (lockLesson) {
      setLessons((prev) =>
        prev.map((l) => (l.id === lessonId ? { ...l, is_attendance_locked: true, status: 'tamamlandi' } : l))
      );
    }

    // Recompute attendance stats for students
    setStudents((prev) =>
      prev.map((s) => {
        const rec = records.find((r) => r.student_id === s.id);
        if (!rec) return s;
        let newAbsent = s.absenteeism_count || 0;
        let newLate = s.late_count || 0;
        let newExcused = s.excused_count || 0;
        if (rec.status === 'gelmedi') newAbsent += 1;
        if (rec.status === 'gec') newLate += 1;
        if (rec.status === 'izinli') newExcused += 1;

        const totalDays = 20; // benchmark
        const attendanceRate = Math.max(0, Math.min(100, Math.round(((totalDays - newAbsent) / totalDays) * 100)));
        const riskLevel = attendanceRate < 88 ? 'Yuksek' : attendanceRate < 93 ? 'Orta' : 'Dusuk';

        return {
          ...s,
          absenteeism_count: newAbsent,
          late_count: newLate,
          excused_count: newExcused,
          attendance_rate: attendanceRate,
          risk_level: riskLevel,
        };
      })
    );

    addActivityLog(
      lockLesson ? 'YOKLAMA_KILITLENDI' : 'YOKLAMA_KAYDEDILDI',
      `Ders: ${targetLesson?.class_name || ''} ${targetLesson?.subject_name || ''}`,
      `${records.length} öğrenci kaydedildi. Kilit: ${lockLesson ? 'Evet' : 'Hayır'}`
    );
  };

  const markAllPresent = (lessonId: string) => {
    setAttendance((prev) =>
      prev.map((rec) => (rec.lesson_id === lessonId ? { ...rec, status: 'geldi' } : rec))
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  // CSV Export Utility
  const exportToCsv = (type: 'students' | 'attendance' | 'curriculum') => {
    let filename = '';
    let csvContent = '\uFEFF'; // BOM for Turkish character support in Excel

    if (type === 'students') {
      filename = `AkademiPro_Ogrenciler_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += 'Öğrenci No;Ad;Soyad;Sınıf;Cinsiyet;Eğitim Tipi;Devam Oranı;Veli Adı;Veli Tel;Risk Durumu\n';
      students.filter((s) => !s.deleted_at).forEach((s) => {
        csvContent += `${s.student_number};${s.first_name};${s.last_name};${s.class_name};${s.gender};${s.education_type};%${s.attendance_rate};${s.parent_name};${s.parent_phone};${s.risk_level}\n`;
      });
    } else if (type === 'attendance') {
      filename = `AkademiPro_Yoklama_Raporu_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += 'Tarih;Öğrenci No;Öğrenci Adı;Durum;Not\n';
      attendance.forEach((a) => {
        csvContent += `${a.date};${a.student_number};${a.student_name};${a.status.toUpperCase()};${a.note || ''}\n`;
      });
    } else if (type === 'curriculum') {
      filename = `AkademiPro_Mufredat_Raporu_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += 'Müfredat;Ünite;Konu;Tahmini Saat;Durum;Öğretmen Notu\n';
      curriculums.forEach((c) => {
        c.units.forEach((u) => {
          u.topics.forEach((t) => {
            const prog = topicProgress.find((p) => p.topic_id === t.id);
            const statusLabel =
              prog?.status === 'tamamlandi'
                ? 'Tamamlandı'
                : prog?.status === 'devam_ediyor'
                ? 'Devam Ediyor'
                : 'Başlamadı';
            csvContent += `${c.name};${u.title};${t.title};${t.estimated_hours};${statusLabel};${prog?.teacher_notes || ''}\n`;
          });
        });
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetToSeedData = () => {
    localStorage.clear();
    setSchools(initialSchools);
    setPrincipals(initialPrincipals);
    setClasses(initialClasses);
    setStudents(initialStudents);
    setTeachers(initialTeachers);
    setParents(initialParents);
    setCurriculums(initialCurriculums);
    setTopicProgress(initialTopicProgress);
    setLessons(initialLessons);
    setAttendance(initialAttendance);
    setNotifications(initialNotifications);
    setActivityLogs(initialActivityLogs);
    window.location.reload();
  };

  return (
    <SchoolContext.Provider
      value={{
        schools,
        principals,
        addSchool,
        updateSchool,
        deleteSchool,
        addPrincipal,
        updatePrincipal,
        assignPrincipalToSchool,
        academicYears,
        activeAcademicYear,
        classes,
        students,
        teachers,
        parents,
        subjects,
        curriculums,
        topicProgress,
        lessons,
        attendance,
        notifications,
        activityLogs,
        selectedParentStudentId,
        setSelectedParentStudentId,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        addClass,
        updateClass,
        addCurriculum,
        assignCurriculumToClass,
        updateTopicProgress,
        startLesson,
        saveAttendance,
        markAllPresent,
        markNotificationAsRead,
        addActivityLog,
        exportToCsv,
        resetToSeedData,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
