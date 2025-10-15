import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";
import { formatExcelDate, validateDataDates, logDateValidationErrors } from "@/lib/dateValidator";

interface Emploi {
  cle: string;
  emploi: string;
  libelleEmploi: string;
  dateEffet: string;
  classificationEmploi: string;
  codePlusUtiliser: string;
}

const Emplois = () => {
  const [data, setData] = useState<Emploi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Emploi | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/emplois.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: Emploi[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 4) {
            parsedData.push({
              cle: String(row[0] || ""),
              emploi: String(row[1] || ""),
              libelleEmploi: String(row[2] || ""),
              dateEffet: formatExcelDate(row[3]),
              classificationEmploi: String(row[4] || ""),
              codePlusUtiliser: String(row[5] || ""),
            });
          }
        }

        setData(parsedData);
        
        // Valider les dates
        const dateErrors = validateDataDates(parsedData, ["dateEffet"], "Emplois");
        logDateValidationErrors(dateErrors);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    const newItem: Emploi = {
      cle: "",
      emploi: "",
      libelleEmploi: "",
      dateEffet: "",
      classificationEmploi: "",
      codePlusUtiliser: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Emploi, index: number) => {
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

  const handleInputChange = (field: keyof Emploi, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "cle", label: "Clé", width: "w-[110px]" },
    { key: "emploi", label: "Emploi", width: "w-[120px]" },
    { key: "libelleEmploi", label: "Libellé de l'emploi", width: "w-[250px]", truncate: true },
    { key: "dateEffet", label: "Date d'effet", width: "w-[100px]" },
    { key: "classificationEmploi", label: "Classification de l'emploi", width: "w-[180px]", truncate: true },
    { key: "codePlusUtiliser", label: "Code à ne plus utiliser au 1/01/17", width: "w-[200px]", truncate: true },
  ];

  const renderExpandedContent = (row: Emploi) => (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div>
        <p className="font-semibold text-foreground mb-1">Clé:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.cle}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Emploi:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.emploi}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Libellé de l'emploi:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleEmploi}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Date d'effet:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.dateEffet}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Classification de l'emploi:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.classificationEmploi}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Code à ne plus utiliser au 1/01/17:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codePlusUtiliser}</p>
      </div>
    </div>
  );

  return (
    <>
      <DataTableWithPagination
        title="Emplois"
        data={data}
        columns={columns}
        searchFields={["cle", "emploi", "libelleEmploi", "classificationEmploi"]}
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
                  <Label htmlFor="cle" className="text-xs">Clé</Label>
                  <Input id="cle" value={editingItem.cle} onChange={(e) => handleInputChange("cle", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emploi" className="text-xs">Emploi</Label>
                  <Input id="emploi" value={editingItem.emploi} onChange={(e) => handleInputChange("emploi", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleEmploi" className="text-xs">Libellé de l'emploi</Label>
                <Input id="libelleEmploi" value={editingItem.libelleEmploi} onChange={(e) => handleInputChange("libelleEmploi", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEffet" className="text-xs">Date d'effet (JJ/MM/AAAA)</Label>
                <Input id="dateEffet" value={editingItem.dateEffet} onChange={(e) => handleInputChange("dateEffet", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classificationEmploi" className="text-xs">Classification de l'emploi</Label>
                <Input id="classificationEmploi" value={editingItem.classificationEmploi} onChange={(e) => handleInputChange("classificationEmploi", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codePlusUtiliser" className="text-xs">Code à ne plus utiliser au 1/01/17</Label>
                <Input id="codePlusUtiliser" value={editingItem.codePlusUtiliser} onChange={(e) => handleInputChange("codePlusUtiliser", e.target.value)} className="text-sm" />
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

export default Emplois;
