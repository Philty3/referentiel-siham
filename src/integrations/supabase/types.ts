export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      actes: {
        Row: {
          article: string | null
          code: string | null
          code_article: string | null
          code_visa: string | null
          created_at: string
          id: string
          libelle: string | null
          libelle_complementaire: string | null
          numero_ordre: string | null
          numero_ordre_2: string | null
          octroi_renouvellement: string | null
          processus: string | null
          type_arrete_decision: string | null
          type_population: string | null
          type_population_2: string | null
          visa: string | null
        }
        Insert: {
          article?: string | null
          code?: string | null
          code_article?: string | null
          code_visa?: string | null
          created_at?: string
          id?: string
          libelle?: string | null
          libelle_complementaire?: string | null
          numero_ordre?: string | null
          numero_ordre_2?: string | null
          octroi_renouvellement?: string | null
          processus?: string | null
          type_arrete_decision?: string | null
          type_population?: string | null
          type_population_2?: string | null
          visa?: string | null
        }
        Update: {
          article?: string | null
          code?: string | null
          code_article?: string | null
          code_visa?: string | null
          created_at?: string
          id?: string
          libelle?: string | null
          libelle_complementaire?: string | null
          numero_ordre?: string | null
          numero_ordre_2?: string | null
          octroi_renouvellement?: string | null
          processus?: string | null
          type_arrete_decision?: string | null
          type_population?: string | null
          type_population_2?: string | null
          visa?: string | null
        }
        Relationships: []
      }
      centres_couts: {
        Row: {
          code: string | null
          commentaire: string | null
          created_at: string
          date_debut_validite: string | null
          date_fin_validite: string | null
          id: string
          libelle_court: string | null
          libelle_long: string | null
          responsable: string | null
          statut: string | null
          type: string | null
          uo_rattachee: string | null
        }
        Insert: {
          code?: string | null
          commentaire?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          id?: string
          libelle_court?: string | null
          libelle_long?: string | null
          responsable?: string | null
          statut?: string | null
          type?: string | null
          uo_rattachee?: string | null
        }
        Update: {
          code?: string | null
          commentaire?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          id?: string
          libelle_court?: string | null
          libelle_long?: string | null
          responsable?: string | null
          statut?: string | null
          type?: string | null
          uo_rattachee?: string | null
        }
        Relationships: []
      }
      conges: {
        Row: {
          code: string | null
          created_at: string
          date_debut_validite: string | null
          date_fin_validite: string | null
          id: string
          libelle_court: string | null
          libelle_long: string | null
          tem_exclusion_inclusion_reglem: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          id?: string
          libelle_court?: string | null
          libelle_long?: string | null
          tem_exclusion_inclusion_reglem?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          id?: string
          libelle_court?: string | null
          libelle_long?: string | null
          tem_exclusion_inclusion_reglem?: string | null
        }
        Relationships: []
      }
      contractuels: {
        Row: {
          bibliotheque_actes: string | null
          cas_utilisation: string | null
          cat_fp: string | null
          categorie_siham: string | null
          code_cisirh: string | null
          code_libelle_harpege: string | null
          code_siham: string | null
          created_at: string
          date_deb: string | null
          date_fin: string | null
          droit_public_prive: string | null
          echelon: string | null
          grade_tg: string | null
          id: string
          indice_brut_majore_force: string | null
          infos_complementaires: string | null
          libelle_cisirh: string | null
          libelle_court_siham: string | null
          libelle_long_siham: string | null
          mode_gestion_remuneration: string | null
          obligations_statutaires_enseignement: string | null
          permanent_temporaire: string | null
          pseudo_grade: string | null
          references_reglementaires: string | null
          regime_retraite: string | null
          regime_securite_sociale: string | null
          regle_durees: string | null
          rg_pour_rdd: string | null
          situation_statutaire: string | null
          sous_categorie: string | null
          type_contrat: string | null
        }
        Insert: {
          bibliotheque_actes?: string | null
          cas_utilisation?: string | null
          cat_fp?: string | null
          categorie_siham?: string | null
          code_cisirh?: string | null
          code_libelle_harpege?: string | null
          code_siham?: string | null
          created_at?: string
          date_deb?: string | null
          date_fin?: string | null
          droit_public_prive?: string | null
          echelon?: string | null
          grade_tg?: string | null
          id?: string
          indice_brut_majore_force?: string | null
          infos_complementaires?: string | null
          libelle_cisirh?: string | null
          libelle_court_siham?: string | null
          libelle_long_siham?: string | null
          mode_gestion_remuneration?: string | null
          obligations_statutaires_enseignement?: string | null
          permanent_temporaire?: string | null
          pseudo_grade?: string | null
          references_reglementaires?: string | null
          regime_retraite?: string | null
          regime_securite_sociale?: string | null
          regle_durees?: string | null
          rg_pour_rdd?: string | null
          situation_statutaire?: string | null
          sous_categorie?: string | null
          type_contrat?: string | null
        }
        Update: {
          bibliotheque_actes?: string | null
          cas_utilisation?: string | null
          cat_fp?: string | null
          categorie_siham?: string | null
          code_cisirh?: string | null
          code_libelle_harpege?: string | null
          code_siham?: string | null
          created_at?: string
          date_deb?: string | null
          date_fin?: string | null
          droit_public_prive?: string | null
          echelon?: string | null
          grade_tg?: string | null
          id?: string
          indice_brut_majore_force?: string | null
          infos_complementaires?: string | null
          libelle_cisirh?: string | null
          libelle_court_siham?: string | null
          libelle_long_siham?: string | null
          mode_gestion_remuneration?: string | null
          obligations_statutaires_enseignement?: string | null
          permanent_temporaire?: string | null
          pseudo_grade?: string | null
          references_reglementaires?: string | null
          regime_retraite?: string | null
          regime_securite_sociale?: string | null
          regle_durees?: string | null
          rg_pour_rdd?: string | null
          situation_statutaire?: string | null
          sous_categorie?: string | null
          type_contrat?: string | null
        }
        Relationships: []
      }
      corps: {
        Row: {
          categorie_statutaire: string | null
          code: string | null
          code_categorie_statutaire: string | null
          code_filiere: string | null
          corps_extinction: string | null
          created_at: string
          date_debut_validite: string | null
          date_fin_validite: string | null
          filiere: string | null
          id: string
          libelle: string | null
          libelle_court_bis: string | null
          libelle_long: string | null
          libelle_long_bis: string | null
          nombres_grades: string | null
          service_statutaire: string | null
          tem_exclusion_inclusion_reglem: string | null
        }
        Insert: {
          categorie_statutaire?: string | null
          code?: string | null
          code_categorie_statutaire?: string | null
          code_filiere?: string | null
          corps_extinction?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          filiere?: string | null
          id?: string
          libelle?: string | null
          libelle_court_bis?: string | null
          libelle_long?: string | null
          libelle_long_bis?: string | null
          nombres_grades?: string | null
          service_statutaire?: string | null
          tem_exclusion_inclusion_reglem?: string | null
        }
        Update: {
          categorie_statutaire?: string | null
          code?: string | null
          code_categorie_statutaire?: string | null
          code_filiere?: string | null
          corps_extinction?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          filiere?: string | null
          id?: string
          libelle?: string | null
          libelle_court_bis?: string | null
          libelle_long?: string | null
          libelle_long_bis?: string | null
          nombres_grades?: string | null
          service_statutaire?: string | null
          tem_exclusion_inclusion_reglem?: string | null
        }
        Relationships: []
      }
      diplomes: {
        Row: {
          code: string | null
          created_at: string
          date_deb_validite: string | null
          date_fin_validite: string | null
          echelle_internationale: string | null
          id: string
          libelle: string | null
          libelle_long: string | null
          modele: string | null
          tem_exclusion_inclusion: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          date_deb_validite?: string | null
          date_fin_validite?: string | null
          echelle_internationale?: string | null
          id?: string
          libelle?: string | null
          libelle_long?: string | null
          modele?: string | null
          tem_exclusion_inclusion?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          date_deb_validite?: string | null
          date_fin_validite?: string | null
          echelle_internationale?: string | null
          id?: string
          libelle?: string | null
          libelle_long?: string | null
          modele?: string | null
          tem_exclusion_inclusion?: string | null
        }
        Relationships: []
      }
      emplois: {
        Row: {
          classification_emploi: string | null
          cle: string | null
          code_plus_utiliser: string | null
          created_at: string
          date_effet: string | null
          emploi: string | null
          id: string
          libelle_emploi: string | null
        }
        Insert: {
          classification_emploi?: string | null
          cle?: string | null
          code_plus_utiliser?: string | null
          created_at?: string
          date_effet?: string | null
          emploi?: string | null
          id?: string
          libelle_emploi?: string | null
        }
        Update: {
          classification_emploi?: string | null
          cle?: string | null
          code_plus_utiliser?: string | null
          created_at?: string
          date_effet?: string | null
          emploi?: string | null
          id?: string
          libelle_emploi?: string | null
        }
        Relationships: []
      }
      etablissements: {
        Row: {
          academie: string | null
          adresse: string | null
          code_postal: string | null
          code_uai: string | null
          created_at: string
          email: string | null
          id: string
          nom_etablissement: string | null
          telephone: string | null
          type_etablissement: string | null
          ville: string | null
        }
        Insert: {
          academie?: string | null
          adresse?: string | null
          code_postal?: string | null
          code_uai?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom_etablissement?: string | null
          telephone?: string | null
          type_etablissement?: string | null
          ville?: string | null
        }
        Update: {
          academie?: string | null
          adresse?: string | null
          code_postal?: string | null
          code_uai?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom_etablissement?: string | null
          telephone?: string | null
          type_etablissement?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          age_limite_depart_retraite: string | null
          categorie_statutaire: string | null
          code: string | null
          code_corps_cadre_emploi: string | null
          code_filiere: string | null
          code_groupe_hierarchique: string | null
          code_tresorerie_generale: string | null
          corps_cadre_emploi: string | null
          created_at: string
          date_debut_validite: string | null
          date_fin_validite: string | null
          filiere: string | null
          groupe_hierarchique: string | null
          id: string
          libelle: string | null
          libelle_long: string | null
          tem_exclusion_inclusion_reglem: string | null
        }
        Insert: {
          age_limite_depart_retraite?: string | null
          categorie_statutaire?: string | null
          code?: string | null
          code_corps_cadre_emploi?: string | null
          code_filiere?: string | null
          code_groupe_hierarchique?: string | null
          code_tresorerie_generale?: string | null
          corps_cadre_emploi?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          filiere?: string | null
          groupe_hierarchique?: string | null
          id?: string
          libelle?: string | null
          libelle_long?: string | null
          tem_exclusion_inclusion_reglem?: string | null
        }
        Update: {
          age_limite_depart_retraite?: string | null
          categorie_statutaire?: string | null
          code?: string | null
          code_corps_cadre_emploi?: string | null
          code_filiere?: string | null
          code_groupe_hierarchique?: string | null
          code_tresorerie_generale?: string | null
          corps_cadre_emploi?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          filiere?: string | null
          groupe_hierarchique?: string | null
          id?: string
          libelle?: string | null
          libelle_long?: string | null
          tem_exclusion_inclusion_reglem?: string | null
        }
        Relationships: []
      }
      heberges: {
        Row: {
          bibliotheque_actes: string | null
          cas_utilisation: string | null
          code_cisirh: string | null
          code_siham: string | null
          created_at: string
          grade_tg: string | null
          id: string
          infos_complementaires: string | null
          libelle_cisirh: string | null
          libelle_court_siham: string | null
          libelle_long_siham: string | null
          references_reglementaires: string | null
          sous_categorie: string | null
        }
        Insert: {
          bibliotheque_actes?: string | null
          cas_utilisation?: string | null
          code_cisirh?: string | null
          code_siham?: string | null
          created_at?: string
          grade_tg?: string | null
          id?: string
          infos_complementaires?: string | null
          libelle_cisirh?: string | null
          libelle_court_siham?: string | null
          libelle_long_siham?: string | null
          references_reglementaires?: string | null
          sous_categorie?: string | null
        }
        Update: {
          bibliotheque_actes?: string | null
          cas_utilisation?: string | null
          code_cisirh?: string | null
          code_siham?: string | null
          created_at?: string
          grade_tg?: string | null
          id?: string
          infos_complementaires?: string | null
          libelle_cisirh?: string | null
          libelle_court_siham?: string | null
          libelle_long_siham?: string | null
          references_reglementaires?: string | null
          sous_categorie?: string | null
        }
        Relationships: []
      }
      modalites: {
        Row: {
          code: string | null
          created_at: string
          date_deb_validite: string | null
          date_fin_validite: string | null
          id: string
          libelle: string | null
          libelle_long: string | null
          libelle_long_bis: string | null
          pourcentage_acquisition_conges: string | null
          pourcentage_prise_conge: string | null
          tem_exclusion_inclusion: string | null
          temoin_lien_enfant_obligatoire: string | null
          temoin_temps_partiel: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          date_deb_validite?: string | null
          date_fin_validite?: string | null
          id?: string
          libelle?: string | null
          libelle_long?: string | null
          libelle_long_bis?: string | null
          pourcentage_acquisition_conges?: string | null
          pourcentage_prise_conge?: string | null
          tem_exclusion_inclusion?: string | null
          temoin_lien_enfant_obligatoire?: string | null
          temoin_temps_partiel?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          date_deb_validite?: string | null
          date_fin_validite?: string | null
          id?: string
          libelle?: string | null
          libelle_long?: string | null
          libelle_long_bis?: string | null
          pourcentage_acquisition_conges?: string | null
          pourcentage_prise_conge?: string | null
          tem_exclusion_inclusion?: string | null
          temoin_lien_enfant_obligatoire?: string | null
          temoin_temps_partiel?: string | null
        }
        Relationships: []
      }
      positions: {
        Row: {
          code: string | null
          created_at: string
          date_debut_validite: string | null
          date_fin_validite: string | null
          id: string
          libelle_court: string | null
          libelle_long: string | null
          libelle_long_bis: string | null
          position_statutaire: string | null
          tem_exclusion_inclusion_reglem: string | null
          temoin_lien_enfant_obligatoire: string | null
          temoin_position_entree_sortie: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          id?: string
          libelle_court?: string | null
          libelle_long?: string | null
          libelle_long_bis?: string | null
          position_statutaire?: string | null
          tem_exclusion_inclusion_reglem?: string | null
          temoin_lien_enfant_obligatoire?: string | null
          temoin_position_entree_sortie?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          date_debut_validite?: string | null
          date_fin_validite?: string | null
          id?: string
          libelle_court?: string | null
          libelle_long?: string | null
          libelle_long_bis?: string | null
          position_statutaire?: string | null
          tem_exclusion_inclusion_reglem?: string | null
          temoin_lien_enfant_obligatoire?: string | null
          temoin_position_entree_sortie?: string | null
        }
        Relationships: []
      }
      uo: {
        Row: {
          adresse: string | null
          code_postal: string | null
          code_uai: string | null
          code_uo: string | null
          code_uo_bis: string | null
          code_uo_mere: string | null
          code_uo_p5_p7: string | null
          code_uo_site_associe: string | null
          complement_adresse: string | null
          created_at: string
          groupe_eval: string | null
          groupe_phare: string | null
          id: string
          libelle_court: string | null
          libelle_long: string | null
          niveau: string | null
          numero_voie: string | null
          responsable_administratif: string | null
          responsable_composante: string | null
          statut: string | null
          type: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          code_postal?: string | null
          code_uai?: string | null
          code_uo?: string | null
          code_uo_bis?: string | null
          code_uo_mere?: string | null
          code_uo_p5_p7?: string | null
          code_uo_site_associe?: string | null
          complement_adresse?: string | null
          created_at?: string
          groupe_eval?: string | null
          groupe_phare?: string | null
          id?: string
          libelle_court?: string | null
          libelle_long?: string | null
          niveau?: string | null
          numero_voie?: string | null
          responsable_administratif?: string | null
          responsable_composante?: string | null
          statut?: string | null
          type?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          code_postal?: string | null
          code_uai?: string | null
          code_uo?: string | null
          code_uo_bis?: string | null
          code_uo_mere?: string | null
          code_uo_p5_p7?: string | null
          code_uo_site_associe?: string | null
          complement_adresse?: string | null
          created_at?: string
          groupe_eval?: string | null
          groupe_phare?: string | null
          id?: string
          libelle_court?: string | null
          libelle_long?: string | null
          niveau?: string | null
          numero_voie?: string | null
          responsable_administratif?: string | null
          responsable_composante?: string | null
          statut?: string | null
          type?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      vacataires: {
        Row: {
          bibliotheque_actes: string | null
          cas_utilisation: string | null
          cat_fp: string | null
          categorie_siham: string | null
          code_cisirh: string | null
          code_libelle_harpege: string | null
          code_siham: string | null
          created_at: string
          date_deb: string | null
          date_fin: string | null
          echelon: string | null
          grade_tg: string | null
          id: string
          indice_brut_majore_force: string | null
          infos_complementaires: string | null
          libelle_cisirh: string | null
          libelle_court_siham: string | null
          libelle_long_siham: string | null
          mode_gestion_remuneration: string | null
          obligations_statutaires_enseignement: string | null
          permanent_temporaire: string | null
          pseudo_grade: string | null
          references_reglementaires: string | null
          regime_retraite: string | null
          regime_securite_sociale: string | null
          regle_durees: string | null
          rg_pour_rdd: string | null
          situation_statutaire: string | null
          sous_categorie: string | null
          type_contrat: string | null
        }
        Insert: {
          bibliotheque_actes?: string | null
          cas_utilisation?: string | null
          cat_fp?: string | null
          categorie_siham?: string | null
          code_cisirh?: string | null
          code_libelle_harpege?: string | null
          code_siham?: string | null
          created_at?: string
          date_deb?: string | null
          date_fin?: string | null
          echelon?: string | null
          grade_tg?: string | null
          id?: string
          indice_brut_majore_force?: string | null
          infos_complementaires?: string | null
          libelle_cisirh?: string | null
          libelle_court_siham?: string | null
          libelle_long_siham?: string | null
          mode_gestion_remuneration?: string | null
          obligations_statutaires_enseignement?: string | null
          permanent_temporaire?: string | null
          pseudo_grade?: string | null
          references_reglementaires?: string | null
          regime_retraite?: string | null
          regime_securite_sociale?: string | null
          regle_durees?: string | null
          rg_pour_rdd?: string | null
          situation_statutaire?: string | null
          sous_categorie?: string | null
          type_contrat?: string | null
        }
        Update: {
          bibliotheque_actes?: string | null
          cas_utilisation?: string | null
          cat_fp?: string | null
          categorie_siham?: string | null
          code_cisirh?: string | null
          code_libelle_harpege?: string | null
          code_siham?: string | null
          created_at?: string
          date_deb?: string | null
          date_fin?: string | null
          echelon?: string | null
          grade_tg?: string | null
          id?: string
          indice_brut_majore_force?: string | null
          infos_complementaires?: string | null
          libelle_cisirh?: string | null
          libelle_court_siham?: string | null
          libelle_long_siham?: string | null
          mode_gestion_remuneration?: string | null
          obligations_statutaires_enseignement?: string | null
          permanent_temporaire?: string | null
          pseudo_grade?: string | null
          references_reglementaires?: string | null
          regime_retraite?: string | null
          regime_securite_sociale?: string | null
          regle_durees?: string | null
          rg_pour_rdd?: string | null
          situation_statutaire?: string | null
          sous_categorie?: string | null
          type_contrat?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
