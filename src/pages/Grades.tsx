import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";
import { formatExcelDate, validateDataDates, logDateValidationErrors } from "@/lib/dateValidator";

interface Grade {
  code: string;
  libelle: string;
  libelleLong: string;
  categorieStatutaire: string;
  codeFiliere: string;
  filiere: string;
  codeCorpsCadreEmploi: string;
  corpsCadreEmploi: string;
  codeGroupeHierarchique: string;
  groupeHierarchique: string;
  ageLimiteDepartRetraite: string;
  temExclusionInclusionReglem: string;
  dateDebutValidite: string;
  dateFinValidite: string;
  codeTresorerieGenerale: string;
}

const Grades = () => {
  const [data, setData] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Grade | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/grades.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: Grade[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 15) {
            parsedData.push({
              code: String(row[0] || ""),
              libelle: String(row[1] || ""),
              libelleLong: String(row[2] || ""),
              categorieStatutaire: String(row[3] || ""),
              codeFiliere: String(row[4] || ""),
              filiere: String(row[5] || ""),
              codeCorpsCadreEmploi: String(row[6] || ""),
              corpsCadreEmploi: String(row[7] || ""),
              codeGroupeHierarchique: String(row[8] || ""),
              groupeHierarchique: String(row[9] || ""),
              ageLimiteDepartRetraite: String(row[10] || ""),
              temExclusionInclusionReglem: String(row[11] || ""),
              dateDebutValidite: formatExcelDate(row[12]),
              dateFinValidite: formatExcelDate(row[13]),
              codeTresorerieGenerale: String(row[14] || ""),
            });
          }
        }

        setData(parsedData);
        
        // Valider les dates
        const dateErrors = validateDataDates(parsedData, ["dateDebutValidite", "dateFinValidite"], "Grades");
        logDateValidationErrors(dateErrors);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    const newItem: Grade = {
      code: "",
      libelle: "",
      libelleLong: "",
      categorieStatutaire: "",
      codeFiliere: "",
      filiere: "",
      codeCorpsCadreEmploi: "",
      corpsCadreEmploi: "",
      codeGroupeHierarchique: "",
      groupeHierarchique: "",
      ageLimiteDepartRetraite: "",
      temExclusionInclusionReglem: "",
      dateDebutValidite: "",
      dateFinValidite: "",
      codeTresorerieGenerale: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Grade, index: number) => {
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

  const handleInputChange = (field: keyof Grade, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "code", label: "Code", width: "w-[150px]" },
    { key: "libelle", label: "Libellé", width: "w-[180px]" },
    { key: "libelleLong", label: "Libellé long", width: "w-[250px]" },
    { key: "categorieStatutaire", label: "Catégorie statutaire", width: "w-[160px]" },
  ];

  const renderExpandedContent = (row: Grade) => (
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
        <p className="font-semibold text-foreground mb-1">Catégorie statutaire:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.categorieStatutaire}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Code-Filière:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeFiliere}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Filière:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.filiere}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Code-Corps / Cadre d'emploi:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeCorpsCadreEmploi}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Corps / Cadre d'emploi:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.corpsCadreEmploi}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Code-Groupe hiérarchique:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeGroupeHierarchique}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Groupe hiérarchique:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.groupeHierarchique}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Age limite de départ en retraite:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.ageLimiteDepartRetraite}</p>
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
      <div>
        <p className="font-semibold text-foreground mb-1">Code trésorerie générale:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeTresorerieGenerale}</p>
      </div>
    </div>
  );

  return (
    <>
      <DataTableWithPagination
        title="Grades"
        data={data}
        columns={columns}
        searchFields={["code", "libelle", "libelleLong", "filiere", "corpsCadreEmploi", "groupeHierarchique"]}
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
                  <Label htmlFor="categorieStatutaire" className="text-xs">Catégorie statutaire</Label>
                  <Input id="categorieStatutaire" value={editingItem.categorieStatutaire} onChange={(e) => handleInputChange("categorieStatutaire", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codeFiliere" className="text-xs">Code-Filière</Label>
                  <Input id="codeFiliere" value={editingItem.codeFiliere} onChange={(e) => handleInputChange("codeFiliere", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filiere" className="text-xs">Filière</Label>
                <Input id="filiere" value={editingItem.filiere} onChange={(e) => handleInputChange("filiere", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeCorpsCadreEmploi" className="text-xs">Code-Corps / Cadre d'emploi</Label>
                  <Input id="codeCorpsCadreEmploi" value={editingItem.codeCorpsCadreEmploi} onChange={(e) => handleInputChange("codeCorpsCadreEmploi", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corpsCadreEmploi" className="text-xs">Corps / Cadre d'emploi</Label>
                  <Input id="corpsCadreEmploi" value={editingItem.corpsCadreEmploi} onChange={(e) => handleInputChange("corpsCadreEmploi", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeGroupeHierarchique" className="text-xs">Code-Groupe hiérarchique</Label>
                  <Input id="codeGroupeHierarchique" value={editingItem.codeGroupeHierarchique} onChange={(e) => handleInputChange("codeGroupeHierarchique", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groupeHierarchique" className="text-xs">Groupe hiérarchique</Label>
                  <Input id="groupeHierarchique" value={editingItem.groupeHierarchique} onChange={(e) => handleInputChange("groupeHierarchique", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageLimiteDepartRetraite" className="text-xs">Age limite de départ en retraite</Label>
                  <Input id="ageLimiteDepartRetraite" value={editingItem.ageLimiteDepartRetraite} onChange={(e) => handleInputChange("ageLimiteDepartRetraite", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temExclusionInclusionReglem" className="text-xs">Témoin exclusion/inclusion des réglem.</Label>
                  <Input id="temExclusionInclusionReglem" value={editingItem.temExclusionInclusionReglem} onChange={(e) => handleInputChange("temExclusionInclusionReglem", e.target.value)} className="text-sm" />
                </div>
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
              <div className="space-y-2">
                <Label htmlFor="codeTresorerieGenerale" className="text-xs">Code trésorerie générale</Label>
                <Input id="codeTresorerieGenerale" value={editingItem.codeTresorerieGenerale} onChange={(e) => handleInputChange("codeTresorerieGenerale", e.target.value)} className="text-sm" />
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

export default Grades;
