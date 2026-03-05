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
  { key: "code", label: "Code" }, { key: "libelle", label: "Libellé" }, { key: "libelle_complementaire", label: "Libellé complémentaire" },
  { key: "type_arrete_decision", label: "Type arrêté/décision" }, { key: "type_population", label: "Type population" },
  { key: "numero_ordre", label: "N° ordre" }, { key: "code_visa", label: "Code visa" }, { key: "visa", label: "Visa" },
  { key: "type_population_2", label: "Type population (2)" }, { key: "numero_ordre_2", label: "N° ordre (2)" },
  { key: "code_article", label: "Code article" }, { key: "article", label: "Article" },
  { key: "processus", label: "Processus" }, { key: "octroi_renouvellement", label: "Octroi/Renouvellement" },
] as const;
type F = typeof fields[number]["key"];
type Item = { id?: string; code_up_cite?: boolean } & Record<F, string>;
const emptyItem = { ...Object.fromEntries(fields.map(f => [f.key, ""])), code_up_cite: false } as unknown as Item;

const Actes = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await fetchAllRows("actes", "code");
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
      const { error } = await supabase.from("actes").update(payload as any).eq("id", id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Modifications enregistrées" });
    } else {
      const { error } = await supabase.from("actes").insert(payload as any);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Élément ajouté" });
    }
    setIsDialogOpen(false); setEditingItem(null); setEditingIndex(null); fetchData();
  };
  const handleDelete = async (i: number) => {
    const item = data[i]; if (!item.id) return;
    const { error } = await supabase.from("actes").delete().eq("id", item.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Élément supprimé", variant: "destructive" }); fetchData();
  };

  return (
    <>
      <DataTableWithPagination title="Actes" data={data}
        columns={[{ key: "code", label: "Code", width: "w-[120px]" }, { key: "libelle", label: "Libellé", width: "w-[200px]" }, { key: "libelle_complementaire", label: "Libellé complémentaire", width: "w-[200px]" }, { key: "type_arrete_decision", label: "Type arrêté/décision", width: "w-[150px]" }]}
        searchFields={["code", "libelle", "libelle_complementaire", "type_arrete_decision"]}
        loading={loading} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd}
        showUpCiteIcon
        onExport={() => exportPageToExcel(data, "Actes", "Actes")}
        renderExpandedContent={(row: Item) => (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">{fields.map(f => (<div key={f.key}><p className="font-semibold text-foreground mb-1">{f.label}:</p><p className="text-muted-foreground whitespace-pre-wrap">{row[f.key]}</p></div>))}</div>)} />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
export default Actes;