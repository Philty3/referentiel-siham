import { useState, useEffect, useMemo } from "react";
import { exportPageToExcel } from "@/lib/exportToExcel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  { key: "commentaire", label: "Commentaire" },
] as const;
type F = typeof fields[number]["key"];
type Item = { id?: string } & Record<F, string>;
const emptyItem = Object.fromEntries(fields.map(f => [f.key, ""])) as unknown as Item;

type UoRow = { libelle_long: string; code_uo: string; code_uo_mere: string; niveau: string };

const CentresCouts = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uoRows, setUoRows] = useState<UoRow[]>([]);
  const [openCombobox, setOpenCombobox] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchAllRows("uo", "libelle_long").then(({ data: rows }) => {
      if (rows) {
        setUoRows(
          rows.map((r: any) => ({
            libelle_long: r.libelle_long || "",
            code_uo: r.code_uo || "",
            code_uo_mere: r.code_uo_mere || "",
            niveau: r.niveau || "",
          })).filter((r: UoRow) => r.libelle_long)
        );
      }
    });
  }, []);

  // Niveau 2 UOs for "Affectation générale"
  const niveau2Options = useMemo(() =>
    uoRows.filter(r => r.niveau === "Niveau 2").sort((a, b) => a.libelle_long.localeCompare(b.libelle_long)),
    [uoRows]
  );

  // Niveau 3 UOs filtered by selected Niveau 2 parent
  const niveau3Options = useMemo(() => {
    if (!editingItem?.affectation_generale) return [];
    const parentUo = uoRows.find(r => r.niveau === "Niveau 2" && r.libelle_long === editingItem.affectation_generale);
    if (!parentUo) return [];
    return uoRows
      .filter(r => r.niveau === "Niveau 3" && r.code_uo_mere === parentUo.code_uo)
      .sort((a, b) => a.libelle_long.localeCompare(b.libelle_long));
  }, [uoRows, editingItem?.affectation_generale]);

  // Niveau 4+ UOs filtered by selected Niveau 3 parent (descendants)
  const niveau4PlusOptions = useMemo(() => {
    if (!editingItem?.composante_direction) return [];
    const parentUo = uoRows.find(r => r.niveau === "Niveau 3" && r.libelle_long === editingItem.composante_direction);
    if (!parentUo) return [];

    // Find all descendants of the Niveau 3 UO (levels 4, 5, 6...)
    const descendants: UoRow[] = [];
    const findDescendants = (parentCode: string) => {
      const children = uoRows.filter(r => r.code_uo_mere === parentCode && r.niveau !== "Niveau 2" && r.niveau !== "Niveau 3");
      children.forEach(child => {
        descendants.push(child);
        findDescendants(child.code_uo);
      });
    };
    findDescendants(parentUo.code_uo);

    // Also include the Niveau 3 UO itself (some centres de coûts point directly to the composante)
    descendants.push(parentUo);

    return descendants.sort((a, b) => a.libelle_long.localeCompare(b.libelle_long));
  }, [uoRows, editingItem?.composante_direction]);

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

  const renderCombobox = (fieldKey: F, label: string, options: UoRow[], onSelect: (val: string, uo: UoRow) => void) => {
    if (!editingItem) return null;
    return (
      <div className="space-y-2">
        <Label className="text-xs">{label}</Label>
        <Popover open={openCombobox[fieldKey] || false} onOpenChange={(open) => setOpenCombobox(prev => ({ ...prev, [fieldKey]: open }))}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-full justify-between text-sm font-normal h-9 truncate">
              <span className="truncate">{editingItem[fieldKey] || "Sélectionner..."}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[450px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher..." />
              <CommandList className="max-h-[200px]">
                <CommandEmpty>Aucun résultat.</CommandEmpty>
                <CommandGroup>
                  {options.map(uo => (
                    <CommandItem key={uo.code_uo} value={uo.libelle_long} onSelect={() => {
                      onSelect(uo.libelle_long, uo);
                      setOpenCombobox(prev => ({ ...prev, [fieldKey]: false }));
                    }}>
                      <Check className={cn("mr-2 h-4 w-4", editingItem[fieldKey] === uo.libelle_long ? "opacity-100" : "opacity-0")} />
                      <span className="truncate">{uo.libelle_long}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const renderEditDialog = () => {
    if (!editingItem) return null;
    return (
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Affectation générale - Niveau 2 only */}
          {renderCombobox("affectation_generale", "Affectation générale", niveau2Options, (val) => {
            setEditingItem({ ...editingItem, affectation_generale: val, composante_direction: "", uo_affectation_principale: "", code_uo_affectation: "" });
          })}

          {/* Composante / Direction - Niveau 3 under selected Niveau 2 */}
          {renderCombobox("composante_direction", "Composante / Direction", niveau3Options, (val) => {
            setEditingItem({ ...editingItem, composante_direction: val, uo_affectation_principale: "", code_uo_affectation: "" });
          })}

          {/* UO Affectation principale - Niveau 4+ under selected Niveau 3 */}
          {renderCombobox("uo_affectation_principale", "UO - Affectation principale", niveau4PlusOptions, (val, uo) => {
            setEditingItem({ ...editingItem, uo_affectation_principale: val, code_uo_affectation: uo.code_uo });
          })}

          {/* Code UO - read only, auto-filled */}
          <div className="space-y-2">
            <Label className="text-xs">Code UO - Affectation principale</Label>
            <Input value={editingItem.code_uo_affectation || ""} readOnly className="text-sm bg-muted" />
          </div>

          {/* Remaining simple fields */}
          {(["population", "code_centre_cout", "designation", "centre_financier"] as F[]).map(key => {
            const f = fields.find(fi => fi.key === key)!;
            return (
              <div key={key} className="space-y-2">
                <Label className="text-xs">{f.label}</Label>
                <Input value={editingItem[key] || ""} onChange={e => setEditingItem({ ...editingItem, [key]: e.target.value })} className="text-sm" />
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Commentaire</Label>
          <Textarea value={editingItem.commentaire || ""} onChange={e => setEditingItem({ ...editingItem, commentaire: e.target.value })} className="text-sm" rows={3} />
        </div>
      </div>
    );
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
          {renderEditDialog()}
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button onClick={handleSave}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default CentresCouts;
