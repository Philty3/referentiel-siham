import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";
import { formatExcelDate, validateDataDates, logDateValidationErrors } from "@/lib/dateValidator";

interface Modalite {
  code: string;
  libelle: string;
  libelleLong: string;
  libelleLongBis: string;
  temoinTempsPartiel: string;
  pourcentageAcquisitionConges: string;
  pourcentagePriseConge: string;
  temoinLienEnfantObligatoire: string;
  temExclusionInclusion: string;
  dateDebValidite: string;
  dateFinValidite: string;
}

const Modalites = () => {
  const [data, setData] = useState<Modalite[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Modalite | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/modalites.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: Modalite[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 9) {
            parsedData.push({
              code: String(row[0] || ""),
              libelle: String(row[1] || ""),
              libelleLong: String(row[2] || ""),
              libelleLongBis: String(row[3] || ""),
              temoinTempsPartiel: String(row[4] || ""),
              pourcentageAcquisitionConges: String(row[5] || ""),
              pourcentagePriseConge: String(row[6] || ""),
              temoinLienEnfantObligatoire: String(row[7] || ""),
              temExclusionInclusion: String(row[8] || ""),
              dateDebValidite: formatExcelDate(row[9]),
              dateFinValidite: formatExcelDate(row[10]),
            });
          }
        }

        setData(parsedData);
        
        // Valider les dates
        const dateErrors = validateDataDates(parsedData, ["dateDebValidite", "dateFinValidite"], "Modalités de service");
        logDateValidationErrors(dateErrors);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    const newItem: Modalite = {
      code: "",
      libelle: "",
      libelleLong: "",
      libelleLongBis: "",
      temoinTempsPartiel: "",
      pourcentageAcquisitionConges: "",
      pourcentagePriseConge: "",
      temoinLienEnfantObligatoire: "",
      temExclusionInclusion: "",
      dateDebValidite: "",
      dateFinValidite: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Modalite, index: number) => {
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

  const handleInputChange = (field: keyof Modalite, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "code", label: "Code", width: "w-[90px]" },
    { key: "libelle", label: "Libellé", width: "w-[140px]" },
    { key: "libelleLong", label: "Libellé long", width: "w-[200px]" },
    { key: "libelleLongBis", label: "Libellé long (bis)", width: "w-[200px]", truncate: true },
  ];

  const renderExpandedContent = (row: Modalite) => (
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
        <p className="font-semibold text-foreground mb-1">Libellé long (bis):</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleLongBis}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Témoin temps partiel:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.temoinTempsPartiel}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Pourcentage d'acquisition de congés:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.pourcentageAcquisitionConges}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Pourcentage de prise de congé:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.pourcentagePriseConge}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Témoin lien enfant obligatoire:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.temoinLienEnfantObligatoire}</p>
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
        title="Modalités de service"
        data={data}
        columns={columns}
        searchFields={["code", "libelle", "libelleLong", "libelleLongBis"]}
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
              <div className="space-y-2">
                <Label htmlFor="libelleLongBis" className="text-xs">Libellé long (bis)</Label>
                <Input id="libelleLongBis" value={editingItem.libelleLongBis} onChange={(e) => handleInputChange("libelleLongBis", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temoinTempsPartiel" className="text-xs">Témoin temps partiel</Label>
                  <Input id="temoinTempsPartiel" value={editingItem.temoinTempsPartiel} onChange={(e) => handleInputChange("temoinTempsPartiel", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pourcentageAcquisitionConges" className="text-xs">Pourcentage d'acquisition de congés</Label>
                  <Input id="pourcentageAcquisitionConges" value={editingItem.pourcentageAcquisitionConges} onChange={(e) => handleInputChange("pourcentageAcquisitionConges", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pourcentagePriseConge" className="text-xs">Pourcentage de prise de congé</Label>
                  <Input id="pourcentagePriseConge" value={editingItem.pourcentagePriseConge} onChange={(e) => handleInputChange("pourcentagePriseConge", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temoinLienEnfantObligatoire" className="text-xs">Témoin lien enfant obligatoire</Label>
                  <Input id="temoinLienEnfantObligatoire" value={editingItem.temoinLienEnfantObligatoire} onChange={(e) => handleInputChange("temoinLienEnfantObligatoire", e.target.value)} className="text-sm" />
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

export default Modalites;
