
-- Drop old positions table
DROP TABLE IF EXISTS public.positions CASCADE;

-- Create new positions table with columns matching the Excel file
CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  code text,
  libelle_long text,
  libelle_court text,
  date_debut text,
  date_fin text,
  population text,
  cas_usage text,
  population_particuliere text,
  texte text,
  commentaires text
);

-- Enable RLS
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- RLS policies for public access
CREATE POLICY "Allow public read" ON public.positions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert" ON public.positions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.positions FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow public delete" ON public.positions FOR DELETE TO anon, authenticated USING (true);
