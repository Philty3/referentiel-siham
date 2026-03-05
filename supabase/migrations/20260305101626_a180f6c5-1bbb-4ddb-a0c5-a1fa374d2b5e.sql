
ALTER TABLE public.actes ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.conges ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.contractuels ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.corps ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.diplomes ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.emplois ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.etablissements ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.heberges ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.modalites ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
ALTER TABLE public.vacataires ADD COLUMN IF NOT EXISTS code_up_cite boolean NOT NULL DEFAULT false;
