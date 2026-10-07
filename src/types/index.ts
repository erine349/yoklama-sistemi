export type UserRole = 'bolge_sorumlusu' | 'mudur' | 'ogretmen' | 'veli' | 'ogrenci';

export type EducationType = 'gunduzlu' | 'yatili';
export type StudentStatus = 'aktif' | 'pasif' | 'mezun';
export type AttendanceStatus = 'geldi' | 'gelmedi' | 'gec' | 'izinli';
export type TopicStatus = 'baslamadi' | 'devam_ediyor' | 'tamamlandi';
export type LessonStatus = 'planlandi' | 'tamamlandi' | 'iptal';

export interface School {
  id: string;
  name: string; // örn: 'Özel Akademi Koleji - Beşiktaş Kampüsü'
  code: string; // 'AKD-BES-01'
  city: string; // 'İstanbul'
  district: string; // 'Beşiktaş'
  address: string;
  phone: string;
  email: string;
  principal_id?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  class_count?: number;
  capacity: number;
  status: 'aktif' | 'pasif';
  created_at: string;
}

export interface Principal {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  phone: string;
  title: string;
  assigned_school_id?: string;
  assigned_school_name?: string;
  hire_date: string;
  status: 'aktif' | 'pasif';
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026-2027"
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "8-A"
  grade_level: number; // 8
  section: string; // "A"
  academic_year_id: string;
  class_teacher_id?: string;
  class_teacher_name?: string;
  capacity: number;
  student_count?: number;
  attendance_rate?: number;
  is_active: boolean;
}

export interface Teacher {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  phone: string;
  branch: string;
  status: 'aktif' | 'pasif';
  hire_date: string;
  assigned_class_ids: string[];
}

export interface Parent {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string;
  email: string;
  occupation?: string;
  student_ids: string[];
}

export interface Student {
  id: string;
  profile_id?: string;
  student_number: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: 'Erkek' | 'Kız';
  education_type: EducationType;
  class_id: string;
  class_name?: string;
  status: StudentStatus;
  registration_date: string;
  deleted_at?: string | null;
  // Parent details
  parent_id?: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  parent_relation: string; // 'Anne' | 'Baba' | 'Vasi'
  // Computed academic metrics
  attendance_rate?: number; // e.g. 94.5%
  curriculum_rate?: number; // e.g. 78%
  absenteeism_count?: number; // Gün
  late_count?: number;
  excused_count?: number;
  risk_level?: 'Dusuk' | 'Orta' | 'Yuksek';
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  grade_level: number;
  color: string;
  weekly_hours: number;
}

export interface CurriculumTopic {
  id: string;
  unit_id: string;
  title: string;
  description?: string;
  order_index: number;
  estimated_hours: number;
}

export interface CurriculumUnit {
  id: string;
  curriculum_id: string;
  title: string;
  order_index: number;
  topics: CurriculumTopic[];
}

export interface Curriculum {
  id: string;
  name: string;
  subject_id: string;
  subject_name?: string;
  grade_level: number;
  academic_year_id: string;
  version: string;
  is_archived: boolean;
  units: CurriculumUnit[];
}

export interface ClassCurriculum {
  id: string;
  class_id: string;
  curriculum_id: string;
  teacher_id: string;
  academic_year_id: string;
}

export interface TopicProgress {
  id: string;
  class_curriculum_id: string;
  topic_id: string;
  status: TopicStatus;
  started_at?: string;
  completed_at?: string;
  teacher_notes?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  topic_id?: string;
  topic_name?: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  status: LessonStatus;
  is_attendance_locked: boolean;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  lesson_id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  role_target?: UserRole | 'all';
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  target_entity: string;
  details: string;
  created_at: string;
}
