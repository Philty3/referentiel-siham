import { useState, useEffect, useMemo, useRef } from "react";
import { exportPageToExcel } from "@/lib/exportToExcel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/supabaseUtils";
import { importUOWithStyles } from "@/lib/importUOWithStyles";
import { RefreshCw, UserX } from "lucide-react";

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
  const [filterNoResp, setFilterNoResp] = useState(false);

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
    setEditingItem({ ...emptyItem });
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: UOItem, index: number) => {
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

  const noRespCount = useMemo(() => data.filter(d => !d.responsable_administratif || d.responsable_administratif.trim() === "").length, [data]);
  const displayedData = filterNoResp ? data.filter(d => !d.responsable_administratif || d.responsable_administratif.trim() === "") : data;

  return (
    <>
      <DataTableWithPagination
        title="UO (Unités Organisationnelles)"
        data={displayedData}
        columns={columns}
        searchFields={["code_uo", "libelle_long", "libelle_court", "code_uo_mere", "type", "statut", "ville", "responsable_administratif"]}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        renderExpandedContent={renderExpandedContent}
        onExport={() => exportPageToExcel(data, "UO", "UO")}
        showHighlighted={true}
        highlightedField="is_highlighted"
        extraToolbarContent={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filterNoResp ? "default" : "outline"}
              className="h-9 gap-1.5 whitespace-nowrap"
              onClick={() => setFilterNoResp(prev => !prev)}
            >
              <UserX className="h-4 w-4" />
              UO sans responsable ({noRespCount})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 whitespace-nowrap"
              onClick={() => setIsReplaceDialogOpen(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Remplacer un responsable
            </Button>
          </div>
        }
      />

      {/* Edit / Add dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Modifier l'élément" : "Ajouter un nouvel élément"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-xs">{label}</Label>
                    {key === "responsable_administratif" ? (
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
                ))}
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
    </>
  );
};

export default UOPage;
