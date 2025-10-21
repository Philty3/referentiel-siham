import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";

interface Heberge {
  codeSiham: string;
  libelleCourtSiham: string;
  libelleLongSiham: string;
  referencesReglementaires: string;
  casUtilisation: string;
  bibliothequeActes: string;
  sousCategorie: string;
  infosComplementaires: string;
  gradeTG: string;
  codeCISIRH: string;
  libelleCISIRH: string;
}

const Heberges = () => {
  const [data, setData] = useState<Heberge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Heberge | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/heberges.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: Heberge[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          // Vérifier qu'il y a au moins un code Siham
          if (row && row[0]) {
            parsedData.push({
              codeSiham: String(row[0] || ""),
              libelleCourtSiham: String(row[1] || ""),
              libelleLongSiham: String(row[2] || ""),
              referencesReglementaires: String(row[3] || ""),
              casUtilisation: String(row[4] || ""),
              bibliothequeActes: String(row[5] || ""),
              sousCategorie: String(row[6] || ""),
              infosComplementaires: String(row[7] || ""),
              gradeTG: String(row[8] || ""),
              codeCISIRH: String(row[9] || ""),
              libelleCISIRH: String(row[10] || ""),
            });
          }
        }

        setData(parsedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    const newItem: Heberge = {
      codeSiham: "",
      libelleCourtSiham: "",
      libelleLongSiham: "",
      referencesReglementaires: "",
      casUtilisation: "",
      bibliothequeActes: "",
      sousCategorie: "",
      infosComplementaires: "",
      gradeTG: "",
      codeCISIRH: "",
      libelleCISIRH: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Heberge, index: number) => {
    setEditingItem({ ...item });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      if (editingIndex !== null) {
        const updatedData = [...data];
        updatedData[editingIndex] = editingItem;
        setData(updatedData);
        toast({
          title: "Modifications enregistrées",
          description: "L'élément a été mis à jour avec succès.",
        });
      } else {
        setData([...data, editingItem]);
        toast({
          title: "Élément ajouté",
          description: "Le nouvel élément a été créé avec succès.",
        });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setEditingIndex(null);
    }
  };

  const handleDelete = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
    toast({
      title: "Élément supprimé",
      description: "L'élément a été supprimé avec succès.",
      variant: "destructive",
    });
  };

  const handleInputChange = (field: keyof Heberge, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "codeSiham", label: "Code Siham", width: "w-[90px]" },
    { key: "libelleCourtSiham", label: "Libellé court Siham", width: "w-[140px]" },
    { key: "libelleLongSiham", label: "Libellé long Siham", width: "w-[200px]" },
    { key: "sousCategorie", label: "Sous catégorie", width: "w-[120px]" },
  ];

  const renderExpandedContent = (row: Heberge) => (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div>
        <p className="font-semibold text-foreground mb-1">Code Siham:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeSiham}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Libellé court Siham:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleCourtSiham}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Libellé long Siham:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleLongSiham}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Références réglementaires:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.referencesReglementaires}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Cas d'utilisation:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.casUtilisation}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Bibliothèque des actes:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.bibliothequeActes}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Sous catégorie:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.sousCategorie}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Informations complémentaires:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.infosComplementaires}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Grade TG:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.gradeTG}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Code CISIRH:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeCISIRH}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Libellé CISIRH:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleCISIRH}</p>
      </div>
    </div>
  );

  return (
    <>
      <DataTableWithPagination
        title="Hébergés"
        data={data}
        columns={columns}
        searchFields={["codeSiham", "libelleCourtSiham", "libelleLongSiham", "sousCategorie", "codeCISIRH", "libelleCISIRH"]}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        renderExpandedContent={renderExpandedContent}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Modifier l'élément" : "Ajouter un nouvel élément"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeSiham" className="text-xs">Code Siham</Label>
                  <Input id="codeSiham" value={editingItem.codeSiham} onChange={(e) => handleInputChange("codeSiham", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="libelleCourtSiham" className="text-xs">Libellé court Siham</Label>
                  <Input id="libelleCourtSiham" value={editingItem.libelleCourtSiham} onChange={(e) => handleInputChange("libelleCourtSiham", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleLongSiham" className="text-xs">Libellé long Siham</Label>
                <Input id="libelleLongSiham" value={editingItem.libelleLongSiham} onChange={(e) => handleInputChange("libelleLongSiham", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referencesReglementaires" className="text-xs">Références réglementaires</Label>
                <Input id="referencesReglementaires" value={editingItem.referencesReglementaires} onChange={(e) => handleInputChange("referencesReglementaires", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="casUtilisation" className="text-xs">Cas d'utilisation</Label>
                <Input id="casUtilisation" value={editingItem.casUtilisation} onChange={(e) => handleInputChange("casUtilisation", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bibliothequeActes" className="text-xs">Bibliothèque des actes</Label>
                <Input id="bibliothequeActes" value={editingItem.bibliothequeActes} onChange={(e) => handleInputChange("bibliothequeActes", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sousCategorie" className="text-xs">Sous catégorie</Label>
                <Input id="sousCategorie" value={editingItem.sousCategorie} onChange={(e) => handleInputChange("sousCategorie", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="infosComplementaires" className="text-xs">Informations complémentaires</Label>
                <Input id="infosComplementaires" value={editingItem.infosComplementaires} onChange={(e) => handleInputChange("infosComplementaires", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeTG" className="text-xs">Grade TG</Label>
                <Input id="gradeTG" value={editingItem.gradeTG} onChange={(e) => handleInputChange("gradeTG", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeCISIRH" className="text-xs">Code CISIRH</Label>
                  <Input id="codeCISIRH" value={editingItem.codeCISIRH} onChange={(e) => handleInputChange("codeCISIRH", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="libelleCISIRH" className="text-xs">Libellé CISIRH</Label>
                  <Input id="libelleCISIRH" value={editingItem.libelleCISIRH} onChange={(e) => handleInputChange("libelleCISIRH", e.target.value)} className="text-sm" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Heberges;
