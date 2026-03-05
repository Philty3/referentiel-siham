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

const fields = [
  { key: "code", label: "Code" },
  { key: "libelle_long", label: "Libellé long" },
  { key: "libelle_court", label: "Libellé court" },
  { key: "date_debut", label: "Date de début" },
  { key: "date_fin", label: "Date de fin" },
  { key: "population", label: "Population" },
  { key: "cas_usage", label: "Cas d'usage" },
  { key: "population_particuliere", label: "Population particulière" },
  { key: "texte", label: "Texte" },
  { key: "commentaires", label: "Commentaires" },
] as const;
type F = typeof fields[number]["key"];
type Item = { id?: string } & Record<F, string>;
const emptyItem = Object.fromEntries(fields.map(f => [f.key, ""])) as unknown as Item;

const CentresCouts = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await fetchAllRows("centres_couts", "code");
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
      const { error } = await supabase.from("centres_couts" as any).update(payload).eq("id", id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Modifications enregistrées" });
    } else {
      const { error } = await supabase.from("centres_couts" as any).insert(payload);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Élément ajouté" });
    }
    setIsDialogOpen(false); setEditingItem(null); setEditingIndex(null); fetchData();
  };
  const handleDelete = async (i: number) => {
    const item = data[i]; if (!item.id) return;
    const { error } = await supabase.from("centres_couts" as any).delete().eq("id", item.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Élément supprimé", variant: "destructive" }); fetchData();
  };

  return (
    <>
      <DataTableWithPagination title="Centres de coûts" data={data}
        columns={[
          { key: "code", label: "Code", width: "w-[100px]" },
          { key: "libelle_long", label: "Libellé long", width: "w-[250px]" },
          { key: "libelle_court", label: "Libellé court", width: "w-[180px]" },
          { key: "date_debut", label: "Date début", width: "w-[120px]" },
          { key: "date_fin", label: "Date fin", width: "w-[120px]" },
          { key: "population", label: "Population", width: "w-[100px]" },
        ]}
        searchFields={fields.map(f => f.key)}
        loading={loading} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd}
        onExport={() => exportPageToExcel(data, "Centres de coûts", "Centres_couts", [])}
        renderExpandedContent={(row: Item) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {fields.map(f => (
              <div key={f.key}>
                <p className="font-semibold text-foreground mb-1">{f.label}:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{row[f.key]}</p>
              </div>
            ))}
          </div>
        )} />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingIndex !== null ? "Modifier" : "Ajouter"}</DialogTitle></DialogHeader>
          {editingItem && (<div className="grid gap-4 py-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key} className={`space-y-2 ${["cas_usage", "texte"].includes(f.key) ? "sm:col-span-2" : ""}`}>
                <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
                {["cas_usage", "texte", "commentaires"].includes(f.key) ? (
                  <textarea id={f.key} value={editingItem[f.key] || ""} onChange={(e) => setEditingItem({ ...editingItem, [f.key]: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                ) : (
                  <Input id={f.key} value={editingItem[f.key] || ""} onChange={(e) => setEditingItem({ ...editingItem, [f.key]: e.target.value })} className="text-sm" />
                )}
              </div>
            ))}
          </div></div>)}
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button onClick={handleSave}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default CentresCouts;
