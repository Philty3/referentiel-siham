
DROP TABLE IF EXISTS public.centres_couts;

CREATE TABLE public.centres_couts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  affectation_generale text,
  composante_direction text,
  uo_affectation_principale text,
  code_uo_affectation text,
  population text,
  code_centre_cout text,
  designation text,
  centre_financier text
);

ALTER TABLE public.centres_couts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.centres_couts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.centres_couts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.centres_couts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.centres_couts FOR DELETE USING (true);
