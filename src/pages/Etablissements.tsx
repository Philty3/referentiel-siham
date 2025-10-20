import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";

interface Etablissement {
  codeUAI: string;
  nomEtablissement: string;
  typeEtablissement: string;
  adresse: string;
  codePostal: string;
  ville: string;
  academie: string;
  telephone: string;
  email: string;
}

const Etablissements = () => {
  const [data, setData] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Etablissement | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/etablissements.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: Etablissement[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 1) {
            parsedData.push({
              codeUAI: String(row[0] || ""),
              nomEtablissement: String(row[1] || ""),
              typeEtablissement: String(row[2] || ""),
              adresse: String(row[3] || ""),
              codePostal: String(row[4] || ""),
              ville: String(row[5] || ""),
              academie: String(row[6] || ""),
              telephone: String(row[7] || ""),
              email: String(row[8] || ""),
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
    const newItem: Etablissement = {
      codeUAI: "",
      nomEtablissement: "",
      typeEtablissement: "",
      adresse: "",
      codePostal: "",
      ville: "",
      academie: "",
      telephone: "",
      email: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Etablissement, index: number) => {
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

  const handleInputChange = (field: keyof Etablissement, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "codeUAI", label: "Code UAI", width: "w-[100px]" },
    { key: "nomEtablissement", label: "Nom", width: "w-[200px]" },
    { key: "typeEtablissement", label: "Type", width: "w-[150px]" },
    { key: "ville", label: "Ville", width: "w-[120px]" },
  ];

  const renderExpandedContent = (row: Etablissement) => (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div>
        <p className="font-semibold text-foreground mb-1">Code UAI:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeUAI}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Nom:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.nomEtablissement}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Type:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.typeEtablissement}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Adresse:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.adresse}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Code postal:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codePostal}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Ville:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.ville}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Académie:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.academie}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Téléphone:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.telephone}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Email:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.email}</p>
      </div>
    </div>
  );

  return (
    <>
      <DataTableWithPagination
        title="Établissements"
        data={data}
        columns={columns}
        searchFields={["codeUAI", "nomEtablissement", "typeEtablissement", "ville", "academie"]}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        renderExpandedContent={renderExpandedContent}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Modifier l'établissement" : "Ajouter un établissement"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeUAI" className="text-xs">Code UAI</Label>
                  <Input id="codeUAI" value={editingItem.codeUAI} onChange={(e) => handleInputChange("codeUAI", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomEtablissement" className="text-xs">Nom</Label>
                  <Input id="nomEtablissement" value={editingItem.nomEtablissement} onChange={(e) => handleInputChange("nomEtablissement", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeEtablissement" className="text-xs">Type</Label>
                <Input id="typeEtablissement" value={editingItem.typeEtablissement} onChange={(e) => handleInputChange("typeEtablissement", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse" className="text-xs">Adresse</Label>
                <Input id="adresse" value={editingItem.adresse} onChange={(e) => handleInputChange("adresse", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codePostal" className="text-xs">Code postal</Label>
                  <Input id="codePostal" value={editingItem.codePostal} onChange={(e) => handleInputChange("codePostal", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ville" className="text-xs">Ville</Label>
                  <Input id="ville" value={editingItem.ville} onChange={(e) => handleInputChange("ville", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academie" className="text-xs">Académie</Label>
                <Input id="academie" value={editingItem.academie} onChange={(e) => handleInputChange("academie", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-xs">Téléphone</Label>
                  <Input id="telephone" value={editingItem.telephone} onChange={(e) => handleInputChange("telephone", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" value={editingItem.email} onChange={(e) => handleInputChange("email", e.target.value)} className="text-sm" />
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

export default Etablissements;
