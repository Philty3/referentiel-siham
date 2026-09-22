import { useState, useEffect, useMemo, useRef } from "react";
import { exportPageToExcel } from "@/lib/exportToExcel";
import { exportZ0B } from "@/lib/exportZ0B";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/supabaseUtils";
import { importUOWithStyles } from "@/lib/importUOWithStyles";
import { RefreshCw, Download, CalendarIcon, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/contexts/AdminContext";

interface UOItem {
  id?: string;
  code_uo: string;
  libelle_long: string;
  libelle_court: string;
  code_uo_mere: string;
  type: string;
  niveau: string;
  code_uai: string;
  statut: string;
  responsable_composante: string;
  responsable_administratif: string;
  matricule_responsable: string;
  date_debut_responsable: string;
  date_fin_responsable: string;
  numero_voie: string;
  complement_adresse: string;
  adresse: string;
  code_postal: string;
  ville: string;
  code_uo_p5_p7: string;
  code_uo_bis: string;
  code_uo_site_associe: string;
  groupe_eval: string;
  groupe_phare: string;
  is_highlighted?: boolean;
}

const emptyItem: UOItem = {
  code_uo: "", libelle_long: "", libelle_court: "", code_uo_mere: "",
  type: "", niveau: "", code_uai: "", statut: "",
  responsable_composante: "", responsable_administratif: "",
  matricule_responsable: "", date_debut_responsable: "", date_fin_responsable: "",
  numero_voie: "", complement_adresse: "", adresse: "", code_postal: "", ville: "",
  code_uo_p5_p7: "", code_uo_bis: "", code_uo_site_associe: "",
  groupe_eval: "", groupe_phare: "",
};

// Autocomplete input component for responsable fields
function AutocompleteInput({
  value,
  onChange,
  suggestions,
  id,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setInputValue(value); }, [value]);

  const filtered = useMemo(() => {
    if (!inputValue) return suggestions;
    const lower = inputValue.toLowerCase();
    return suggestions.filter((s) => s.toLowerCase().includes(lower));
  }, [inputValue, suggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={className}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => {
                setInputValue(s);
                onChange(s);
                setOpen(false);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const UOPage = () => {
  const { isAdmin } = useAdmin();
  const [data, setData] = useState<UOItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<UOItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  // Bulk replace state
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [replaceOldName, setReplaceOldName] = useState("");
  const [replaceNewName, setReplaceNewName] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);
  const [showNoResponsable, setShowNoResponsable] = useState(false);
  const [noResponsableDate, setNoResponsableDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isImportingMatricules, setIsImportingMatricules] = useState(false);
  const [matriculePreview, setMatriculePreview] = useState<{ matches: { code_uo: string; responsable: string; matricule: string; date_debut: string; id: string }[]; total: number } | null>(null);
  const [isMatriculeConfirmOpen, setIsMatriculeConfirmOpen] = useState(false);
  const matriculeInputRef = useRef<HTMLInputElement>(null);
  const dateFinInputRef = useRef<HTMLInputElement>(null);
  const [isImportingDateFin, setIsImportingDateFin] = useState(false);
  const { toast } = useToast();

  // Extract unique responsable administratif names
  const responsableNames = useMemo(() => {
    const names = new Set<string>();
    data.forEach((d) => {
      if (d.responsable_administratif?.trim()) names.add(d.responsable_administratif.trim());
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, "fr"));
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await fetchAllRows("uo", "code_uo");
    if (error) {
      console.error("Erreur chargement UO:", error);
      toast({ title: "Erreur", description: "Impossible de charger les données UO.", variant: "destructive" });
    } else {
      setData(
        (rows || []).map((r) => ({
          id: r.id,
          code_uo: r.code_uo || "",
          libelle_long: r.libelle_long || "",
          libelle_court: r.libelle_court || "",
          code_uo_mere: r.code_uo_mere || "",
          type: r.type || "",
          niveau: r.niveau || "",
          code_uai: r.code_uai || "",
          statut: r.statut || "",
          responsable_composante: r.responsable_composante || "",
          responsable_administratif: r.responsable_administratif || "",
          matricule_responsable: (r as any).matricule_responsable || "",
          date_debut_responsable: (r as any).date_debut_responsable || "",
          date_fin_responsable: (r as any).date_fin_responsable || "",
          numero_voie: r.numero_voie || "",
          complement_adresse: r.complement_adresse || "",
          adresse: r.adresse || "",
          code_postal: r.code_postal || "",
          ville: r.ville || "",
          code_uo_p5_p7: r.code_uo_p5_p7 || "",
          code_uo_bis: r.code_uo_bis || "",
          code_uo_site_associe: r.code_uo_site_associe || "",
          groupe_eval: r.groupe_eval || "",
          groupe_phare: r.groupe_phare || "",
          is_highlighted: r.is_highlighted || false,
        }))
      );
    }
    setLoading(false);
  };

  const triggerImport = async () => {
    setIsImporting(true);
    const result = await importUOWithStyles((msg) => {
      console.log("UO Import:", msg);
    });
    if (result.success) {
      toast({ title: "Import UO réussi", description: `${result.count} lignes importées avec détection des lignes rouges.` });
      await fetchData();
    } else {
      toast({ title: "Erreur d'import", description: result.error, variant: "destructive" });
    }
    setIsImporting(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: rows } = await fetchAllRows("uo", "code_uo");
      if (!rows || rows.length === 0) {
        await triggerImport();
      } else {
        setData(
          rows.map((r) => ({
            id: r.id,
            code_uo: r.code_uo || "",
            libelle_long: r.libelle_long || "",
            libelle_court: r.libelle_court || "",
            code_uo_mere: r.code_uo_mere || "",
            type: r.type || "",
            niveau: r.niveau || "",
            code_uai: r.code_uai || "",
            statut: r.statut || "",
            responsable_composante: r.responsable_composante || "",
            responsable_administratif: r.responsable_administratif || "",
            matricule_responsable: (r as any).matricule_responsable || "",
            date_debut_responsable: (r as any).date_debut_responsable || "",
            date_fin_responsable: (r as any).date_fin_responsable || "",
            numero_voie: r.numero_voie || "",
            complement_adresse: r.complement_adresse || "",
            adresse: r.adresse || "",
            code_postal: r.code_postal || "",
            ville: r.ville || "",
            code_uo_p5_p7: r.code_uo_p5_p7 || "",
            code_uo_bis: r.code_uo_bis || "",
            code_uo_site_associe: r.code_uo_site_associe || "",
            groupe_eval: r.groupe_eval || "",
            groupe_phare: r.groupe_phare || "",
            is_highlighted: r.is_highlighted || false,
          }))
        );
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAdd = () => {
    if (!isAdmin) return;
    setEditingItem({ ...emptyItem });
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: UOItem, index: number) => {
    if (!isAdmin) return;
    setEditingItem({ ...item });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    const { id, ...payload } = editingItem;

    if (editingIndex !== null && id) {
      const { error } = await supabase.from("uo").update(payload).eq("id", id);
      if (error) {
        toast({ title: "Erreur", description: "Impossible de mettre à jour.", variant: "destructive" });
        return;
      }
      toast({ title: "Modifications enregistrées", description: "L'élément a été mis à jour avec succès." });
    } else {
      const { error } = await supabase.from("uo").insert(payload);
      if (error) {
        toast({ title: "Erreur", description: "Impossible d'ajouter.", variant: "destructive" });
        return;
      }
      toast({ title: "Élément ajouté", description: "Le nouvel élément a été créé avec succès." });
    }
    setIsDialogOpen(false);
    setEditingItem(null);
    setEditingIndex(null);
    fetchData();
  };

  const handleDelete = async (index: number) => {
    const item = data[index];
    if (!item.id) return;
    const { error } = await supabase.from("uo").delete().eq("id", item.id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer.", variant: "destructive" });
      return;
    }
    toast({ title: "Élément supprimé", description: "L'élément a été supprimé avec succès.", variant: "destructive" });
    fetchData();
  };

  const handleInputChange = (field: keyof UOItem, value: string) => {
    if (editingItem) setEditingItem({ ...editingItem, [field]: value });
  };

  // Bulk replace responsable administratif
  const handleBulkReplace = async () => {
    if (!replaceOldName.trim() || !replaceNewName.trim()) {
      toast({ title: "Erreur", description: "Veuillez remplir les deux champs.", variant: "destructive" });
      return;
    }
    setIsReplacing(true);
    const matchingIds = data
      .filter((d) => d.responsable_administratif === replaceOldName.trim())
      .map((d) => d.id)
      .filter(Boolean) as string[];

    if (matchingIds.length === 0) {
      toast({ title: "Aucune correspondance", description: `Aucune UO trouvée avec le responsable "${replaceOldName}".`, variant: "destructive" });
      setIsReplacing(false);
      return;
    }

    // Update in batches of 100
    let errors = 0;
    for (let i = 0; i < matchingIds.length; i += 100) {
      const batch = matchingIds.slice(i, i + 100);
      const { error } = await supabase
        .from("uo")
        .update({ responsable_administratif: replaceNewName.trim() } as any)
        .in("id", batch);
      if (error) errors++;
    }

    if (errors > 0) {
      toast({ title: "Erreur partielle", description: "Certaines mises à jour ont échoué.", variant: "destructive" });
    } else {
      toast({
        title: "Remplacement effectué",
        description: `${matchingIds.length} UO mise(s) à jour : "${replaceOldName}" → "${replaceNewName}".`,
      });
    }

    setIsReplaceDialogOpen(false);
    setReplaceOldName("");
    setReplaceNewName("");
    setIsReplacing(false);
    fetchData();
  };

  const columns = [
    { key: "code_uo", label: "Code UO", width: "w-[150px]" },
    { key: "libelle_court", label: "Libellé court", width: "w-[180px]" },
    { key: "libelle_long", label: "Libellé long", width: "w-[250px]" },
    { key: "responsable_administratif", label: "Responsable administratif", width: "w-[220px]" },
    { key: "statut", label: "Statut", width: "w-[100px]" },
  ];

  const renderExpandedContent = (row: UOItem) => (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div><p className="font-semibold text-foreground mb-1">Code UO:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.code_uo}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Libellé long:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.libelle_long}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Libellé court:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.libelle_court}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Code UO mère:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.code_uo_mere}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Type:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.type}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Niveau:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.niveau}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Code UAI:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.code_uai}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Statut:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.statut}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Responsable composante:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.responsable_composante}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Responsable administratif:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.responsable_administratif}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Matricule responsable:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.matricule_responsable}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Date début responsable:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.date_debut_responsable}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Date fin responsable:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.date_fin_responsable}</p></div>
      <div><p className="font-semibold text-foreground mb-1">N° voie:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.numero_voie}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Complément adresse:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.complement_adresse}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Adresse:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.adresse}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Code postal:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.code_postal}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Ville:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.ville}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Code UO P5/P7:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.code_uo_p5_p7}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Code UO (bis):</p><p className="text-muted-foreground whitespace-pre-wrap">{row.code_uo_bis}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Code UO site associé:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.code_uo_site_associe}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Groupe EVAL:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.groupe_eval}</p></div>
      <div><p className="font-semibold text-foreground mb-1">Groupe PhaRe:</p><p className="text-muted-foreground whitespace-pre-wrap">{row.groupe_phare}</p></div>
    </div>
  );

  const fields: { key: keyof UOItem; label: string }[] = [
    { key: "code_uo", label: "Code UO" },
    { key: "libelle_long", label: "Libellé long" },
    { key: "libelle_court", label: "Libellé court" },
    { key: "code_uo_mere", label: "Code UO mère" },
    { key: "type", label: "Type" },
    { key: "niveau", label: "Niveau" },
    { key: "code_uai", label: "Code UAI" },
    { key: "statut", label: "Statut" },
    { key: "responsable_composante", label: "Responsable composante" },
    { key: "responsable_administratif", label: "Responsable administratif" },
    { key: "matricule_responsable", label: "Matricule responsable" },
    { key: "date_debut_responsable", label: "Date début responsable" },
    { key: "date_fin_responsable", label: "Date fin responsable" },
    { key: "numero_voie", label: "N° voie" },
    { key: "complement_adresse", label: "Complément adresse" },
    { key: "adresse", label: "Adresse" },
    { key: "code_postal", label: "Code postal" },
    { key: "ville", label: "Ville" },
    { key: "code_uo_p5_p7", label: "Code UO P5/P7" },
    { key: "code_uo_bis", label: "Code UO (bis)" },
    { key: "code_uo_site_associe", label: "Code UO site associé" },
    { key: "groupe_eval", label: "Groupe EVAL" },
    { key: "groupe_phare", label: "Groupe PhaRe" },
  ];

  // Count UOs per responsable for the replace dialog
  const uoCountByResponsable = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      const name = d.responsable_administratif?.trim();
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [data]);

  const handleImportMatricules = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: false });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false });

      const normalize = (s: string) => (s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-'']/g, " ");

      const findColumn = (row: Record<string, string>, patterns: string[]) => {
        for (const key of Object.keys(row)) {
          const nk = normalize(key);
          if (patterns.some(p => nk.includes(p))) return key;
        }
        return null;
      };

      if (rows.length === 0) {
        toast({ title: "Erreur", description: "Le fichier est vide.", variant: "destructive" });
        if (matriculeInputRef.current) matriculeInputRef.current.value = "";
        return;
      }

      // Find columns by exact header name first, then by patterns
      const headers = Object.keys(rows[0]);
      const findExactColumn = (patterns: string[]) => {
        for (const key of headers) {
          const nk = normalize(key);
          if (patterns.some(p => nk === p)) return key;
        }
        // Fallback to includes
        for (const key of headers) {
          const nk = normalize(key);
          if (patterns.some(p => nk.includes(p))) return key;
        }
        return null;
      };

      const codeUoCol = findExactColumn(["code uo", "code_uo"]);
      const matriculeCol = findExactColumn(["matricule responsable", "matricule"]);
      const dateDebutCol = findExactColumn(["date debut responsable", "date debut", "date_debut"]);
      const prenomNomCol = findExactColumn(["responsable administratif", "prenom nom", "prenom_nom", "nom"]);

      console.log("Colonnes détectées:", { codeUoCol, matriculeCol, dateDebutCol, prenomNomCol });

      if (!codeUoCol) {
        toast({ title: "Erreur", description: `Colonne 'Code UO' introuvable. Colonnes : ${Object.keys(rows[0]).join(", ")}`, variant: "destructive" });
        if (matriculeInputRef.current) matriculeInputRef.current.value = "";
        return;
      }

      // Build a map: code_uo -> { matricule, date_debut, prenom_nom }
      const excelMap = new Map<string, { matricule: string; date_debut: string; prenom_nom: string }>();
      for (const row of rows) {
        const code = (row[codeUoCol] || "").toString().trim();
        if (!code) continue;
        const matricule = matriculeCol ? (row[matriculeCol] || "").toString().trim() : "";
        const dateRaw = dateDebutCol ? (row[dateDebutCol] || "").toString().trim() : "";
        const prenomNom = prenomNomCol ? (row[prenomNomCol] || "").toString().trim() : "";
        // Only add if there's at least some data to update
        if (matricule || dateRaw || prenomNom) {
          // Convert date from M/D/YY or other formats to DD/MM/YYYY
          let dateFormatted = dateRaw;
          if (dateRaw) {
            try {
              // Try parsing as M/D/YY (US format from Excel)
              const parts = dateRaw.split("/");
              if (parts.length === 3) {
                const month = parts[0].padStart(2, "0");
                const day = parts[1].padStart(2, "0");
                let year = parts[2];
                if (year.length === 2) year = (parseInt(year) > 50 ? "19" : "20") + year;
                dateFormatted = `${day}/${month}/${year}`;
              }
            } catch { dateFormatted = dateRaw; }
          }
          excelMap.set(code, { matricule, date_debut: dateFormatted, prenom_nom: prenomNom });
        }
      }

      console.log(`${excelMap.size} entrées avec données dans le fichier Excel`);

      const matches = data
        .filter(d => d.code_uo && excelMap.has(d.code_uo.trim()))
        .map(d => {
          const info = excelMap.get(d.code_uo.trim())!;
          return {
            code_uo: d.code_uo,
            responsable: info.prenom_nom || d.responsable_administratif || "",
            matricule: info.matricule,
            date_debut: info.date_debut,
            id: d.id || "",
          };
        });

      console.log(`${matches.length} correspondances trouvées sur ${rows.length} lignes`);

      if (matches.length === 0) {
        const sampleExcel = Array.from(excelMap.keys()).slice(0, 5).join(", ");
        const sampleUO = data.slice(0, 5).map(d => d.code_uo).join(", ");
        toast({ title: "Aucune correspondance", description: `Codes Excel: ${sampleExcel} | Codes UO: ${sampleUO}`, variant: "destructive" });
        if (matriculeInputRef.current) matriculeInputRef.current.value = "";
        return;
      }

      setMatriculePreview({ matches, total: rows.length });
      setIsMatriculeConfirmOpen(true);
    } catch (err) {
      console.error("Erreur import:", err);
      toast({ title: "Erreur", description: "Impossible de lire le fichier.", variant: "destructive" });
    }
    if (matriculeInputRef.current) matriculeInputRef.current.value = "";
  };

  const handleConfirmImportMatricules = async () => {
    if (!matriculePreview) return;
    setIsImportingMatricules(true);
    setIsMatriculeConfirmOpen(false);
    let updated = 0;
    let errors = 0;
    const { matches } = matriculePreview;

    for (let i = 0; i < matches.length; i += 50) {
      const batch = matches.slice(i, i + 50);
      for (const item of batch) {
        if (!item.id) continue;
        const updateData: Record<string, string> = {};
        if (item.matricule) updateData.matricule_responsable = item.matricule;
        if (item.date_debut) updateData.date_debut_responsable = item.date_debut;
        if (item.responsable) updateData.responsable_administratif = item.responsable;
        if (Object.keys(updateData).length === 0) continue;
        const { error } = await supabase.from("uo").update(updateData as any).eq("id", item.id);
        if (error) errors++;
        else updated++;
      }
    }

    toast({
      title: "Import terminé",
      description: `${updated} UO mise(s) à jour.${errors > 0 ? ` ${errors} erreur(s).` : ""} (${matriculePreview.total} lignes dans le fichier)`,
    });
    setMatriculePreview(null);
    setIsImportingMatricules(false);
    fetchData();
  };

  const handleExportZ0B = (onlySelected: boolean) => {
    let items = data;
    if (onlySelected && selectedItems.size > 0) {
      items = data.filter((d, idx) => {
        const itemId = `${d.code_uo}-${idx}`;
        return selectedItems.has(itemId);
      });
    }
    exportZ0B(items);
    toast({ title: "Export Resp.", description: `${items.length} UO exportée(s).` });
  };

  return (
    <>
      <DataTableWithPagination
        title="UO (Unités Organisationnelles)"
        data={data}
        columns={columns}
        searchFields={["code_uo", "libelle_long", "libelle_court", "code_uo_mere", "type", "statut", "ville", "responsable_administratif"]}
        externalFilter={showNoResponsable ? (item: UOItem) => {
          if (!noResponsableDate) return !item.responsable_administratif?.trim();
          // Show UOs where date_fin_responsable > chosen date
          if (!item.date_fin_responsable?.trim()) return false;
          const match = item.date_fin_responsable.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (!match) return false;
          const dateFin = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
          return dateFin < noResponsableDate;
        } : undefined}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        showActions={isAdmin}
        renderExpandedContent={renderExpandedContent}
        onExport={() => {
          const filteredForExport = showNoResponsable
            ? data.filter((item) => {
                if (!noResponsableDate) return !item.responsable_administratif?.trim();
                if (!item.date_fin_responsable?.trim()) return false;
                const match = item.date_fin_responsable.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (!match) return false;
                const dateFin = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
                return dateFin < noResponsableDate;
              })
            : data;
          exportPageToExcel(filteredForExport, "UO", "UO");
        }}
        showHighlighted={true}
        highlightedField="is_highlighted"
        showSelection={true}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        extraToolbarContent={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 whitespace-nowrap"
              onClick={() => handleExportZ0B(false)}
            >
              <Download className="h-4 w-4" />
               Export Resp. (tout)
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 whitespace-nowrap"
              onClick={() => handleExportZ0B(true)}
              disabled={selectedItems.size === 0}
            >
              <Download className="h-4 w-4" />
              Export Resp. ({selectedItems.size} sél.)
            </Button>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant={showNoResponsable ? "default" : "outline"}
                  className="h-9 gap-1.5 whitespace-nowrap"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {showNoResponsable
                    ? noResponsableDate
                      ? `Date fin < ${format(noResponsableDate, "dd/MM/yyyy")}`
                      : "UO sans responsable"
                    : "UO sans responsable"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 space-y-2" align="start">
                <p className="text-sm font-medium">Choisir une date de référence</p>
                <p className="text-xs text-muted-foreground">
                  Affiche les UO dont la date fin responsable est antérieure à la date choisie.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNoResponsableDate(undefined);
                      setShowNoResponsable(true);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Sans responsable
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNoResponsableDate(new Date());
                      setShowNoResponsable(true);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Aujourd'hui
                  </Button>
                  {showNoResponsable && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setShowNoResponsable(false);
                        setNoResponsableDate(undefined);
                        setIsDatePickerOpen(false);
                      }}
                    >
                      Réinitialiser
                    </Button>
                  )}
                </div>
                <Calendar
                  mode="single"
                  selected={noResponsableDate}
                  onSelect={(date) => {
                    if (date) {
                      setNoResponsableDate(date);
                      setShowNoResponsable(true);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  locale={fr}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 whitespace-nowrap"
              onClick={() => setIsReplaceDialogOpen(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Remplacer un responsable
            </Button>
            <input
              ref={matriculeInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportMatricules}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 whitespace-nowrap"
              onClick={() => matriculeInputRef.current?.click()}
              disabled={isImportingMatricules}
            >
              <Upload className="h-4 w-4" />
              {isImportingMatricules ? "Import en cours…" : "Importer matricules"}
            </Button>
          </div>
        }
      />

      {/* Edit / Add dialog - visible only when authenticated as admin */}
      <Dialog open={isDialogOpen && isAdmin} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Modifier l'élément" : "Ajouter un nouvel élément"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(({ key, label }) => {
                  const isDateField = key === "date_debut_responsable" || key === "date_fin_responsable";
                  const isResponsable = key === "responsable_administratif";

                  if (isDateField) {
                    const rawVal = String(editingItem[key] || "");
                    let selectedDate: Date | undefined;
                    if (rawVal) {
                      // Try ISO then DD/MM/YYYY
                      const isoMatch = rawVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
                      if (isoMatch) {
                        selectedDate = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
                      } else {
                        const frMatch = rawVal.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
                        if (frMatch) selectedDate = new Date(Number(frMatch[3]), Number(frMatch[2]) - 1, Number(frMatch[1]));
                      }
                    }

                    return (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="text-xs">{label}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal text-sm h-10",
                                !rawVal && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Choisir une date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                if (date) {
                                  handleInputChange(key, format(date, "yyyy-MM-dd"));
                                } else {
                                  handleInputChange(key, "");
                                }
                              }}
                              locale={fr}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-xs">{label}</Label>
                      {isResponsable ? (
                        <AutocompleteInput
                          id={key}
                          value={String(editingItem[key] || "")}
                          onChange={(val) => handleInputChange(key, val)}
                          suggestions={responsableNames}
                          className="text-sm"
                        />
                      ) : (
                        <Input
                          id={key}
                          value={String(editingItem[key] || "")}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk replace responsable dialog */}
      <Dialog open={isReplaceDialogOpen} onOpenChange={setIsReplaceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Remplacer un responsable administratif</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remplacez un nom de responsable administratif par un nouveau nom sur toutes les UO concernées.
          </p>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Ancien nom à remplacer</Label>
              <AutocompleteInput
                value={replaceOldName}
                onChange={setReplaceOldName}
                suggestions={responsableNames}
                className="text-sm"
              />
              {replaceOldName && uoCountByResponsable[replaceOldName.trim()] && (
                <p className="text-xs text-muted-foreground">
                  {uoCountByResponsable[replaceOldName.trim()]} UO avec ce responsable
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Nouveau nom</Label>
              <AutocompleteInput
                value={replaceNewName}
                onChange={setReplaceNewName}
                suggestions={responsableNames}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplaceDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleBulkReplace} disabled={isReplacing}>
              {isReplacing ? "Remplacement en cours…" : "Remplacer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Matricule import confirmation dialog */}
      <Dialog open={isMatriculeConfirmOpen} onOpenChange={(open) => { if (!open) { setIsMatriculeConfirmOpen(false); setMatriculePreview(null); } }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmer l'import des matricules</DialogTitle>
          </DialogHeader>
          {matriculePreview && (
            <div className="space-y-3">
               <p className="text-sm text-muted-foreground">
                <strong>{matriculePreview.total}</strong> lignes dans le fichier — <strong>{matriculePreview.matches.length}</strong> correspondance(s) par Code UO.
              </p>
              {matriculePreview.matches.length > 0 && (
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-2">Code UO</th>
                        <th className="text-left p-2">Responsable</th>
                        <th className="text-left p-2">Matricule</th>
                        <th className="text-left p-2">Date début</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matriculePreview.matches.map((m, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 font-mono">{m.code_uo}</td>
                          <td className="p-2">{m.responsable}</td>
                          <td className="p-2 font-mono">{m.matricule}</td>
                          <td className="p-2">{m.date_debut}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsMatriculeConfirmOpen(false); setMatriculePreview(null); }}>Annuler</Button>
            <Button onClick={handleConfirmImportMatricules} disabled={!matriculePreview || matriculePreview.matches.length === 0}>
              Mettre à jour {matriculePreview?.matches.length || 0} UO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UOPage;
