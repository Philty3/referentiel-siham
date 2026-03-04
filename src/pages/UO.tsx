import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";

interface UO {
  [key: string]: string;
}

const headerKeyMap: Record<string, string> = {};
const headerLabels: string[] = [];

const UOPage = () => {
  const [data, setData] = useState<UO[]>([]);
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState<string[]>([]);
  const [headerKeys, setHeaderKeys] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<UO | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const toKey = (header: string) =>
    header
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase();

  useEffect(() => {
    fetch("/data/uo.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          setLoading(false);
          return;
        }

        const rawHeaders = (jsonData[0] as any[]).map((h) => String(h || ""));
        const keys = rawHeaders.map((h) => toKey(h));

        setHeaders(rawHeaders);
        setHeaderKeys(keys);

        const parsedData: UO[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;
          const obj: UO = {};
          keys.forEach((key, idx) => {
            obj[key] = String(row[idx] ?? "");
          });
          parsedData.push(obj);
        }

        setData(parsedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données UO:", error);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => {
    const newItem: UO = {};
    headerKeys.forEach((key) => {
      newItem[key] = "";
    });
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: UO, index: number) => {
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

  const handleInputChange = (field: string, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  // Show first 4 columns in table, rest in expanded view
  const columns = headerKeys.slice(0, 4).map((key, idx) => ({
    key,
    label: headers[idx] || key,
    width: idx === 0 ? "w-[150px]" : idx < 2 ? "w-[180px]" : "w-[250px]",
  }));

  const renderExpandedContent = (row: UO) => (
    <div className="grid grid-cols-2 gap-4 text-xs">
      {headerKeys.map((key, idx) => (
        <div key={key}>
          <p className="font-semibold text-foreground mb-1">{headers[idx]}:</p>
          <p className="text-muted-foreground whitespace-pre-wrap">{row[key]}</p>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <DataTableWithPagination
        title="UO (Unités Organisationnelles)"
        data={data}
        columns={columns}
        searchFields={headerKeys}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        renderExpandedContent={renderExpandedContent}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Modifier l'élément" : "Ajouter un nouvel élément"}
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {headerKeys.map((key, idx) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-xs">
                      {headers[idx]}
                    </Label>
                    <Input
                      id={key}
                      value={editingItem[key] || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
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

export default UOPage;
