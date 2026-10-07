-- ============================================================================
-- AKADEMİPRO - ÖZEL OKUL YÖNETİM SİSTEMİ
-- Seed Data Script (1 Müdür, 3 Öğretmen, 2 Sınıf, 20 Öğrenci, 3 Veli, Müfredatlar)
-- ============================================================================

-- 1. ACADEMIC YEAR
INSERT INTO public.academic_years (id, name, start_date, end_date, is_active, is_archived)
VALUES ('a0000000-0000-0000-0000-000000000001', '2026-2027', '2026-09-07', '2027-06-18', true, false)
ON CONFLICT (id) DO NOTHING;

-- 2. SUBJECTS
INSERT INTO public.subjects (id, name, code, grade_level, color, weekly_hours)
VALUES 
  ('s0000000-0000-0000-0000-000000000001', 'Matematik', 'MAT8', 8, '#059669', 5),
  ('s0000000-0000-0000-0000-000000000002', 'Fen Bilimleri', 'FEN8', 8, '#0d9488', 4),
  ('s0000000-0000-0000-0000-000000000003', 'Türkçe', 'TUR8', 8, '#16a34a', 5)
ON CONFLICT (id) DO NOTHING;

-- 3. PROFILES
-- Müdür
INSERT INTO public.profiles (id, role, full_name, email, phone)
VALUES ('u0000000-0000-0000-0000-000000000001', 'mudur', 'Ahmet Kaya (Müdür)', 'ahmet.mudur@akademipro.k12.tr', '0532 100 0001')
ON CONFLICT (id) DO NOTHING;

-- Öğretmen 1: Matematik
INSERT INTO public.profiles (id, role, full_name, email, phone)
VALUES ('u0000000-0000-0000-0000-000000000002', 'ogretmen', 'Ayşe Yılmaz (Matematik)', 'ayse.yilmaz@akademipro.k12.tr', '0532 200 0002')
ON CONFLICT (id) DO NOTHING;

-- Öğretmen 2: Fen
INSERT INTO public.profiles (id, role, full_name, email, phone)
VALUES ('u0000000-0000-0000-0000-000000000003', 'ogretmen', 'Mehmet Demir (Fen Bilimleri)', 'mehmet.demir@akademipro.k12.tr', '0532 200 0003')
ON CONFLICT (id) DO NOTHING;

-- Öğretmen 3: Türkçe
INSERT INTO public.profiles (id, role, full_name, email, phone)
VALUES ('u0000000-0000-0000-0000-000000000004', 'ogretmen', 'Zeynep Aksoy (Türkçe)', 'zeynep.aksoy@akademipro.k12.tr', '0532 200 0004')
ON CONFLICT (id) DO NOTHING;

-- Veli 1: İki çocuklu veli (Ahmet ve Elif'in babası)
INSERT INTO public.profiles (id, role, full_name, email, phone)
VALUES ('u0000000-0000-0000-0000-000000000005', 'veli', 'Mustafa Çelik (Veli)', 'mustafa.celik@gmail.com', '0533 300 0005')
ON CONFLICT (id) DO NOTHING;

-- Öğrenci 1
INSERT INTO public.profiles (id, role, full_name, email, phone)
VALUES ('u0000000-0000-0000-0000-000000000006', 'ogrenci', 'Kerem Çelik', 'kerem.celik@ogrenci.akademipro.k12.tr', '0534 400 0006')
ON CONFLICT (id) DO NOTHING;

-- 4. CLASSES
INSERT INTO public.classes (id, name, grade_level, section, academic_year_id, class_teacher_id, capacity)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', '8-A', 8, 'A', 'a0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 20),
  ('c0000000-0000-0000-0000-000000000002', '8-B', 8, 'B', 'a0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000003', 20)
ON CONFLICT (id) DO NOTHING;

-- 5. TEACHERS
INSERT INTO public.teachers (id, profile_id, branch, phone, hire_date)
VALUES 
  ('t0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'Matematik', '0532 200 0002', '2023-09-01'),
  ('t0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000003', 'Fen Bilimleri', '0532 200 0003', '2024-02-15'),
  ('t0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000004', 'Türkçe', '0532 200 0004', '2022-09-01')
ON CONFLICT (id) DO NOTHING;

-- 6. PARENTS
INSERT INTO public.parents (id, profile_id, full_name, phone, email, occupation)
VALUES 
  ('p0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000005', 'Mustafa Çelik', '0533 300 0005', 'mustafa.celik@gmail.com', 'Mühendis')
ON CONFLICT (id) DO NOTHING;

-- 7. CURRICULUMS & TOPICS (Örnek 8. Sınıf Matematik)
INSERT INTO public.curriculums (id, name, subject_id, grade_level, academic_year_id, version)
VALUES ('m0000000-0000-0000-0000-000000000001', '2026-2027 8. Sınıf Matematik Müfredatı', 's0000000-0000-0000-0000-000000000001', 8, 'a0000000-0000-0000-0000-000000000001', 'v1.0')
ON CONFLICT (id) DO NOTHING;

-- Üniteler
INSERT INTO public.curriculum_units (id, curriculum_id, title, order_index)
VALUES 
  ('u1000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', '1. Ünite: Çarpanlar ve Katlar', 1),
  ('u1000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000001', '2. Ünite: Üslü İfadeler & Kareköklü İfadeler', 2),
  ('u1000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000001', '3. Ünite: Olasılık ve Cebirsel İfadeler', 3)
ON CONFLICT (id) DO NOTHING;

-- Konular
INSERT INTO public.curriculum_topics (id, unit_id, title, description, order_index, estimated_hours)
VALUES 
  ('tp000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000001', 'Pozitif Tam Sayıların Çarpanları', 'Asal çarpanlara ayırma ve bölen sayıları', 1, 4),
  ('tp000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000001', 'EBOB ve EKOK Uygulamaları', 'En büyük ortak bölen ve ortak kat problemleri', 2, 6),
  ('tp000000-0000-0000-0000-000000000003', 'u1000000-0000-0000-0000-000000000001', 'Aralarında Asal Sayılar', 'Tanım ve temel problem çözümleri', 3, 2),
  ('tp000000-0000-0000-0000-000000000004', 'u1000000-0000-0000-0000-000000000002', 'Tam Sayıların Tam Sayı Kuvvetleri', 'Negatif üs kavramı ve özellikler', 1, 4),
  ('tp000000-0000-0000-0000-000000000005', 'u1000000-0000-0000-0000-000000000002', 'Üslü İfadelerle Temel İşlemler', 'Çarpma, bölme ve bilimsel gösterim', 2, 6),
  ('tp000000-0000-0000-0000-000000000006', 'u1000000-0000-0000-0000-000000000002', 'Tam Kare Pozitif Tam Sayılar & Karekök', 'Karekök kavramı ve sayı doğrusunda gösterimi', 3, 6)
ON CONFLICT (id) DO NOTHING;

-- 8. CLASS CURRICULUM ASSIGNMENT
INSERT INTO public.class_curriculums (id, class_id, curriculum_id, teacher_id, academic_year_id)
VALUES 
  ('cc000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
