import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Edit, Trash2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface Vacataire {
  codeSiham: string;
  categorieSiham: string;
  libelleCourtSiham: string;
  libelleLongSiham: string;
  dateDeb: string;
  dateFin: string;
  referencesReglementaires: string;
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

const Reference2 = () => {
  const [data, setData] = useState<Vacataire[]>([]);
  const [filteredData, setFilteredData] = useState<Vacataire[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Vacataire | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/vacataires.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: Vacataire[] = [];
        
        // Start from row 1 (skip header row 0)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length >= 28) {
            parsedData.push({
              codeSiham: String(row[0] || ""),
              categorieSiham: String(row[1] || ""),
              libelleCourtSiham: String(row[2] || ""),
              libelleLongSiham: String(row[3] || ""),
              dateDeb: String(row[4] || ""),
              dateFin: String(row[5] || ""),
              referencesReglementaires: String(row[6] || ""),
              casUtilisation: String(row[7] || ""),
              permanentTemporaire: String(row[8] || ""),
              regleDurees: String(row[9] || ""),
              typeContrat: String(row[10] || ""),
              catFP: String(row[11] || ""),
              sousCategorie: String(row[12] || ""),
              obligationsStatutairesEnseignement: String(row[13] || ""),
              bibliothequeActes: String(row[14] || ""),
              infosComplementaires: String(row[15] || ""),
              modeGestionRemuneration: String(row[16] || ""),
              gradeTG: String(row[17] || ""),
              pseudoGrade: String(row[18] || ""),
              echelon: String(row[19] || ""),
              indiceBrutMajoreForce: String(row[20] || ""),
              situationStatutaire: String(row[21] || ""),
              regimeSecuriteSociale: String(row[22] || ""),
              regimeRetraite: String(row[23] || ""),
              codeLibelleHarpege: String(row[24] || ""),
              rgPourRDD: String(row[25] || ""),
              codeCISIRH: String(row[26] || ""),
              libelleCISIRH: String(row[27] || ""),
            });
          }
        }

        setData(parsedData);
        setFilteredData(parsedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(
      (item) =>
        item.codeSiham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categorieSiham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.libelleCourtSiham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.libelleLongSiham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codeCISIRH.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.libelleCISIRH.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleEdit = (item: Vacataire, index: number) => {
    setEditingItem({ ...item });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem && editingIndex !== null) {
      const updatedData = [...data];
      updatedData[editingIndex] = editingItem;
      setData(updatedData);
      setIsDialogOpen(false);
      setEditingItem(null);
      setEditingIndex(null);
      toast({
        title: "Modifications enregistrées",
        description: "L'élément a été mis à jour avec succès.",
      });
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

  const handleInputChange = (field: keyof Vacataire, value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="mx-auto w-full max-w-[99vw] px-2 py-4">
      <Card className="overflow-hidden shadow-lg">
        <div className="border-b bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
          <h2 className="text-xl font-bold text-foreground">Vacataires</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {filteredData.length} entrées {filteredData.length !== data.length && `sur ${data.length}`}
          </p>
        </div>

        <div className="border-b bg-muted/20 p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code, catégorie, libellé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[calc(100vh-200px)]">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Chargement des données...
            </div>
          ) : (
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="sticky left-0 z-10 w-[100px] bg-muted/50 font-bold px-2 py-2 text-xs">
                    Actions
                  </TableHead>
                  <TableHead className="w-[90px] bg-muted/50 font-bold px-2 py-2 text-xs">
                    Code Siham
                  </TableHead>
                  <TableHead className="w-[110px] font-semibold px-2 py-2 text-xs">Catégorie Siham</TableHead>
                  <TableHead className="w-[140px] font-semibold px-2 py-2 text-xs">Libellé court Siham</TableHead>
                  <TableHead className="w-[200px] font-semibold px-2 py-2 text-xs">Libellé long Siham</TableHead>
                  <TableHead className="w-[85px] font-semibold px-2 py-2 text-xs">Date Deb</TableHead>
                  <TableHead className="w-[85px] font-semibold px-2 py-2 text-xs">Date Fin</TableHead>
                  <TableHead className="w-[180px] font-semibold px-2 py-2 text-xs">Références réglementaires</TableHead>
                  <TableHead className="w-[250px] font-semibold px-2 py-2 text-xs">Cas d'utilisation</TableHead>
                  <TableHead className="w-[130px] font-semibold px-2 py-2 text-xs">Permanent / temporaire</TableHead>
                  <TableHead className="w-[180px] font-semibold px-2 py-2 text-xs">Règle de durées</TableHead>
                  <TableHead className="w-[110px] font-semibold px-2 py-2 text-xs">Type de contrat</TableHead>
                  <TableHead className="w-[80px] font-semibold px-2 py-2 text-xs">Cat. FP</TableHead>
                  <TableHead className="w-[110px] font-semibold px-2 py-2 text-xs">Sous catégorie</TableHead>
                  <TableHead className="w-[200px] font-semibold px-2 py-2 text-xs">
                    Obligations statutaires d'enseignement
                  </TableHead>
                  <TableHead className="w-[160px] font-semibold px-2 py-2 text-xs">Bibliothèque des actes</TableHead>
                  <TableHead className="w-[250px] font-semibold px-2 py-2 text-xs">
                    Informations complémentaires à saisir dans Siham
                  </TableHead>
                  <TableHead className="w-[200px] font-semibold px-2 py-2 text-xs">
                    Mode de gestion / Mode de rémunération
                  </TableHead>
                  <TableHead className="w-[140px] font-semibold px-2 py-2 text-xs">Grade TG</TableHead>
                  <TableHead className="w-[140px] font-semibold px-2 py-2 text-xs">Pseudo grade</TableHead>
                  <TableHead className="w-[80px] font-semibold px-2 py-2 text-xs">Echelon</TableHead>
                  <TableHead className="w-[140px] font-semibold px-2 py-2 text-xs">
                    Indice brut ou majoré forcé
                  </TableHead>
                  <TableHead className="w-[130px] font-semibold px-2 py-2 text-xs">Situation statutaire</TableHead>
                  <TableHead className="w-[140px] font-semibold px-2 py-2 text-xs">Régime Sécurité sociale</TableHead>
                  <TableHead className="w-[120px] font-semibold px-2 py-2 text-xs">Régime retraite</TableHead>
                  <TableHead className="w-[160px] font-semibold px-2 py-2 text-xs">
                    Code et Libellé Harpège
                  </TableHead>
                  <TableHead className="w-[160px] font-semibold px-2 py-2 text-xs">
                    RG pour RDD depuis Harpège
                  </TableHead>
                  <TableHead className="w-[100px] font-semibold px-2 py-2 text-xs">Code CISIRH</TableHead>
                  <TableHead className="w-[180px] font-semibold px-2 py-2 text-xs">Libellé CISIRH</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={29} className="h-20 text-center text-sm text-muted-foreground">
                      Aucune donnée trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => {
                    const originalIndex = data.findIndex(item => item.codeSiham === row.codeSiham && item.libelleLongSiham === row.libelleLongSiham);
                    const rowId = `${row.codeSiham}-${index}`;
                    const isExpanded = expandedRow === rowId;
                    
                    return (
                      <>
                        <TableRow 
                          key={index} 
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => setExpandedRow(isExpanded ? null : rowId)}
                        >
                          <TableCell className="sticky left-0 z-10 bg-background px-2 py-1.5">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(row, originalIndex);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(originalIndex);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                              >
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="bg-background font-medium px-2 py-1.5 text-xs">
                            {row.codeSiham}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.categorieSiham}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.libelleCourtSiham}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[200px] truncate">
                            {row.libelleLongSiham}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.dateDeb}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.dateFin}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[180px] truncate">
                            {row.referencesReglementaires}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[250px] truncate">
                            {row.casUtilisation}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.permanentTemporaire}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[180px] truncate">
                            {row.regleDurees}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.typeContrat}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.catFP}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.sousCategorie}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[200px] truncate">
                            {row.obligationsStatutairesEnseignement}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[160px] truncate">
                            {row.bibliothequeActes}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[250px] truncate">
                            {row.infosComplementaires}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[200px] truncate">
                            {row.modeGestionRemuneration}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.gradeTG}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.pseudoGrade}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.echelon}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.indiceBrutMajoreForce}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.situationStatutaire}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.regimeSecuriteSociale}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.regimeRetraite}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[160px] truncate">
                            {row.codeLibelleHarpege}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[160px] truncate">
                            {row.rgPourRDD}
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-xs">{row.codeCISIRH}</TableCell>
                          <TableCell className="px-2 py-1.5 text-xs max-w-[180px] truncate">
                            {row.libelleCISIRH}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={29} className="p-0">
                              <div className="p-4 animate-accordion-down">
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
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && filteredData.length > 0 && (
          <div className="border-t bg-muted/20 px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredData.length)} sur {filteredData.length} entrées
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-8 text-xs"
              >
                Première
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 text-xs"
              >
                Précédent
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => goToPage(pageNum)}
                      className="h-8 w-8 text-xs p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 text-xs"
              >
                Suivant
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 text-xs"
              >
                Dernière
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'élément</DialogTitle>
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
    </div>
  );
};

export default Reference2;
