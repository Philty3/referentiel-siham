import { useState, useEffect } from "react";
import { exportPageToExcel } from "@/lib/exportToExcel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/supabaseUtils";

const fields = [
  { key: "code_uai", label: "Code UAI" }, { key: "nom_etablissement", label: "Nom" }, { key: "type_etablissement", label: "Type" },
  { key: "adresse", label: "Adresse" }, { key: "code_postal", label: "Code postal" }, { key: "ville", label: "Ville" },
  { key: "academie", label: "Académie" }, { key: "telephone", label: "Téléphone" }, { key: "email", label: "Email" },
] as const;
type F = typeof fields[number]["key"];
type Item = { id?: string; code_up_cite?: boolean } & Record<F, string>;
const emptyItem = { ...Object.fromEntries(fields.map(f => [f.key, ""])), code_up_cite: false } as unknown as Item;

const Etablissements = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await fetchAllRows("etablissements", "code_uai");
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else setData((rows || []).map(r => { const item: any = { id: r.id, code_up_cite: !!(r as any).code_up_cite }; fields.forEach(f => item[f.key] = (r as any)[f.key] || ""); return item; }));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => { setEditingItem({ ...emptyItem }); setEditingIndex(null); setIsDialogOpen(true); };
  const handleEdit = (item: Item, i: number) => { setEditingItem({ ...item }); setEditingIndex(i); setIsDialogOpen(true); };
  const handleSave = async () => {
    if (!editingItem) return; const { id, ...payload } = editingItem;
    if (editingIndex !== null && id) {
      const { error } = await supabase.from("etablissements").update(payload as any).eq("id", id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Modifications enregistrées" });
    } else {
      const { error } = await supabase.from("etablissements").insert(payload as any);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Élément ajouté" });
    }
    setIsDialogOpen(false); setEditingItem(null); setEditingIndex(null); fetchData();
  };
  const handleDelete = async (i: number) => {
    const item = data[i]; if (!item.id) return;
    const { error } = await supabase.from("etablissements").delete().eq("id", item.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Élément supprimé", variant: "destructive" }); fetchData();
  };

  return (
    <>
      <DataTableWithPagination title="Établissements" data={data}
        columns={[{ key: "code_uai", label: "Code UAI", width: "w-[100px]" }, { key: "nom_etablissement", label: "Nom", width: "w-[200px]" }, { key: "type_etablissement", label: "Type", width: "w-[150px]" }, { key: "ville", label: "Ville", width: "w-[120px]" }]}
        searchFields={["code_uai", "nom_etablissement", "type_etablissement", "ville", "academie"]}
        loading={loading} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd}
        showUpCiteIcon
        onExport={() => exportPageToExcel(data, "Établissements", "Etablissements")}
        renderExpandedContent={(row: Item) => (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">{fields.map(f => (<div key={f.key}><p className="font-semibold text-foreground mb-1">{f.label}:</p><p className="text-muted-foreground whitespace-pre-wrap">{row[f.key]}</p></div>))}</div>)} />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingIndex !== null ? "Modifier" : "Ajouter"}</DialogTitle></DialogHeader>
          {editingItem && (<div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="code_up_cite" checked={!!editingItem.code_up_cite} onCheckedChange={(checked) => setEditingItem({ ...editingItem, code_up_cite: !!checked })} />
              <Label htmlFor="code_up_cite" className="text-sm font-medium">Code UP Cité</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (<div key={f.key} className="space-y-2"><Label htmlFor={f.key} className="text-xs">{f.label}</Label>
              <Input id={f.key} value={editingItem[f.key] || ""} onChange={(e) => setEditingItem({ ...editingItem, [f.key]: e.target.value })} className="text-sm" /></div>))}
          </div></div>)}
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button onClick={handleSave}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Etablissements;