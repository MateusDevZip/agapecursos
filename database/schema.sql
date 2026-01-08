-- Ágape Cursos - Database Schema
-- Execute this in Supabase SQL Editor

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  pilar VARCHAR(50) NOT NULL CHECK (pilar IN ('terapia-capilar', 'massagem', 'psicanalise', 'gestao')),
  level VARCHAR(50) CHECK (level IN ('iniciante', 'avancado', 'profissionalizante')),
  duration_hours INTEGER,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10,2) CHECK (original_price >= 0),
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_pilar ON courses(pilar);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample courses
INSERT INTO courses (title, description, pilar, level, duration_hours, price, original_price, image_url, status) VALUES
(
  'Master em Tricologia e Saúde Capilar',
  'Aprenda a diagnosticar e tratar as principais patologias do couro cabeludo com técnicas avançadas.',
  'terapia-capilar',
  'avancado',
  60,
  497.00,
  697.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBYwJFHixoBvmvAhPVu4IfKrkQJayRmQSlkUI8iZ8NzSSV9N_sFzfpW-dYB_SwQbqJG0GTYsVWbaJcViVdhc9AlMo8PBNI8qjk5rs90OP1_oiasGZnvVhkyt1pk8qSz27mra9tIPPLvTxD8Q0dD5k52l8_SvFUg_8KnMBFagRGMHHrkwCNXumVNrpzTK1X6rPEIB7rI_O2RNn6I31VZnDUZdV46--oXIERdU7MCJWUBXOwhhRT0M15Yqv8WYvkAqYzSSNyVfFrw6vYT',
  'active'
),
(
  'Massagem Terapêutica Integrativa',
  'Domine técnicas de relaxamento profundo e liberação miofascial para o bem-estar dos seus clientes.',
  'massagem',
  'iniciante',
  40,
  297.00,
  397.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuClBmouvf-asfRcFyc42RzRhmyjL9-AoZk2SFas8PeE4UT7W_PMgh1i7UN1C2gInRWfvEr5wKDT5BTWhGwf6F0gQNQoduP1-8DJGBXiNMb5xP8R2VtK95C5bf9FEwV9Q_qUADBOqCBjTC6ZSc7XHczDT9S_BaWISXGbB3AEiOdguljFwzMOmJUUWfyR-m96QzylcJqeWBa9L4hOoWsj-bMOi60We3CLf6xTb4r-06tn_xhuo24bFna5jL8b0dkZIEAg_CMI65junrhS',
  'active'
),
(
  'Fundamentos da Psicanálise Clínica',
  'Introdução aos conceitos freudianos e lacanianos aplicados à escuta terapêutica moderna.',
  'psicanalise',
  'profissionalizante',
  120,
  797.00,
  997.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAb62dlEIHgKL-GNtxfYtHm7FgHlxZGzvQkR62YgEr-pzdFI_D5JUc9gLXoKJrmtqPRbdlzzYL-3CWrBDcKzy43QqPlZbu3LAQ1f1CkaQEXlIfYR6uGjJhGVyv9T-5XGJsFxm56ZTwIvaHGOyaA3rtONfTc0eaGNybv0AgPwrhYuHi5hcFioZf5Xr_ckRHmYYz0J8pi2ptJBs6J3lgHfG3s93DLokk2dGGLRiSMTCKtrBWqu69S9RBZzf-x-RpyoPGEB-jB2XS5-HEy',
  'active'
),
(
  'Aromaterapia para Massagistas',
  'Potencialize seus tratamentos utilizando o poder dos óleos essenciais e suas propriedades curativas.',
  'massagem',
  'iniciante',
  20,
  147.00,
  197.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAjKVtqQbiGUfhfBFafzCvMyop9ue3_S7hjdSCQyS3nVA7qftdImKhLgngpvdmkvQ1i7OowIW6a2ndnbym2di3ZcwQqME2CWyoGH8yWjlqbxk7DCUCM2Cag8FtYOUT9eIiDr7EqOs38_fuNhi2_qzlnvG8943hSqsl82XVfWDQ8dGa-VQfqT16EvDt4XVImua6SPvCfxlm0xonc3T6KETwH365uuaPsYCHmY-o-n-SHF-ZEOvyTwC5XQQr6fVmbI0Cf--tRgRg6-vkw',
  'active'
),
(
  'Gestão de Carreira para Terapeutas',
  'Aprenda a precificar, atrair clientes e gerenciar seu consultório holístico com eficiência.',
  'gestao',
  'iniciante',
  15,
  97.00,
  NULL,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBNd77vOJkEJ3GDOtdsZiLODnHLOdMG2xn7sS1DSXdXKq8frWiy25a2ADu66Desab124N1R7PAdHHASBFjUiEgw2Oob_E0jDbzR9PKv1puu8a9qQ1bcDf8SLMzSB_j2r1dt0HRnEOX5bN-oFkNvmJHJ7iaUs3TfJeq3noBXT0Y_V_z0HFqXczAzy8Ci3l_swXQoSWdeD4e-4W5d23uOK65TQlOnq2o-ggNDUY0pzs-4_S0NKgB66b0xF9ILwXhjCkpwlGQ-JSM91V02',
  'active'
),
(
  'Interpretação de Sonhos',
  'Mergulhe no inconsciente e aprenda a técnica de interpretação dos sonhos na clínica psicanalítica.',
  'psicanalise',
  'avancado',
  30,
  250.00,
  350.00,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBQdJwHCDuqwGLEZjgLoWsBEZ0faEd6YaMVI5D-eGJJfB67LJkgvbmiCAcp2rxEt6mH_s6j9h8_oa5uH7Z_-mLTXK0MC4h3EfUuApbl37a4ndJ06y09eqnRGa3axP-CTb7j2UNkZ6428dg624MWYhC2hXeF6cteqgcC3knEKj9z1r3DqaeZbw-HorbgvFbE9NlHBDbU5zWQXz1LqYooBEmLwnPmYu6DxVRk5O_Mi_hKsbhB6xFvpkxGjRr7FjTESBBGLj1cuGacecRC',
  'active'
);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (only active courses)
CREATE POLICY "Public can view active courses"
  ON courses FOR SELECT
  USING (status = 'active');

-- Create policy for authenticated users to manage courses
-- Note: You'll need to adjust this based on your auth setup
CREATE POLICY "Authenticated users can manage courses"
  ON courses FOR ALL
  USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON courses TO anon;
GRANT ALL ON courses TO authenticated;
