import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";
import { formatExcelDate, validateDataDates, logDateValidationErrors } from "@/lib/dateValidator";

interface Conge {
  code: string;
  libelleLong: string;
  libelleCourt: string;
  temExclusionInclusionReglem: string;
  dateDebutValidite: string;
  dateFinValidite: string;
}

const Conges = () => {
  const [data, setData] = useState<Conge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Conge | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/conges.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: Conge[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 6) {
            parsedData.push({
              code: String(row[0] || ""),
              libelleLong: String(row[1] || ""),
              libelleCourt: String(row[2] || ""),
              temExclusionInclusionReglem: String(row[3] || ""),
              dateDebutValidite: formatExcelDate(row[4]),
              dateFinValidite: formatExcelDate(row[5]),
            });
          }
        }

        setData(parsedData);
        
        // Valider les dates
        const dateErrors = validateDataDates(parsedData, ["dateDebutValidite", "dateFinValidite"], "Congés/absences");
        logDateValidationErrors(dateErrors);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    const newItem: Conge = {
      code: "",
      libelleLong: "",
      libelleCourt: "",
      temExclusionInclusionReglem: "",
      dateDebutValidite: "",
      dateFinValidite: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Conge, index: number) => {
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

  const handleInputChange = (field: keyof Conge, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "code", label: "Code", width: "w-[120px]" },
    { key: "libelleLong", label: "Libellé long", width: "w-[300px]" },
    { key: "libelleCourt", label: "Libellé court", width: "w-[180px]" },
    { key: "temExclusionInclusionReglem", label: "Tém exclusion/inclusion des réglem.", width: "w-[180px]" },
    { key: "dateDebutValidite", label: "Date de début de validité", width: "w-[140px]" },
    { key: "dateFinValidite", label: "Date de fin de validité", width: "w-[140px]" },
  ];

  const renderExpandedContent = (row: Conge) => (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div>
        <p className="font-semibold text-foreground mb-1">Code:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.code}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Libellé long:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleLong}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Libellé court:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleCourt}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Témoin exclusion/inclusion des réglem.:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.temExclusionInclusionReglem}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Date de début de validité:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.dateDebutValidite}</p>
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
        title="Congés/absences"
        data={data}
        columns={columns}
        searchFields={["code", "libelleLong", "libelleCourt"]}
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
              <div className="space-y-2">
                <Label htmlFor="code" className="text-xs">Code</Label>
                <Input id="code" value={editingItem.code} onChange={(e) => handleInputChange("code", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleLong" className="text-xs">Libellé long</Label>
                <Input id="libelleLong" value={editingItem.libelleLong} onChange={(e) => handleInputChange("libelleLong", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleCourt" className="text-xs">Libellé court</Label>
                <Input id="libelleCourt" value={editingItem.libelleCourt} onChange={(e) => handleInputChange("libelleCourt", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temExclusionInclusionReglem" className="text-xs">Témoin exclusion/inclusion des réglem.</Label>
                <Input id="temExclusionInclusionReglem" value={editingItem.temExclusionInclusionReglem} onChange={(e) => handleInputChange("temExclusionInclusionReglem", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateDebutValidite" className="text-xs">Date de début de validité (JJ/MM/AAAA)</Label>
                  <Input id="dateDebutValidite" value={editingItem.dateDebutValidite} onChange={(e) => handleInputChange("dateDebutValidite", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFinValidite" className="text-xs">Date de fin de validité (JJ/MM/AAAA)</Label>
                  <Input id="dateFinValidite" value={editingItem.dateFinValidite} onChange={(e) => handleInputChange("dateFinValidite", e.target.value)} className="text-sm" />
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

export default Conges;
