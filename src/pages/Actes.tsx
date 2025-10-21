import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";

interface Acte {
  code: string;
  libelle: string;
  libelleComplementaire: string;
  typeArreteDecision: string;
  typePopulation: string;
  numeroOrdre: string;
  codeVisa: string;
  visa: string;
  typePopulation2: string;
  numeroOrdre2: string;
  codeArticle: string;
  article: string;
  processus: string;
  octroiRenouvellement: string;
}

const Actes = () => {
  const [data, setData] = useState<Acte[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Acte | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const parsedData: Acte[] = [];
        
        const response = await fetch("/data/actes.xlsx");
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 14) {
            parsedData.push({
              code: String(row[0] || ""),
              libelle: String(row[1] || ""),
              libelleComplementaire: String(row[2] || ""),
              typeArreteDecision: String(row[3] || ""),
              typePopulation: String(row[4] || ""),
              numeroOrdre: String(row[5] || ""),
              codeVisa: String(row[6] || ""),
              visa: String(row[7] || ""),
              typePopulation2: String(row[8] || ""),
              numeroOrdre2: String(row[9] || ""),
              codeArticle: String(row[10] || ""),
              article: String(row[11] || ""),
              processus: String(row[12] || ""),
              octroiRenouvellement: String(row[13] || ""),
            });
          }
        }

        setData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleAdd = () => {
    const newItem: Acte = {
      code: "",
      libelle: "",
      libelleComplementaire: "",
      typeArreteDecision: "",
      typePopulation: "",
      numeroOrdre: "",
      codeVisa: "",
      visa: "",
      typePopulation2: "",
      numeroOrdre2: "",
      codeArticle: "",
      article: "",
      processus: "",
      octroiRenouvellement: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Acte, index: number) => {
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

  const handleInputChange = (field: keyof Acte, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "code", label: "Code", width: "w-[120px]" },
    { key: "libelle", label: "Libellé", width: "w-[200px]" },
    { key: "libelleComplementaire", label: "Libellé complémentaire", width: "w-[200px]" },
    { key: "typeArreteDecision", label: "Type d'arrêté / décision", width: "w-[150px]" },
  ];

  const renderExpandedContent = (row: Acte) => (
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
        <p className="font-semibold text-foreground mb-1">Libellé complémentaire:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleComplementaire}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Type d'arrêté / décision:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.typeArreteDecision}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Type de population:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.typePopulation}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Numéro d'ordre:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.numeroOrdre}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Code du visa:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeVisa}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Visa:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.visa}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Type de population (2):</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.typePopulation2}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Numéro d'ordre (2):</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.numeroOrdre2}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Code de l'article:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeArticle}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Article:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.article}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Processus:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.processus}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Octroi/Renouvellement:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.octroiRenouvellement}</p>
      </div>
    </div>
  );

  return (
    <>
      <DataTableWithPagination
        title="Actes"
        data={data}
        columns={columns}
        searchFields={["code", "libelle", "libelleComplementaire", "typeArreteDecision"]}
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
                <Label htmlFor="libelleComplementaire" className="text-xs">Libellé complémentaire</Label>
                <Input id="libelleComplementaire" value={editingItem.libelleComplementaire} onChange={(e) => handleInputChange("libelleComplementaire", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeArreteDecision" className="text-xs">Type d'arrêté / décision</Label>
                <Input id="typeArreteDecision" value={editingItem.typeArreteDecision} onChange={(e) => handleInputChange("typeArreteDecision", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typePopulation" className="text-xs">Type de population</Label>
                  <Input id="typePopulation" value={editingItem.typePopulation} onChange={(e) => handleInputChange("typePopulation", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroOrdre" className="text-xs">Numéro d'ordre</Label>
                  <Input id="numeroOrdre" value={editingItem.numeroOrdre} onChange={(e) => handleInputChange("numeroOrdre", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeVisa" className="text-xs">Code du visa</Label>
                  <Input id="codeVisa" value={editingItem.codeVisa} onChange={(e) => handleInputChange("codeVisa", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visa" className="text-xs">Visa</Label>
                  <Input id="visa" value={editingItem.visa} onChange={(e) => handleInputChange("visa", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typePopulation2" className="text-xs">Type de population (2)</Label>
                  <Input id="typePopulation2" value={editingItem.typePopulation2} onChange={(e) => handleInputChange("typePopulation2", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroOrdre2" className="text-xs">Numéro d'ordre (2)</Label>
                  <Input id="numeroOrdre2" value={editingItem.numeroOrdre2} onChange={(e) => handleInputChange("numeroOrdre2", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeArticle" className="text-xs">Code de l'article</Label>
                  <Input id="codeArticle" value={editingItem.codeArticle} onChange={(e) => handleInputChange("codeArticle", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="article" className="text-xs">Article</Label>
                  <Input id="article" value={editingItem.article} onChange={(e) => handleInputChange("article", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processus" className="text-xs">Processus</Label>
                  <Input id="processus" value={editingItem.processus} onChange={(e) => handleInputChange("processus", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="octroiRenouvellement" className="text-xs">Octroi/Renouvellement</Label>
                  <Input id="octroiRenouvellement" value={editingItem.octroiRenouvellement} onChange={(e) => handleInputChange("octroiRenouvellement", e.target.value)} className="text-sm" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Actes;
