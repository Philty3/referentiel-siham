import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";
import { formatExcelDate, validateDataDates, logDateValidationErrors } from "@/lib/dateValidator";

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
              dateDeb: formatExcelDate(row[4]),
              dateFin: formatExcelDate(row[5]),
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
        
        // Valider les dates
        const dateErrors = validateDataDates(parsedData, ["dateDeb", "dateFin"], "Statuts contractuels");
        logDateValidationErrors(dateErrors);
        
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
    <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
      <div>
        <p className="font-semibold text-foreground">Code Siham:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeSiham}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Catégorie Siham:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.categorieSiham}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Libellé court Siham:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleCourtSiham}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Libellé long Siham:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.libelleLongSiham}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Date Deb:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.dateDeb}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Date Fin:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.dateFin}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Références réglementaires:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.referencesReglementaires}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Droit public / Droit privé:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.droitPublicPrive}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Cas d'utilisation:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.casUtilisation}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Permanent / temporaire:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.permanentTemporaire}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Règle de durées:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.regleDurees}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Type de contrat:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.typeContrat}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Cat. FP:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.catFP}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Sous catégorie:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.sousCategorie}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Obligations statutaires d'enseignement:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.obligationsStatutairesEnseignement}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Bibliothèque des actes:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.bibliothequeActes}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Informations complémentaires:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.infosComplementaires}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Mode de gestion / rémunération:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.modeGestionRemuneration}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Grade TG:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.gradeTG}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Pseudo grade:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.pseudoGrade}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Echelon:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.echelon}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Indice brut ou majoré forcé:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.indiceBrutMajoreForce}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Situation statutaire:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.situationStatutaire}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Régime Sécurité sociale:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.regimeSecuriteSociale}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Régime retraite:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.regimeRetraite}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Code et Libellé Harpège:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeLibelleHarpege}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">RG pour RDD depuis Harpège:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.rgPourRDD}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Code CISIRH:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{row.codeCISIRH}</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">Libellé CISIRH:</p>
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
                  <Input id="codeSiham" value={editingItem.codeSiham} onChange={(e) => handleInputChange("codeSiham", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categorieSiham" className="text-xs">Catégorie Siham</Label>
                  <Input id="categorieSiham" value={editingItem.categorieSiham} onChange={(e) => handleInputChange("categorieSiham", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleCourtSiham" className="text-xs">Libellé court Siham</Label>
                <Input id="libelleCourtSiham" value={editingItem.libelleCourtSiham} onChange={(e) => handleInputChange("libelleCourtSiham", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelleLongSiham" className="text-xs">Libellé long Siham</Label>
                <Input id="libelleLongSiham" value={editingItem.libelleLongSiham} onChange={(e) => handleInputChange("libelleLongSiham", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateDeb" className="text-xs">Date Deb (JJ/MM/AAAA)</Label>
                  <Input id="dateDeb" value={editingItem.dateDeb} onChange={(e) => handleInputChange("dateDeb", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFin" className="text-xs">Date Fin (JJ/MM/AAAA)</Label>
                  <Input id="dateFin" value={editingItem.dateFin} onChange={(e) => handleInputChange("dateFin", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referencesReglementaires" className="text-xs">Références réglementaires</Label>
                <Input id="referencesReglementaires" value={editingItem.referencesReglementaires} onChange={(e) => handleInputChange("referencesReglementaires", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="droitPublicPrive" className="text-xs">Droit public / Droit privé</Label>
                  <Input id="droitPublicPrive" value={editingItem.droitPublicPrive} onChange={(e) => handleInputChange("droitPublicPrive", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentTemporaire" className="text-xs">Permanent / temporaire</Label>
                  <Input id="permanentTemporaire" value={editingItem.permanentTemporaire} onChange={(e) => handleInputChange("permanentTemporaire", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="casUtilisation" className="text-xs">Cas d'utilisation</Label>
                <Input id="casUtilisation" value={editingItem.casUtilisation} onChange={(e) => handleInputChange("casUtilisation", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regleDurees" className="text-xs">Règle de durées</Label>
                <Input id="regleDurees" value={editingItem.regleDurees} onChange={(e) => handleInputChange("regleDurees", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typeContrat" className="text-xs">Type de contrat</Label>
                  <Input id="typeContrat" value={editingItem.typeContrat} onChange={(e) => handleInputChange("typeContrat", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catFP" className="text-xs">Cat. FP</Label>
                  <Input id="catFP" value={editingItem.catFP} onChange={(e) => handleInputChange("catFP", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sousCategorie" className="text-xs">Sous catégorie</Label>
                  <Input id="sousCategorie" value={editingItem.sousCategorie} onChange={(e) => handleInputChange("sousCategorie", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obligationsStatutairesEnseignement" className="text-xs">Obligations statutaires d'enseignement</Label>
                <Input id="obligationsStatutairesEnseignement" value={editingItem.obligationsStatutairesEnseignement} onChange={(e) => handleInputChange("obligationsStatutairesEnseignement", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bibliothequeActes" className="text-xs">Bibliothèque des actes</Label>
                <Input id="bibliothequeActes" value={editingItem.bibliothequeActes} onChange={(e) => handleInputChange("bibliothequeActes", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="infosComplementaires" className="text-xs">Informations complémentaires à saisir dans Siham</Label>
                <Input id="infosComplementaires" value={editingItem.infosComplementaires} onChange={(e) => handleInputChange("infosComplementaires", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modeGestionRemuneration" className="text-xs">Mode de gestion / Mode de rémunération</Label>
                <Input id="modeGestionRemuneration" value={editingItem.modeGestionRemuneration} onChange={(e) => handleInputChange("modeGestionRemuneration", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradeTG" className="text-xs">Grade TG</Label>
                  <Input id="gradeTG" value={editingItem.gradeTG} onChange={(e) => handleInputChange("gradeTG", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pseudoGrade" className="text-xs">Pseudo grade</Label>
                  <Input id="pseudoGrade" value={editingItem.pseudoGrade} onChange={(e) => handleInputChange("pseudoGrade", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="echelon" className="text-xs">Echelon</Label>
                  <Input id="echelon" value={editingItem.echelon} onChange={(e) => handleInputChange("echelon", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="indiceBrutMajoreForce" className="text-xs">Indice brut ou majoré forcé</Label>
                  <Input id="indiceBrutMajoreForce" value={editingItem.indiceBrutMajoreForce} onChange={(e) => handleInputChange("indiceBrutMajoreForce", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="situationStatutaire" className="text-xs">Situation statutaire</Label>
                  <Input id="situationStatutaire" value={editingItem.situationStatutaire} onChange={(e) => handleInputChange("situationStatutaire", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regimeSecuriteSociale" className="text-xs">Régime Sécurité sociale</Label>
                  <Input id="regimeSecuriteSociale" value={editingItem.regimeSecuriteSociale} onChange={(e) => handleInputChange("regimeSecuriteSociale", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regimeRetraite" className="text-xs">Régime retraite</Label>
                  <Input id="regimeRetraite" value={editingItem.regimeRetraite} onChange={(e) => handleInputChange("regimeRetraite", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="codeLibelleHarpege" className="text-xs">Code et Libellé Harpège</Label>
                <Input id="codeLibelleHarpege" value={editingItem.codeLibelleHarpege} onChange={(e) => handleInputChange("codeLibelleHarpege", e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rgPourRDD" className="text-xs">RG pour RDD depuis Harpège</Label>
                <Input id="rgPourRDD" value={editingItem.rgPourRDD} onChange={(e) => handleInputChange("rgPourRDD", e.target.value)} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeCISIRH" className="text-xs">Code CISIRH</Label>
                  <Input id="codeCISIRH" value={editingItem.codeCISIRH} onChange={(e) => handleInputChange("codeCISIRH", e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="libelleCISIRH" className="text-xs">Libellé CISIRH</Label>
                  <Input id="libelleCISIRH" value={editingItem.libelleCISIRH} onChange={(e) => handleInputChange("libelleCISIRH", e.target.value)} className="text-sm" />
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

export default Reference1;
