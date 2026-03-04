import { useState, useEffect } from "react";
import { exportPageToExcel } from "@/lib/exportToExcel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/supabaseUtils";

interface Vacataire { id?: string;
  code_siham: string; categorie_siham: string; libelle_court_siham: string; libelle_long_siham: string;
  date_deb: string; date_fin: string; references_reglementaires: string; cas_utilisation: string;
  permanent_temporaire: string; regle_durees: string; type_contrat: string; cat_fp: string;
  sous_categorie: string; obligations_statutaires_enseignement: string; bibliotheque_actes: string;
  infos_complementaires: string; mode_gestion_remuneration: string; grade_tg: string;
  pseudo_grade: string; echelon: string; indice_brut_majore_force: string; situation_statutaire: string;
  regime_securite_sociale: string; regime_retraite: string; code_libelle_harpege: string;
  rg_pour_rdd: string; code_cisirh: string; libelle_cisirh: string;
}

const fields: { key: keyof Vacataire; label: string }[] = [
  { key: "code_siham", label: "Code Siham" }, { key: "categorie_siham", label: "Catégorie Siham" },
  { key: "libelle_court_siham", label: "Libellé court Siham" }, { key: "libelle_long_siham", label: "Libellé long Siham" },
  { key: "date_deb", label: "Date Deb" }, { key: "date_fin", label: "Date Fin" },
  { key: "references_reglementaires", label: "Références réglementaires" }, { key: "cas_utilisation", label: "Cas d'utilisation" },
  { key: "permanent_temporaire", label: "Permanent/temporaire" }, { key: "regle_durees", label: "Règle de durées" },
  { key: "type_contrat", label: "Type de contrat" }, { key: "cat_fp", label: "Cat. FP" },
  { key: "sous_categorie", label: "Sous catégorie" }, { key: "obligations_statutaires_enseignement", label: "Obligations stat. enseignement" },
  { key: "bibliotheque_actes", label: "Bibliothèque des actes" }, { key: "infos_complementaires", label: "Infos complémentaires" },
  { key: "mode_gestion_remuneration", label: "Mode gestion/rémunération" }, { key: "grade_tg", label: "Grade TG" },
  { key: "pseudo_grade", label: "Pseudo grade" }, { key: "echelon", label: "Echelon" },
  { key: "indice_brut_majore_force", label: "Indice brut/majoré forcé" }, { key: "situation_statutaire", label: "Situation statutaire" },
  { key: "regime_securite_sociale", label: "Régime sécu. sociale" }, { key: "regime_retraite", label: "Régime retraite" },
  { key: "code_libelle_harpege", label: "Code/Libellé Harpège" }, { key: "rg_pour_rdd", label: "RG pour RDD" },
  { key: "code_cisirh", label: "Code CISIRH" }, { key: "libelle_cisirh", label: "Libellé CISIRH" },
];
const emptyItem = Object.fromEntries(fields.map(f => [f.key, ""])) as unknown as Vacataire;

const Reference2 = () => {
  const [data, setData] = useState<Vacataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Vacataire | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await fetchAllRows("vacataires", "code_siham");
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else setData((rows || []).map(r => { const item: any = { id: r.id }; fields.forEach(f => item[f.key] = r[f.key as keyof typeof r] || ""); return item; }));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => { setEditingItem({ ...emptyItem }); setEditingIndex(null); setIsDialogOpen(true); };
  const handleEdit = (item: Vacataire, i: number) => { setEditingItem({ ...item }); setEditingIndex(i); setIsDialogOpen(true); };
  const handleSave = async () => {
    if (!editingItem) return; const { id, ...payload } = editingItem;
    if (editingIndex !== null && id) {
      const { error } = await supabase.from("vacataires").update(payload).eq("id", id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Modifications enregistrées" });
    } else {
      const { error } = await supabase.from("vacataires").insert(payload);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Élément ajouté" });
    }
    setIsDialogOpen(false); setEditingItem(null); setEditingIndex(null); fetchData();
  };
  const handleDelete = async (i: number) => {
    const item = data[i]; if (!item.id) return;
    const { error } = await supabase.from("vacataires").delete().eq("id", item.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Élément supprimé", variant: "destructive" }); fetchData();
  };
  const handleInputChange = (field: keyof Vacataire, value: string) => { if (editingItem) setEditingItem({ ...editingItem, [field]: value }); };

  const columns = [
    { key: "code_siham", label: "Code Siham", width: "w-[90px]" },
    { key: "categorie_siham", label: "Catégorie Siham", width: "w-[110px]" },
    { key: "libelle_court_siham", label: "Libellé court Siham", width: "w-[140px]" },
    { key: "libelle_long_siham", label: "Libellé long Siham", width: "w-[200px]" },
  ];
  const renderExpandedContent = (row: Vacataire) => (
    <div className="grid grid-cols-2 gap-4 text-xs">
      {fields.map(f => (<div key={f.key}><p className="font-semibold text-foreground mb-1">{f.label}:</p><p className="text-muted-foreground whitespace-pre-wrap">{row[f.key]}</p></div>))}
    </div>
  );

  return (
    <>
      <DataTableWithPagination title="Vacataires" data={data} columns={columns}
        searchFields={["code_siham", "categorie_siham", "libelle_court_siham", "libelle_long_siham", "code_cisirh"]}
        loading={loading} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} renderExpandedContent={renderExpandedContent}
        onExport={() => exportPageToExcel(data, "Vacataires", "Vacataires", ["date_deb", "date_fin"])} />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingIndex !== null ? "Modifier" : "Ajouter"}</DialogTitle></DialogHeader>
          {editingItem && (<div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-4">
            {fields.map(f => (<div key={f.key} className="space-y-2"><Label htmlFor={f.key} className="text-xs">{f.label}</Label>
              <Input id={f.key} value={editingItem[f.key] || ""} onChange={(e) => handleInputChange(f.key, e.target.value)} className="text-sm" /></div>))}
          </div></div>)}
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button onClick={handleSave}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Reference2;
