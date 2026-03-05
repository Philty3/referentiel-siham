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
}

const emptyItem: UOItem = {
  code_uo: "", libelle_long: "", libelle_court: "", code_uo_mere: "",
  type: "", niveau: "", code_uai: "", statut: "",
  responsable_composante: "", responsable_administratif: "",
  numero_voie: "", complement_adresse: "", adresse: "", code_postal: "", ville: "",
  code_uo_p5_p7: "", code_uo_bis: "", code_uo_site_associe: "",
  groupe_eval: "", groupe_phare: "",
};

const UOPage = () => {
  const [data, setData] = useState<UOItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<UOItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

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

  const columns = [
    { key: "code_uo", label: "Code UO", width: "w-[150px]" },
    { key: "libelle_court", label: "Libellé court", width: "w-[180px]" },
    { key: "libelle_long", label: "Libellé long", width: "w-[250px]" },
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

  return (
    <>
      <DataTableWithPagination
        title="UO (Unités Organisationnelles)"
        data={data}
        columns={columns}
        searchFields={["code_uo", "libelle_long", "libelle_court", "code_uo_mere", "type", "statut", "ville"]}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        renderExpandedContent={renderExpandedContent}
        onExport={() => exportPageToExcel(data, "UO", "UO")}
      />

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
                    <Input
                      id={key}
                      value={editingItem[key] || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="text-sm"
                    />
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
    </>
  );
};

export default UOPage;
