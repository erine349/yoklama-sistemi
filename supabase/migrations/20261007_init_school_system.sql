-- ============================================================================
-- AKADEMİPRO - ÖZEL OKUL YÖNETİM SİSTEMİ
-- Production PostgreSQL Database Migration Schema (Supabase)
-- Versiyon: 1.0.0 (2026-10-07)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('mudur', 'ogretmen', 'veli', 'ogrenci');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE education_type AS ENUM ('gunduzlu', 'yatili');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE student_status AS ENUM ('aktif', 'pasif', 'mezun');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('geldi', 'gelmedi', 'gec', 'izinli');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE topic_progress_status AS ENUM ('baslamadi', 'devam_ediyor', 'tamamlandi');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lesson_status AS ENUM ('planlandi', 'tamamlandi', 'iptal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Supabase auth.users eşleşmesi)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'ogrenci',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ACADEMIC YEARS TABLE
CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- örn: '2026-2027'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CLASSES TABLE (Sınıflar)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- örn: '8-A', '5-B'
  grade_level INT NOT NULL, -- 5, 6, 7, 8 vb.
  section TEXT NOT NULL, -- 'A', 'B'
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE RESTRICT,
  class_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  capacity INT NOT NULL DEFAULT 24,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TEACHERS TABLE (Öğretmen Detayları)
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  branch TEXT NOT NULL, -- örn: 'Matematik', 'Fen Bilimleri'
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'aktif',
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. STUDENTS TABLE (Öğrenciler)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('Erkek', 'Kız')),
  education_type education_type NOT NULL DEFAULT 'gunduzlu',
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  status student_status NOT NULL DEFAULT 'aktif',
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deleted_at TIMESTAMPTZ, -- Soft delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PARENTS TABLE (Veliler)
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  occupation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. STUDENT_PARENTS (Çoklu Çocuk & Veli İlişkisi)
CREATE TABLE IF NOT EXISTS public.student_parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'Anne', -- 'Anne', 'Baba', 'Vasi'
  is_primary_contact BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

-- 10. SUBJECTS TABLE (Dersler)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'Matematik', 'Türkçe', 'Fen Bilimleri'
  code TEXT NOT NULL UNIQUE, -- 'MAT8', 'FEN8'
  grade_level INT NOT NULL,
  color TEXT DEFAULT '#10b981',
  weekly_hours INT NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CURRICULUMS (Müfredat Üst Başlığı)
CREATE TABLE IF NOT EXISTS public.curriculums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- örn: '2026-2027 8. Sınıf Matematik Müfredatı'
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  grade_level INT NOT NULL,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
  version TEXT NOT NULL DEFAULT 'v1.0',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CURRICULUM UNITS (Üniteler)
CREATE TABLE IF NOT EXISTS public.curriculum_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_id UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- örn: '1. Ünite: Çarpanlar ve Katlar'
  order_index INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. CURRICULUM TOPICS (Konular ve Alt Konular)
CREATE TABLE IF NOT EXISTS public.curriculum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES public.curriculum_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- örn: 'EBOB ve EKOK Hesaplama'
  description TEXT,
  order_index INT NOT NULL DEFAULT 1,
  estimated_hours INT NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. CLASS_CURRICULUMS (Müfredat Sınıf Eşleştirmesi)
CREATE TABLE IF NOT EXISTS public.class_curriculums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  curriculum_id UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, curriculum_id)
);

-- 15. CLASS_CURRICULUM_PROGRESS (Sınıf Müfredat İlerleme Takibi)
CREATE TABLE IF NOT EXISTS public.class_curriculum_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_curriculum_id UUID NOT NULL REFERENCES public.class_curriculums(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
  status topic_progress_status NOT NULL DEFAULT 'baslamadi',
  started_at DATE,
  completed_at DATE,
  teacher_notes TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_curriculum_id, topic_id)
);

-- 16. LESSONS (Ders Oturumları)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
  topic_id UUID REFERENCES public.curriculum_topics(id) ON DELETE SET NULL,
  lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status lesson_status NOT NULL DEFAULT 'planlandi',
  is_attendance_locked BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. ATTENDANCE (Yoklama Kayıtları)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'geldi',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lesson_id, student_id)
);

-- 18. NOTIFICATIONS (Bildirimler)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'urgent'
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. ACTIVITY_LOGS (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL, -- 'OGRENCI_OLUSTURULDU', 'YOKLAMA_ALINDI', vb.
  target_entity TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_student_number ON public.students(student_number);
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON public.students(deleted_at);
CREATE INDEX IF NOT EXISTS idx_student_parents_student ON public.student_parents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_parent ON public.student_parents(parent_id);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON public.classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_curriculums_subject ON public.curriculums(subject_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_topics_unit ON public.curriculum_topics(unit_id);
CREATE INDEX IF NOT EXISTS idx_lessons_class_date ON public.lessons(class_id, lesson_date);
CREATE INDEX IF NOT EXISTS idx_attendance_lesson_student ON public.attendance(lesson_id, student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ============================================================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_curriculum_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Get current authenticated user role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles:
CREATE POLICY "Mudur can do all on profiles" ON public.profiles
  FOR ALL USING (auth_user_role() = 'mudur');
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- 2. Students:
CREATE POLICY "Mudur has full access to students" ON public.students
  FOR ALL USING (auth_user_role() = 'mudur');
CREATE POLICY "Teachers can view students in their assigned classes" ON public.students
  FOR SELECT USING (
    auth_user_role() = 'ogretmen' AND
    class_id IN (
      SELECT c.id FROM public.classes c
      JOIN public.teachers t ON t.profile_id = auth.uid()
      WHERE c.class_teacher_id = auth.uid() OR c.id IN (SELECT class_id FROM public.class_curriculums WHERE teacher_id = t.id)
    )
  );
CREATE POLICY "Parents can view linked students" ON public.students
  FOR SELECT USING (
    auth_user_role() = 'veli' AND
    id IN (
      SELECT sp.student_id FROM public.student_parents sp
      JOIN public.parents p ON p.id = sp.parent_id
      WHERE p.profile_id = auth.uid()
    )
  );
CREATE POLICY "Student can view self" ON public.students
  FOR SELECT USING (
    profile_id = auth.uid()
  );

-- 3. Attendance:
CREATE POLICY "Mudur full access to attendance" ON public.attendance
  FOR ALL USING (auth_user_role() = 'mudur');
CREATE POLICY "Teachers can view and insert attendance for their lessons" ON public.attendance
  FOR ALL USING (
    auth_user_role() = 'ogretmen' AND
    lesson_id IN (
      SELECT l.id FROM public.lessons l
      JOIN public.teachers t ON t.id = l.teacher_id
      WHERE t.profile_id = auth.uid()
    )
  );
CREATE POLICY "Parents can view attendance of their children" ON public.attendance
  FOR SELECT USING (
    auth_user_role() = 'veli' AND
    student_id IN (
      SELECT sp.student_id FROM public.student_parents sp
      JOIN public.parents p ON p.id = sp.parent_id
      WHERE p.profile_id = auth.uid()
    )
  );
CREATE POLICY "Student can view own attendance" ON public.attendance
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
  );

-- 4. Lessons:
CREATE POLICY "Mudur full access to lessons" ON public.lessons
  FOR ALL USING (auth_user_role() = 'mudur');
CREATE POLICY "Teachers can manage their own lessons" ON public.lessons
  FOR ALL USING (
    auth_user_role() = 'ogretmen' AND
    teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
  );
CREATE POLICY "Parents and students can view lessons of their class" ON public.lessons
  FOR SELECT USING (true);

-- 5. Curriculums & Topics:
CREATE POLICY "Everyone can read curriculums" ON public.curriculums FOR SELECT USING (true);
CREATE POLICY "Mudur manage curriculums" ON public.curriculums FOR ALL USING (auth_user_role() = 'mudur');

CREATE POLICY "Everyone can read units and topics" ON public.curriculum_units FOR SELECT USING (true);
CREATE POLICY "Mudur manage units" ON public.curriculum_units FOR ALL USING (auth_user_role() = 'mudur');

CREATE POLICY "Everyone can read topics" ON public.curriculum_topics FOR SELECT USING (true);
CREATE POLICY "Mudur manage topics" ON public.curriculum_topics FOR ALL USING (auth_user_role() = 'mudur');

-- 6. Class Curriculum Progress:
CREATE POLICY "Everyone can read curriculum progress" ON public.class_curriculum_progress FOR SELECT USING (true);
CREATE POLICY "Teachers can update curriculum progress for assigned classes" ON public.class_curriculum_progress
  FOR ALL USING (
    auth_user_role() = 'ogretmen' OR auth_user_role() = 'mudur'
  );

-- 7. Notifications:
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- 8. Activity Logs:
CREATE POLICY "Mudur can read activity logs" ON public.activity_logs
  FOR SELECT USING (auth_user_role() = 'mudur');
CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);
