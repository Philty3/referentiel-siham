import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import { supabase } from "@/integrations/supabase/client";

const fields = [
  { key: "code", label: "Code" }, { key: "libelle_court", label: "Libellé court" }, { key: "libelle_long", label: "Libellé long" },
  { key: "libelle_long_bis", label: "Libellé long (bis)" }, { key: "position_statutaire", label: "Position statutaire" },
  { key: "temoin_position_entree_sortie", label: "Témoin position entrée/sortie" },
  { key: "temoin_lien_enfant_obligatoire", label: "Témoin lien enfant obligatoire" },
  { key: "tem_exclusion_inclusion_reglem", label: "Tém exclusion/inclusion réglem." },
  { key: "date_debut_validite", label: "Date début validité" }, { key: "date_fin_validite", label: "Date fin validité" },
] as const;
type F = typeof fields[number]["key"];
type Item = { id?: string } & Record<F, string>;
const emptyItem = Object.fromEntries(fields.map(f => [f.key, ""])) as unknown as Item;

const Reference3 = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase.from("positions").select("*").order("code");
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else setData((rows || []).map(r => { const item: any = { id: r.id }; fields.forEach(f => item[f.key] = (r as any)[f.key] || ""); return item; }));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => { setEditingItem({ ...emptyItem }); setEditingIndex(null); setIsDialogOpen(true); };
  const handleEdit = (item: Item, i: number) => { setEditingItem({ ...item }); setEditingIndex(i); setIsDialogOpen(true); };
  const handleSave = async () => {
    if (!editingItem) return; const { id, ...payload } = editingItem;
    if (editingIndex !== null && id) {
      const { error } = await supabase.from("positions").update(payload).eq("id", id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Modifications enregistrées" });
    } else {
      const { error } = await supabase.from("positions").insert(payload);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Élément ajouté" });
    }
    setIsDialogOpen(false); setEditingItem(null); setEditingIndex(null); fetchData();
  };
  const handleDelete = async (i: number) => {
    const item = data[i]; if (!item.id) return;
    const { error } = await supabase.from("positions").delete().eq("id", item.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Élément supprimé", variant: "destructive" }); fetchData();
  };

  return (
    <>
      <DataTableWithPagination title="Positions" data={data}
        columns={[{ key: "code", label: "Code", width: "w-[150px]" }, { key: "libelle_court", label: "Libellé court", width: "w-[180px]" }, { key: "libelle_long", label: "Libellé long", width: "w-[250px]" }, { key: "position_statutaire", label: "Position statutaire", width: "w-[160px]" }]}
        searchFields={["code", "libelle_court", "libelle_long", "position_statutaire"]}
        loading={loading} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd}
        renderExpandedContent={(row: Item) => (<div className="grid grid-cols-2 gap-4 text-xs">{fields.map(f => (<div key={f.key}><p className="font-semibold text-foreground mb-1">{f.label}:</p><p className="text-muted-foreground whitespace-pre-wrap">{row[f.key]}</p></div>))}</div>)} />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingIndex !== null ? "Modifier" : "Ajouter"}</DialogTitle></DialogHeader>
          {editingItem && (<div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-4">
            {fields.map(f => (<div key={f.key} className="space-y-2"><Label htmlFor={f.key} className="text-xs">{f.label}</Label>
              <Input id={f.key} value={editingItem[f.key] || ""} onChange={(e) => setEditingItem({ ...editingItem, [f.key]: e.target.value })} className="text-sm" /></div>))}
          </div></div>)}
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button onClick={handleSave}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Reference3;
