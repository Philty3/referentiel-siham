import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";

interface StatutContractuel {
  codeSiham: string;
  categorieSiham: string;
  libelleCourtSiham: string;
  libelleLongSiham: string;
  dateDeb: string;
  dateFin: string;
  referencesReglementaires: string;
  droitPublicPrive: string;
  casUtilisation: string;
  permanentTemporaire: string;
  regleDurees: string;
  typeContrat: string;
  catFP: string;
  sousCategorie: string;
  obligationsStatutairesEnseignement: string;
  bibliothequeActes: string;
  infosComplementaires: string;
  modeGestionRemuneration: string;
  gradeTG: string;
  pseudoGrade: string;
  echelon: string;
  indiceBrutMajoreForce: string;
  situationStatutaire: string;
  regimeSecuriteSociale: string;
  regimeRetraite: string;
  codeLibelleHarpege: string;
  rgPourRDD: string;
  codeCISIRH: string;
  libelleCISIRH: string;
}

const Reference1 = () => {
  const [data, setData] = useState<StatutContractuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<StatutContractuel | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/contractuels.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: StatutContractuel[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 29) {
            parsedData.push({
              codeSiham: String(row[0] || ""),
              categorieSiham: String(row[1] || ""),
              libelleCourtSiham: String(row[2] || ""),
              libelleLongSiham: String(row[3] || ""),
              dateDeb: String(row[4] || ""),
              dateFin: String(row[5] || ""),
              referencesReglementaires: String(row[6] || ""),
              droitPublicPrive: String(row[7] || ""),
              casUtilisation: String(row[8] || ""),
              permanentTemporaire: String(row[9] || ""),
              regleDurees: String(row[10] || ""),
              typeContrat: String(row[11] || ""),
              catFP: String(row[12] || ""),
              sousCategorie: String(row[13] || ""),
              obligationsStatutairesEnseignement: String(row[14] || ""),
              bibliothequeActes: String(row[15] || ""),
              infosComplementaires: String(row[16] || ""),
              modeGestionRemuneration: String(row[17] || ""),
              gradeTG: String(row[18] || ""),
              pseudoGrade: String(row[19] || ""),
              echelon: String(row[20] || ""),
              indiceBrutMajoreForce: String(row[21] || ""),
              situationStatutaire: String(row[22] || ""),
              regimeSecuriteSociale: String(row[23] || ""),
              regimeRetraite: String(row[24] || ""),
              codeLibelleHarpege: String(row[25] || ""),
              rgPourRDD: String(row[26] || ""),
              codeCISIRH: String(row[27] || ""),
              libelleCISIRH: String(row[28] || ""),
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
    const newItem: StatutContractuel = {
      codeSiham: "",
      categorieSiham: "",
      libelleCourtSiham: "",
      libelleLongSiham: "",
      dateDeb: "",
      dateFin: "",
      referencesReglementaires: "",
      droitPublicPrive: "",
      casUtilisation: "",
      permanentTemporaire: "",
      regleDurees: "",
      typeContrat: "",
      catFP: "",
      sousCategorie: "",
      obligationsStatutairesEnseignement: "",
      bibliothequeActes: "",
      infosComplementaires: "",
      modeGestionRemuneration: "",
      gradeTG: "",
      pseudoGrade: "",
      echelon: "",
      indiceBrutMajoreForce: "",
      situationStatutaire: "",
      regimeSecuriteSociale: "",
      regimeRetraite: "",
      codeLibelleHarpege: "",
      rgPourRDD: "",
      codeCISIRH: "",
      libelleCISIRH: "",
    };
    setEditingItem(newItem);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: StatutContractuel, index: number) => {
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

  const handleInputChange = (field: keyof StatutContractuel, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const columns = [
    { key: "codeSiham", label: "Code Siham", width: "w-[90px]" },
    { key: "categorieSiham", label: "Catégorie Siham", width: "w-[110px]" },
    { key: "libelleCourtSiham", label: "Libellé court Siham", width: "w-[140px]" },
    { key: "libelleLongSiham", label: "Libellé long Siham", width: "w-[200px]", truncate: true },
    { key: "dateDeb", label: "Date Deb", width: "w-[85px]" },
    { key: "dateFin", label: "Date Fin", width: "w-[85px]" },
    { key: "referencesReglementaires", label: "Références réglementaires", width: "w-[180px]", truncate: true },
    { key: "droitPublicPrive", label: "Droit public / Droit privé", width: "w-[120px]" },
    { key: "casUtilisation", label: "Cas d'utilisation", width: "w-[250px]", truncate: true },
    { key: "permanentTemporaire", label: "Permanent / temporaire", width: "w-[130px]" },
    { key: "regleDurees", label: "Règle de durées", width: "w-[180px]", truncate: true },
    { key: "typeContrat", label: "Type de contrat", width: "w-[110px]" },
    { key: "catFP", label: "Cat. FP", width: "w-[80px]" },
    { key: "sousCategorie", label: "Sous catégorie", width: "w-[110px]" },
    { key: "obligationsStatutairesEnseignement", label: "Obligations statutaires d'enseignement", width: "w-[200px]", truncate: true },
    { key: "bibliothequeActes", label: "Bibliothèque des actes", width: "w-[160px]", truncate: true },
    { key: "infosComplementaires", label: "Informations complémentaires à saisir dans Siham", width: "w-[250px]", truncate: true },
    { key: "modeGestionRemuneration", label: "Mode de gestion / Mode de rémunération", width: "w-[200px]", truncate: true },
    { key: "gradeTG", label: "Grade TG", width: "w-[140px]" },
    { key: "pseudoGrade", label: "Pseudo grade", width: "w-[140px]" },
    { key: "echelon", label: "Echelon", width: "w-[80px]" },
    { key: "indiceBrutMajoreForce", label: "Indice brut ou majoré forcé", width: "w-[140px]" },
    { key: "situationStatutaire", label: "Situation statutaire", width: "w-[130px]" },
    { key: "regimeSecuriteSociale", label: "Régime Sécurité sociale", width: "w-[140px]" },
    { key: "regimeRetraite", label: "Régime retraite", width: "w-[120px]" },
    { key: "codeLibelleHarpege", label: "Code et Libellé Harpège", width: "w-[160px]", truncate: true },
    { key: "rgPourRDD", label: "RG pour RDD depuis Harpège", width: "w-[160px]", truncate: true },
    { key: "codeCISIRH", label: "Code CISIRH", width: "w-[100px]" },
    { key: "libelleCISIRH", label: "Libellé CISIRH", width: "w-[180px]", truncate: true },
  ];

  const renderExpandedContent = (row: StatutContractuel) => (
    <div className="grid grid-cols-2 gap-4 text-xs">
      <div>
        <p className="font-semibold text-foreground mb-1">Libellé long:</p>
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
        <p className="font-semibold text-foreground mb-1">Règle de durées:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.regleDurees}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Bibliothèque des actes:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.bibliothequeActes}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Informations complémentaires:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.infosComplementaires}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Mode de gestion / rémunération:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.modeGestionRemuneration}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">Code et Libellé Harpège:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeLibelleHarpege}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">RG pour RDD depuis Harpège:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.rgPourRDD}</p>
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
        title="Statuts contractuels"
        data={data}
        columns={columns}
        searchFields={["codeSiham", "categorieSiham", "libelleCourtSiham", "libelleLongSiham", "codeCISIRH", "libelleCISIRH"]}
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
                  <Input
                    id="codeSiham"
                    value={editingItem.codeSiham}
                    onChange={(e) => handleInputChange("codeSiham", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categorieSiham" className="text-xs">Catégorie Siham</Label>
                  <Input
                    id="categorieSiham"
                    value={editingItem.categorieSiham}
                    onChange={(e) => handleInputChange("categorieSiham", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleCourtSiham" className="text-xs">Libellé court Siham</Label>
                <Input
                  id="libelleCourtSiham"
                  value={editingItem.libelleCourtSiham}
                  onChange={(e) => handleInputChange("libelleCourtSiham", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleLongSiham" className="text-xs">Libellé long Siham</Label>
                <Input
                  id="libelleLongSiham"
                  value={editingItem.libelleLongSiham}
                  onChange={(e) => handleInputChange("libelleLongSiham", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateDeb" className="text-xs">Date Deb</Label>
                  <Input
                    id="dateDeb"
                    value={editingItem.dateDeb}
                    onChange={(e) => handleInputChange("dateDeb", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFin" className="text-xs">Date Fin</Label>
                  <Input
                    id="dateFin"
                    value={editingItem.dateFin}
                    onChange={(e) => handleInputChange("dateFin", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="codeCISIRH" className="text-xs">Code CISIRH</Label>
                <Input
                  id="codeCISIRH"
                  value={editingItem.codeCISIRH}
                  onChange={(e) => handleInputChange("codeCISIRH", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleCISIRH" className="text-xs">Libellé CISIRH</Label>
                <Input
                  id="libelleCISIRH"
                  value={editingItem.libelleCISIRH}
                  onChange={(e) => handleInputChange("libelleCISIRH", e.target.value)}
                  className="text-sm"
                />
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

export default Reference1;
