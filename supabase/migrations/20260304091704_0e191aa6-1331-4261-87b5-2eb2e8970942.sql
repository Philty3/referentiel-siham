
-- 1. Table: contractuels (Statuts contractuels)
CREATE TABLE public.contractuels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_siham TEXT,
  categorie_siham TEXT,
  libelle_court_siham TEXT,
  libelle_long_siham TEXT,
  date_deb TEXT,
  date_fin TEXT,
  references_reglementaires TEXT,
  droit_public_prive TEXT,
  cas_utilisation TEXT,
  permanent_temporaire TEXT,
  regle_durees TEXT,
  type_contrat TEXT,
  cat_fp TEXT,
  sous_categorie TEXT,
  obligations_statutaires_enseignement TEXT,
  bibliotheque_actes TEXT,
  infos_complementaires TEXT,
  mode_gestion_remuneration TEXT,
  grade_tg TEXT,
  pseudo_grade TEXT,
  echelon TEXT,
  indice_brut_majore_force TEXT,
  situation_statutaire TEXT,
  regime_securite_sociale TEXT,
  regime_retraite TEXT,
  code_libelle_harpege TEXT,
  rg_pour_rdd TEXT,
  code_cisirh TEXT,
  libelle_cisirh TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table: vacataires
CREATE TABLE public.vacataires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_siham TEXT,
  categorie_siham TEXT,
  libelle_court_siham TEXT,
  libelle_long_siham TEXT,
  date_deb TEXT,
  date_fin TEXT,
  references_reglementaires TEXT,
  cas_utilisation TEXT,
  permanent_temporaire TEXT,
  regle_durees TEXT,
  type_contrat TEXT,
  cat_fp TEXT,
  sous_categorie TEXT,
  obligations_statutaires_enseignement TEXT,
  bibliotheque_actes TEXT,
  infos_complementaires TEXT,
  mode_gestion_remuneration TEXT,
  grade_tg TEXT,
  pseudo_grade TEXT,
  echelon TEXT,
  indice_brut_majore_force TEXT,
  situation_statutaire TEXT,
  regime_securite_sociale TEXT,
  regime_retraite TEXT,
  code_libelle_harpege TEXT,
  rg_pour_rdd TEXT,
  code_cisirh TEXT,
  libelle_cisirh TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table: heberges
CREATE TABLE public.heberges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_siham TEXT,
  libelle_court_siham TEXT,
  libelle_long_siham TEXT,
  references_reglementaires TEXT,
  cas_utilisation TEXT,
  bibliotheque_actes TEXT,
  sous_categorie TEXT,
  infos_complementaires TEXT,
  grade_tg TEXT,
  code_cisirh TEXT,
  libelle_cisirh TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Table: positions
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  libelle_court TEXT,
  libelle_long TEXT,
  libelle_long_bis TEXT,
  position_statutaire TEXT,
  temoin_position_entree_sortie TEXT,
  temoin_lien_enfant_obligatoire TEXT,
  tem_exclusion_inclusion_reglem TEXT,
  date_debut_validite TEXT,
  date_fin_validite TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Table: corps
CREATE TABLE public.corps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  libelle TEXT,
  libelle_long TEXT,
  libelle_long_bis TEXT,
  libelle_court_bis TEXT,
  tem_exclusion_inclusion_reglem TEXT,
  date_debut_validite TEXT,
  date_fin_validite TEXT,
  code_filiere TEXT,
  filiere TEXT,
  nombres_grades TEXT,
  corps_extinction TEXT,
  code_categorie_statutaire TEXT,
  categorie_statutaire TEXT,
  service_statutaire TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Table: grades
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  libelle TEXT,
  libelle_long TEXT,
  categorie_statutaire TEXT,
  code_filiere TEXT,
  filiere TEXT,
  code_corps_cadre_emploi TEXT,
  corps_cadre_emploi TEXT,
  code_groupe_hierarchique TEXT,
  groupe_hierarchique TEXT,
  age_limite_depart_retraite TEXT,
  tem_exclusion_inclusion_reglem TEXT,
  date_debut_validite TEXT,
  date_fin_validite TEXT,
  code_tresorerie_generale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Table: emplois
CREATE TABLE public.emplois (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cle TEXT,
  emploi TEXT,
  libelle_emploi TEXT,
  date_effet TEXT,
  classification_emploi TEXT,
  code_plus_utiliser TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Table: diplomes
CREATE TABLE public.diplomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  libelle TEXT,
  libelle_long TEXT,
  echelle_internationale TEXT,
  modele TEXT,
  tem_exclusion_inclusion TEXT,
  date_deb_validite TEXT,
  date_fin_validite TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Table: conges
CREATE TABLE public.conges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  libelle_long TEXT,
  libelle_court TEXT,
  tem_exclusion_inclusion_reglem TEXT,
  date_debut_validite TEXT,
  date_fin_validite TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Table: modalites
CREATE TABLE public.modalites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  libelle TEXT,
  libelle_long TEXT,
  libelle_long_bis TEXT,
  temoin_temps_partiel TEXT,
  pourcentage_acquisition_conges TEXT,
  pourcentage_prise_conge TEXT,
  temoin_lien_enfant_obligatoire TEXT,
  tem_exclusion_inclusion TEXT,
  date_deb_validite TEXT,
  date_fin_validite TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Table: etablissements
CREATE TABLE public.etablissements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_uai TEXT,
  nom_etablissement TEXT,
  type_etablissement TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  academie TEXT,
  telephone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Table: actes
CREATE TABLE public.actes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT,
  libelle TEXT,
  libelle_complementaire TEXT,
  type_arrete_decision TEXT,
  type_population TEXT,
  numero_ordre TEXT,
  code_visa TEXT,
  visa TEXT,
  type_population_2 TEXT,
  numero_ordre_2 TEXT,
  code_article TEXT,
  article TEXT,
  processus TEXT,
  octroi_renouvellement TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.contractuels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacataires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heberges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emplois ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diplomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modalites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etablissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read" ON public.contractuels FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.vacataires FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.heberges FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.positions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.corps FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.emplois FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.diplomes FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.conges FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.modalites FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.etablissements FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.actes FOR SELECT USING (true);

-- Public write access
CREATE POLICY "Allow public insert" ON public.contractuels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.vacataires FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.heberges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.corps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.emplois FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.diplomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.conges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.modalites FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.etablissements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public.actes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.contractuels FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.vacataires FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.heberges FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.positions FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.corps FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.grades FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.emplois FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.diplomes FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.conges FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.modalites FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.etablissements FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON public.actes FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.contractuels FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.vacataires FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.heberges FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.positions FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.corps FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.grades FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.emplois FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.diplomes FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.conges FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.modalites FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.etablissements FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON public.actes FOR DELETE USING (true);
