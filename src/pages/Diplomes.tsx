import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";
import { formatExcelDate, validateDataDates, logDateValidationErrors } from "@/lib/dateValidator";

interface Diplome {
  code: string;
  libelle: string;
  libelleLong: string;
  echelleInternationale: string;
  modele: string;
  temExclusionInclusion: string;
  dateDebValidite: string;
  dateFinValidite: string;
}

const Diplomes = () => {
  const [data, setData] = useState<Diplome[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Diplome | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/diplomes.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: Diplome[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 6) {
            parsedData.push({
              code: String(row[0] || ""),
              libelle: String(row[1] || ""),
              libelleLong: String(row[2] || ""),
              echelleInternationale: String(row[3] || ""),
              modele: String(row[4] || ""),
              temExclusionInclusion: String(row[5] || ""),
              dateDebValidite: formatExcelDate(row[6]),
              dateFinValidite: formatExcelDate(row[7]),
            });
          }
        }

        setData(parsedData);
        
        // Valider les dates
        const dateErrors = validateDataDates(parsedData, ["dateDebValidite", "dateFinValidite"], "Diplômes");
        logDateValidationErrors(dateErrors);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    const newItem: Diplome = {
      code: "",
      libelle: "",
      libelleLong: "",
      echelleInternationale: "",
      modele: "",
      temExclusionInclusion: "",
      dateDebValidite: "",
      dateFinValidite: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Diplome, index: number) => {
    setEditingItem({ ...item });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      if (editingIndex !== null) {
        // Modification d'un élément existant
        const updatedData = [...data];
        updatedData[editingIndex] = editingItem;
        setData(updatedData);
        toast({
          title: "Modifications enregistrées",
          description: "L'élément a été mis à jour avec succès.",
        });
      } else {
        // Ajout d'un nouvel élément
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

  const handleInputChange = (field: keyof Diplome, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "code", label: "Code", width: "w-[90px]" },
    { key: "libelle", label: "Libellé", width: "w-[140px]" },
    { key: "libelleLong", label: "Libellé long", width: "w-[250px]" },
    { key: "echelleInternationale", label: "Echelle internationale", width: "w-[160px]" },
  ];

  const renderExpandedContent = (row: Diplome) => (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div>
        <p className="font-semibold text-foreground mb-1">Code:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.code}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Libellé:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelle}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Libellé long:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleLong}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Echelle internationale:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.echelleInternationale}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Modèle:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.modele}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Tém exclusion/inclusion des réglem.:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.temExclusionInclusion}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Date de début de validité:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.dateDebValidite}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Date de fin de validité:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.dateFinValidite}</p>
      </div>
    </div>
  );

  return (
    <>
      <DataTableWithPagination
        title="Diplômes"
        data={data}
        columns={columns}
        searchFields={["code", "libelle", "libelleLong", "echelleInternationale"]}
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
                  <Label htmlFor="code" className="text-xs">Code</Label>
                  <Input id="code" value={editingItem.code} onChange={(e) => handleInputChange("code", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="libelle" className="text-xs">Libellé</Label>
                  <Input id="libelle" value={editingItem.libelle} onChange={(e) => handleInputChange("libelle", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleLong" className="text-xs">Libellé long</Label>
                <Input id="libelleLong" value={editingItem.libelleLong} onChange={(e) => handleInputChange("libelleLong", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="echelleInternationale" className="text-xs">Echelle internationale</Label>
                  <Input id="echelleInternationale" value={editingItem.echelleInternationale} onChange={(e) => handleInputChange("echelleInternationale", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modele" className="text-xs">Modèle</Label>
                  <Input id="modele" value={editingItem.modele} onChange={(e) => handleInputChange("modele", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temExclusionInclusion" className="text-xs">Tém exclusion/inclusion des réglem.</Label>
                <Input id="temExclusionInclusion" value={editingItem.temExclusionInclusion} onChange={(e) => handleInputChange("temExclusionInclusion", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateDebValidite" className="text-xs">Date de début de validité (JJ/MM/AAAA)</Label>
                  <Input id="dateDebValidite" value={editingItem.dateDebValidite} onChange={(e) => handleInputChange("dateDebValidite", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFinValidite" className="text-xs">Date de fin de validité (JJ/MM/AAAA)</Label>
                  <Input id="dateFinValidite" value={editingItem.dateFinValidite} onChange={(e) => handleInputChange("dateFinValidite", e.target.value)} className="text-sm" />
                </div>
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

export default Diplomes;
