
-- Drop old columns and add new ones for centres_couts
ALTER TABLE public.centres_couts
  DROP COLUMN IF EXISTS libelle_court,
  DROP COLUMN IF EXISTS libelle_long,
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS uo_rattachee,
  DROP COLUMN IF EXISTS responsable,
  DROP COLUMN IF EXISTS date_debut_validite,
  DROP COLUMN IF EXISTS date_fin_validite,
  DROP COLUMN IF EXISTS statut,
  DROP COLUMN IF EXISTS commentaire,
  DROP COLUMN IF EXISTS code;

ALTER TABLE public.centres_couts
  ADD COLUMN affectation_generale text,
  ADD COLUMN composante_direction text,
  ADD COLUMN uo_affectation_principale text,
  ADD COLUMN code_uo_affectation text,
  ADD COLUMN population text,
  ADD COLUMN code_centre_cout text,
  ADD COLUMN designation text,
  ADD COLUMN centre_financier text;
