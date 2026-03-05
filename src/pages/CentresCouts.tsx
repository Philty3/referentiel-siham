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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const fields = [
  { key: "affectation_generale", label: "Affectation générale" },
  { key: "composante_direction", label: "Composante / Direction" },
  { key: "uo_affectation_principale", label: "UO - Affectation principale" },
  { key: "code_uo_affectation", label: "Code UO - Affectation principale" },
  { key: "population", label: "Population" },
  { key: "code_centre_cout", label: "Centre de coût (code)" },
  { key: "designation", label: "Désignation" },
  { key: "centre_financier", label: "Centre financier" },
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
  const [uoOptions, setUoOptions] = useState<string[]>([]);
  const [uoRows, setUoRows] = useState<{ libelle_long: string; code_uo: string }[]>([]);
  const [openCombobox, setOpenCombobox] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const comboboxFields = ["affectation_generale", "composante_direction", "uo_affectation_principale"];

  useEffect(() => {
    fetchAllRows("uo", "libelle_long").then(({ data: rows }) => {
      if (rows) {
        const allRows = rows.map((r: any) => ({ libelle_long: r.libelle_long || "", code_uo: r.code_uo || "" })).filter(r => r.libelle_long);
        setUoRows(allRows);
        const labels = [...new Set(allRows.map(r => r.libelle_long))].sort();
        setUoOptions(labels as string[]);
      }
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await fetchAllRows("centres_couts", "code_centre_cout");
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
          { key: "affectation_generale", label: "Affectation générale", width: "w-[200px]" },
          { key: "composante_direction", label: "Composante / Direction", width: "w-[220px]" },
          { key: "code_centre_cout", label: "Code CC", width: "w-[140px]" },
          { key: "designation", label: "Désignation", width: "w-[200px]" },
          { key: "population", label: "Population", width: "w-[100px]" },
          { key: "centre_financier", label: "Centre financier", width: "w-[130px]" },
        ]}
        searchFields={["affectation_generale", "composante_direction", "uo_affectation_principale", "code_uo_affectation", "population", "code_centre_cout", "designation", "centre_financier"]}
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
            {fields.map(f => {
              if (comboboxFields.includes(f.key)) {
                return (
                  <div key={f.key} className="space-y-2">
                    <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
                    <Popover open={openCombobox[f.key] || false} onOpenChange={(open) => setOpenCombobox(prev => ({ ...prev, [f.key]: open }))}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between text-sm font-normal h-9 truncate">
                          <span className="truncate">{editingItem[f.key] || "Sélectionner..."}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Rechercher une UO..." />
                          <CommandList className="max-h-[200px]">
                            <CommandEmpty>Aucune UO trouvée.</CommandEmpty>
                            <CommandGroup>
                              {uoOptions.map(opt => (
                              <CommandItem key={opt} value={opt} onSelect={(val) => {
                                  const updates: Partial<Item> = { [f.key]: val };
                                  if (f.key === "uo_affectation_principale") {
                                    const match = uoRows.find(r => r.libelle_long === val);
                                    if (match) updates.code_uo_affectation = match.code_uo;
                                  }
                                  setEditingItem({ ...editingItem, ...updates });
                                  setOpenCombobox(prev => ({ ...prev, [f.key]: false }));
                                }}>
                                  <Check className={cn("mr-2 h-4 w-4", editingItem[f.key] === opt ? "opacity-100" : "opacity-0")} />
                                  <span className="truncate">{opt}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              }
              return (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
                  <Input id={f.key} value={editingItem[f.key] || ""} onChange={(e) => setEditingItem({ ...editingItem, [f.key]: e.target.value })} className="text-sm" />
                </div>
              );
            })}
          </div></div>)}
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button onClick={handleSave}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default CentresCouts;
