ALTER TABLE public.uo ADD COLUMN IF NOT EXISTS matricule_responsable text DEFAULT NULL;
ALTER TABLE public.uo ADD COLUMN IF NOT EXISTS date_debut_responsable text DEFAULT NULL;
ALTER TABLE public.uo ADD COLUMN IF NOT EXISTS date_fin_responsable text DEFAULT NULL;