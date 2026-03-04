CREATE TABLE public.centres_couts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  code text,
  libelle_court text,
  libelle_long text,
  type text,
  uo_rattachee text,
  responsable text,
  date_debut_validite text,
  date_fin_validite text,
  statut text,
  commentaire text
);

ALTER TABLE public.centres_couts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.centres_couts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.centres_couts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.centres_couts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.centres_couts FOR DELETE USING (true);