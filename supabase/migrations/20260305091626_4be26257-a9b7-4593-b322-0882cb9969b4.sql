
DROP TABLE IF EXISTS public.centres_couts;

CREATE TABLE public.centres_couts (
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

ALTER TABLE public.centres_couts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.centres_couts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.centres_couts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.centres_couts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.centres_couts FOR DELETE USING (true);
