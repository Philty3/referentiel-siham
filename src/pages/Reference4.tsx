import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";
import { formatExcelDate, validateDataDates, logDateValidationErrors } from "@/lib/dateValidator";

interface Corps {
  code: string;
  libelle: string;
  libelleLong: string;
  libelleLongBis: string;
  libelleCourtBis: string;
  temExclusionInclusionReglem: string;
  dateDebutValidite: string;
  dateFinValidite: string;
  codeFiliere: string;
  filiere: string;
  nombresGrades: string;
  corpsExtinction: string;
  codeCategorieStatutaire: string;
  categorieStatutaire: string;
  serviceStatutaire: string;
}

const Reference4 = () => {
  const [data, setData] = useState<Corps[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Corps | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/corps.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: Corps[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 15) {
            parsedData.push({
              code: String(row[0] || ""),
              libelle: String(row[1] || ""),
              libelleLong: String(row[2] || ""),
              libelleLongBis: String(row[3] || ""),
              libelleCourtBis: String(row[4] || ""),
              temExclusionInclusionReglem: String(row[5] || ""),
              dateDebutValidite: formatExcelDate(row[6]),
              dateFinValidite: formatExcelDate(row[7]),
              codeFiliere: String(row[8] || ""),
              filiere: String(row[9] || ""),
              nombresGrades: String(row[10] || ""),
              corpsExtinction: String(row[11] || ""),
              codeCategorieStatutaire: String(row[12] || ""),
              categorieStatutaire: String(row[13] || ""),
              serviceStatutaire: String(row[14] || ""),
            });
          }
        }

        setData(parsedData);
        
        // Valider les dates
        const dateErrors = validateDataDates(parsedData, ["dateDebutValidite", "dateFinValidite"], "Corps");
        logDateValidationErrors(dateErrors);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    const newItem: Corps = {
      code: "",
      libelle: "",
      libelleLong: "",
      libelleLongBis: "",
      libelleCourtBis: "",
      temExclusionInclusionReglem: "",
      dateDebutValidite: "",
      dateFinValidite: "",
      codeFiliere: "",
      filiere: "",
      nombresGrades: "",
      corpsExtinction: "",
      codeCategorieStatutaire: "",
      categorieStatutaire: "",
      serviceStatutaire: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Corps, index: number) => {
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

  const handleInputChange = (field: keyof Corps, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "code", label: "Code", width: "w-[90px]" },
    { key: "libelle", label: "Libellé", width: "w-[140px]" },
    { key: "libelleLong", label: "Libellé long", width: "w-[200px]", truncate: true },
    { key: "libelleLongBis", label: "Libellé long (bis)", width: "w-[200px]", truncate: true },
    { key: "libelleCourtBis", label: "Libellé court (bis)", width: "w-[140px]", truncate: true },
    { key: "temExclusionInclusionReglem", label: "Tém exclusion/inclusion des réglem.", width: "w-[180px]" },
    { key: "dateDebutValidite", label: "Date de début de validité", width: "w-[120px]" },
    { key: "dateFinValidite", label: "Date de fin de validité", width: "w-[120px]" },
    { key: "codeFiliere", label: "Code-Filière", width: "w-[100px]" },
    { key: "filiere", label: "Filière", width: "w-[140px]" },
    { key: "nombresGrades", label: "Nombres de grades", width: "w-[120px]" },
    { key: "corpsExtinction", label: "Corps en extinction", width: "w-[120px]" },
    { key: "codeCategorieStatutaire", label: "Code-Catégorie statutaire", width: "w-[140px]" },
    { key: "categorieStatutaire", label: "Catégorie statutaire", width: "w-[140px]" },
    { key: "serviceStatutaire", label: "Service Statutaire", width: "w-[140px]" },
  ];

  const renderExpandedContent = (row: Corps) => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
      <div>
        <p className="font-semibold text-foreground">Code:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.code}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Libellé:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelle}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Libellé long:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleLong}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Libellé long (bis):</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleLongBis}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Libellé court (bis):</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleCourtBis}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Témoin exclusion/inclusion des réglem.:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.temExclusionInclusionReglem}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Date de début de validité:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.dateDebutValidite}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Date de fin de validité:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.dateFinValidite}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Code-Filière:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeFiliere}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Filière:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.filiere}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Nombres de grades:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.nombresGrades}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Corps en extinction:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.corpsExtinction}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Code-Catégorie statutaire:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeCategorieStatutaire}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Catégorie statutaire:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.categorieStatutaire}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Service Statutaire:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.serviceStatutaire}</p>
      </div>
    </div>
  );

  return (
    <>
      <DataTableWithPagination
        title="Corps"
        data={data}
        columns={columns}
        searchFields={["code", "libelle", "libelleLong", "libelleLongBis", "filiere", "categorieStatutaire"]}
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
              <div className="space-y-2">
                <Label htmlFor="libelleCourtBis" className="text-xs">Libellé court (bis)</Label>
                <Input id="libelleCourtBis" value={editingItem.libelleCourtBis} onChange={(e) => handleInputChange("libelleCourtBis", e.target.value)} className="text-sm" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeFiliere" className="text-xs">Code-Filière</Label>
                  <Input id="codeFiliere" value={editingItem.codeFiliere} onChange={(e) => handleInputChange("codeFiliere", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filiere" className="text-xs">Filière</Label>
                  <Input id="filiere" value={editingItem.filiere} onChange={(e) => handleInputChange("filiere", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombresGrades" className="text-xs">Nombres de grades</Label>
                  <Input id="nombresGrades" value={editingItem.nombresGrades} onChange={(e) => handleInputChange("nombresGrades", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corpsExtinction" className="text-xs">Corps en extinction</Label>
                  <Input id="corpsExtinction" value={editingItem.corpsExtinction} onChange={(e) => handleInputChange("corpsExtinction", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codeCategorieStatutaire" className="text-xs">Code-Catégorie statutaire</Label>
                  <Input id="codeCategorieStatutaire" value={editingItem.codeCategorieStatutaire} onChange={(e) => handleInputChange("codeCategorieStatutaire", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categorieStatutaire" className="text-xs">Catégorie statutaire</Label>
                  <Input id="categorieStatutaire" value={editingItem.categorieStatutaire} onChange={(e) => handleInputChange("categorieStatutaire", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceStatutaire" className="text-xs">Service Statutaire</Label>
                  <Input id="serviceStatutaire" value={editingItem.serviceStatutaire} onChange={(e) => handleInputChange("serviceStatutaire", e.target.value)} className="text-sm" />
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

export default Reference4;
