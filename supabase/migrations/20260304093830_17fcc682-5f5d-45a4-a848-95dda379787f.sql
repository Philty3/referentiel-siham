
CREATE TABLE public.uo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  code_uo TEXT,
  libelle_long TEXT,
  libelle_court TEXT,
  code_uo_mere TEXT,
  type TEXT,
  niveau TEXT,
  code_uai TEXT,
  statut TEXT,
  responsable_composante TEXT,
  responsable_administratif TEXT,
  numero_voie TEXT,
  complement_adresse TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  code_uo_p5_p7 TEXT,
  code_uo_bis TEXT,
  code_uo_site_associe TEXT,
  groupe_eval TEXT,
  groupe_phare TEXT
);

ALTER TABLE public.uo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.uo FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.uo FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.uo FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.uo FOR DELETE USING (true);
