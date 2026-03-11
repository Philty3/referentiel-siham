import { useState, useRef } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, PlusCircle, LogOut, Loader2, CheckCircle2, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { formatExcelDate } from "@/lib/dateValidator";

const tableConfigs = [
  {
    table: "contractuels", label: "Statuts contractuels", minColumns: 29,
    columns: ["code_siham","categorie_siham","libelle_court_siham","libelle_long_siham","date_deb","date_fin","references_reglementaires","droit_public_prive","cas_utilisation","permanent_temporaire","regle_durees","type_contrat","cat_fp","sous_categorie","obligations_statutaires_enseignement","bibliotheque_actes","infos_complementaires","mode_gestion_remuneration","grade_tg","pseudo_grade","echelon","indice_brut_majore_force","situation_statutaire","regime_securite_sociale","regime_retraite","code_libelle_harpege","rg_pour_rdd","code_cisirh","libelle_cisirh"],
    dateColumns: [4, 5],
  },
  {
    table: "vacataires", label: "Vacataires", minColumns: 28,
    columns: ["code_siham","categorie_siham","libelle_court_siham","libelle_long_siham","date_deb","date_fin","references_reglementaires","cas_utilisation","permanent_temporaire","regle_durees","type_contrat","cat_fp","sous_categorie","obligations_statutaires_enseignement","bibliotheque_actes","infos_complementaires","mode_gestion_remuneration","grade_tg","pseudo_grade","echelon","indice_brut_majore_force","situation_statutaire","regime_securite_sociale","regime_retraite","code_libelle_harpege","rg_pour_rdd","code_cisirh","libelle_cisirh"],
    dateColumns: [4, 5],
  },
  {
    table: "heberges", label: "Hébergés", minColumns: 1,
    columns: ["code_siham","libelle_court_siham","libelle_long_siham","references_reglementaires","cas_utilisation","bibliotheque_actes","sous_categorie","infos_complementaires","grade_tg","code_cisirh","libelle_cisirh"],
  },
  {
    table: "actes", label: "Actes", minColumns: 14,
    columns: ["code","libelle","libelle_complementaire","type_arrete_decision","type_population","numero_ordre","code_visa","visa","type_population_2","numero_ordre_2","code_article","article","processus","octroi_renouvellement"],
  },
  {
    table: "positions", label: "Positions", minColumns: 10,
    columns: ["code","libelle_court","libelle_long","libelle_long_bis","position_statutaire","temoin_position_entree_sortie","temoin_lien_enfant_obligatoire","tem_exclusion_inclusion_reglem","date_debut_validite","date_fin_validite"],
    dateColumns: [8, 9],
  },
  {
    table: "corps", label: "Corps", minColumns: 15,
    columns: ["code","libelle","libelle_long","libelle_long_bis","libelle_court_bis","tem_exclusion_inclusion_reglem","date_debut_validite","date_fin_validite","code_filiere","filiere","nombres_grades","corps_extinction","code_categorie_statutaire","categorie_statutaire","service_statutaire"],
    dateColumns: [6, 7],
  },
  {
    table: "grades", label: "Grades", minColumns: 15,
    columns: ["code","libelle","libelle_long","categorie_statutaire","code_filiere","filiere","code_corps_cadre_emploi","corps_cadre_emploi","code_groupe_hierarchique","groupe_hierarchique","age_limite_depart_retraite","tem_exclusion_inclusion_reglem","date_debut_validite","date_fin_validite","code_tresorerie_generale"],
    dateColumns: [12, 13],
  },
  {
    table: "conges", label: "Congés/absences", minColumns: 6,
    columns: ["code","libelle_long","libelle_court","tem_exclusion_inclusion_reglem","date_debut_validite","date_fin_validite"],
    dateColumns: [4, 5],
  },
  {
    table: "emplois", label: "Emplois", minColumns: 4,
    columns: ["cle","emploi","libelle_emploi","date_effet","classification_emploi","code_plus_utiliser"],
    dateColumns: [3],
  },
  {
    table: "modalites", label: "Modalités de service", minColumns: 9,
    columns: ["code","libelle","libelle_long","libelle_long_bis","temoin_temps_partiel","pourcentage_acquisition_conges","pourcentage_prise_conge","temoin_lien_enfant_obligatoire","tem_exclusion_inclusion","date_deb_validite","date_fin_validite"],
    dateColumns: [9, 10],
  },
  {
    table: "diplomes", label: "Diplômes", minColumns: 6,
    columns: ["code","libelle","libelle_long","echelle_internationale","modele","tem_exclusion_inclusion","date_deb_validite","date_fin_validite"],
    dateColumns: [6, 7],
  },
  {
    table: "etablissements", label: "Établissements", minColumns: 1,
    columns: ["code_uai","nom_etablissement","type_etablissement","adresse","code_postal","ville","academie","telephone","email"],
  },
  {
    table: "uo", label: "UO", minColumns: 1, sheet: 1,
    columns: ["code_uo","libelle_long","libelle_court","code_uo_mere","type","niveau","code_uai","statut","responsable_composante","responsable_administratif","numero_voie","complement_adresse","adresse","code_postal","ville","code_uo_p5_p7","code_uo_bis","code_uo_site_associe","groupe_eval","groupe_phare"],
  },
  {
    table: "centres_couts", label: "Centres de coûts", minColumns: 1,
    columns: ["affectation_generale","composante_direction","uo_affectation_principale","code_uo_affectation","population","code_centre_cout","designation","centre_financier"],
  },
];

type ImportStatus = "idle" | "loading" | "success" | "error";

interface TableImportState {
  status: ImportStatus;
  message: string;
}

const Administration = () => {
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [importStates, setImportStates] = useState<Record<string, TableImportState>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [pendingAction, setPendingAction] = useState<{ table: string; mode: "append" | "replace" } | null>(null);

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const updateState = (table: string, state: Partial<TableImportState>) => {
    setImportStates(prev => ({
      ...prev,
      [table]: { ...prev[table], ...state } as TableImportState,
    }));
  };

  const handleImport = (table: string, mode: "append" | "replace") => {
    setPendingAction({ table, mode });
    fileRefs.current[table]?.click();
  };

  const processFile = async (table: string, file: File) => {
    if (!pendingAction) return;
    const { mode } = pendingAction;
    const config = tableConfigs.find(c => c.table === table)!;

    updateState(table, { status: "loading", message: "Lecture du fichier..." });

    try {
      const buffer = await file.arrayBuffer();

      // Special handling for UO table: use ExcelJS to detect red rows
      if (table === "uo") {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) throw new Error("Aucune feuille trouvée");

        const rows: Record<string, any>[] = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const values = row.values as any[];
          const cellValues = values.slice(1);
          if (cellValues.length < 1) return;

          const obj: Record<string, any> = {};
          config.columns.forEach((col, idx) => {
            const val = cellValues[idx];
            obj[col] = val != null ? String(val) : null;
          });

          // Detect red rows
          let hasRed = false;
          row.eachCell({ includeEmpty: false }, (cell) => {
            const fontColor = cell.font?.color?.argb;
            if (fontColor) {
              const upper = fontColor.toUpperCase();
              if (upper.includes("FF0000") || upper.includes("CC0000") || upper.includes("FFFF0000")) hasRed = true;
            }
            const fill = cell.fill;
            if (fill && fill.type === "pattern" && (fill as any).fgColor?.argb) {
              const upper = (fill as any).fgColor.argb.toUpperCase();
              if (upper.includes("FF0000") || upper.includes("CC0000") || upper.includes("FFFF0000")) hasRed = true;
            }
          });
          obj.is_highlighted = hasRed;
          rows.push(obj);
        });

        if (rows.length === 0) {
          updateState(table, { status: "error", message: "Aucune donnée trouvée dans le fichier" });
          return;
        }

        if (mode === "replace") {
          updateState(table, { status: "loading", message: "Suppression des données existantes..." });
          const { error: delError } = await supabase.from(table as any).delete().neq("id", "00000000-0000-0000-0000-000000000000");
          if (delError) throw new Error(delError.message);
        }

        updateState(table, { status: "loading", message: `Insertion de ${rows.length} lignes...` });
        const batchSize = 500;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error } = await supabase.from(table as any).insert(batch as any);
          if (error) throw new Error(error.message);
          updateState(table, { status: "loading", message: `${Math.min(i + batchSize, rows.length)}/${rows.length} lignes insérées...` });
        }

        updateState(table, { status: "success", message: `✅ ${rows.length} lignes ${mode === "replace" ? "importées (remplacement)" : "ajoutées"}` });
        toast({ title: "Import réussi", description: `${config.label}: ${rows.length} lignes ${mode === "replace" ? "importées" : "ajoutées"}` });
        setPendingAction(null);
        return;
      }

      // Standard handling for other tables
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetIndex = config.sheet ?? 0;
      const sheetName = workbook.SheetNames[sheetIndex] || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      const rows: Record<string, string | null>[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length < (config.minColumns || 1)) continue;
        const obj: Record<string, string | null> = {};
        config.columns.forEach((col, idx) => {
          if (config.dateColumns?.includes(idx)) {
            obj[col] = formatExcelDate(row[idx]) || null;
          } else {
            obj[col] = row[idx] != null ? String(row[idx]) : null;
          }
        });
        rows.push(obj);
      }

      if (rows.length === 0) {
        updateState(table, { status: "error", message: "Aucune donnée trouvée dans le fichier" });
        return;
      }

      if (mode === "replace") {
        updateState(table, { status: "loading", message: "Suppression des données existantes..." });
        const { error: delError } = await supabase
          .from(table as any)
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");
        if (delError) throw new Error(delError.message);
      }

      updateState(table, { status: "loading", message: `Insertion de ${rows.length} lignes...` });
      const batchSize = 500;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabase.from(table as any).insert(batch as any);
        if (error) throw new Error(error.message);
        updateState(table, { status: "loading", message: `${Math.min(i + batchSize, rows.length)}/${rows.length} lignes insérées...` });
      }

      updateState(table, { status: "success", message: `✅ ${rows.length} lignes ${mode === "replace" ? "importées (remplacement)" : "ajoutées"}` });
      toast({ title: "Import réussi", description: `${config.label}: ${rows.length} lignes ${mode === "replace" ? "importées" : "ajoutées"}` });
    } catch (err: any) {
      updateState(table, { status: "error", message: `❌ ${err.message}` });
      toast({ title: "Erreur d'import", description: err.message, variant: "destructive" });
    } finally {
      setPendingAction(null);
    }
  };

  const onFileChange = (table: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(table, file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Administration</h1>
          <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }} className="gap-2">
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Importez un fichier Excel pour chaque référentiel. Vous pouvez ajouter les données au contenu existant ou remplacer entièrement la table.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {tableConfigs.map(config => {
            const state = importStates[config.table] || { status: "idle", message: "" };
            const isLoading = state.status === "loading";
            return (
              <Card key={config.table} className="relative">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    {config.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    ref={el => { fileRefs.current[config.table] = el; }}
                    onChange={onFileChange(config.table)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isLoading}
                      onClick={() => handleImport(config.table, "append")}
                      className="flex-1 gap-1 text-xs"
                    >
                      {isLoading && pendingAction?.table === config.table && pendingAction.mode === "append"
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <PlusCircle className="h-3 w-3" />}
                      Ajouter
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isLoading}
                      onClick={() => handleImport(config.table, "replace")}
                      className="flex-1 gap-1 text-xs"
                    >
                      {isLoading && pendingAction?.table === config.table && pendingAction.mode === "replace"
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Trash2 className="h-3 w-3" />}
                      Remplacer
                    </Button>
                  </div>
                  {state.message && (
                    <p className={`text-xs flex items-center gap-1 ${
                      state.status === "success" ? "text-green-600" :
                      state.status === "error" ? "text-destructive" :
                      "text-muted-foreground"
                    }`}>
                      {state.status === "success" && <CheckCircle2 className="h-3 w-3" />}
                      {state.status === "error" && <XCircle className="h-3 w-3" />}
                      {state.status === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
                      {state.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Administration;
