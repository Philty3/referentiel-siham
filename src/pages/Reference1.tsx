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
import { Search } from "lucide-react";
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
  const [filteredData, setFilteredData] = useState<StatutContractuel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/contractuels.xlsx")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: StatutContractuel[] = [];
        
        // Start from row 1 (skip header row 0)
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

  return (
    <div className="container mx-auto max-w-[98vw] px-4 py-8">
      <Card className="overflow-hidden shadow-lg">
        <div className="border-b bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4">
          <h2 className="text-2xl font-bold text-foreground">Statuts contractuels</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Référentiel des statuts contractuels SIHAM - {data.length} entrées
          </p>
        </div>

        <div className="border-b bg-muted/20 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code, catégorie, libellé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Chargement des données...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="sticky left-0 z-10 min-w-[110px] bg-muted/50 font-bold">
                    Code Siham
                  </TableHead>
                  <TableHead className="min-w-[130px] font-semibold">Catégorie Siham</TableHead>
                  <TableHead className="min-w-[180px] font-semibold">Libellé court Siham</TableHead>
                  <TableHead className="min-w-[280px] font-semibold">Libellé long Siham</TableHead>
                  <TableHead className="min-w-[110px] font-semibold">Date Deb</TableHead>
                  <TableHead className="min-w-[110px] font-semibold">Date Fin</TableHead>
                  <TableHead className="min-w-[220px] font-semibold">Références réglementaires</TableHead>
                  <TableHead className="min-w-[150px] font-semibold">Droit public / Droit privé</TableHead>
                  <TableHead className="min-w-[350px] font-semibold">Cas d'utilisation</TableHead>
                  <TableHead className="min-w-[170px] font-semibold">Permanent / temporaire</TableHead>
                  <TableHead className="min-w-[220px] font-semibold">Règle de durées</TableHead>
                  <TableHead className="min-w-[140px] font-semibold">Type de contrat</TableHead>
                  <TableHead className="min-w-[100px] font-semibold">Cat. FP</TableHead>
                  <TableHead className="min-w-[140px] font-semibold">Sous catégorie</TableHead>
                  <TableHead className="min-w-[250px] font-semibold">
                    Obligations statutaires d'enseignement
                  </TableHead>
                  <TableHead className="min-w-[200px] font-semibold">Bibliothèque des actes</TableHead>
                  <TableHead className="min-w-[350px] font-semibold">
                    Informations complémentaires à saisir dans Siham
                  </TableHead>
                  <TableHead className="min-w-[250px] font-semibold">
                    Mode de gestion / Mode de rémunération
                  </TableHead>
                  <TableHead className="min-w-[180px] font-semibold">Grade TG</TableHead>
                  <TableHead className="min-w-[180px] font-semibold">Pseudo grade</TableHead>
                  <TableHead className="min-w-[100px] font-semibold">Echelon</TableHead>
                  <TableHead className="min-w-[180px] font-semibold">
                    Indice brut ou majoré forcé
                  </TableHead>
                  <TableHead className="min-w-[170px] font-semibold">Situation statutaire</TableHead>
                  <TableHead className="min-w-[180px] font-semibold">Régime Sécurité sociale</TableHead>
                  <TableHead className="min-w-[150px] font-semibold">Régime retraite</TableHead>
                  <TableHead className="min-w-[200px] font-semibold">
                    Code et Libellé Harpège
                  </TableHead>
                  <TableHead className="min-w-[200px] font-semibold">
                    RG pour RDD depuis Harpège
                  </TableHead>
                  <TableHead className="min-w-[120px] font-semibold">Code CISIRH</TableHead>
                  <TableHead className="min-w-[220px] font-semibold">Libellé CISIRH</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={29} className="h-24 text-center text-muted-foreground">
                      Aucune donnée trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="sticky left-0 z-10 bg-background font-medium">
                        {row.codeSiham}
                      </TableCell>
                      <TableCell>{row.categorieSiham}</TableCell>
                      <TableCell>{row.libelleCourtSiham}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.libelleLongSiham}</TableCell>
                      <TableCell>{row.dateDeb}</TableCell>
                      <TableCell>{row.dateFin}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.referencesReglementaires}</TableCell>
                      <TableCell>{row.droitPublicPrive}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.casUtilisation}</TableCell>
                      <TableCell>{row.permanentTemporaire}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.regleDurees}</TableCell>
                      <TableCell>{row.typeContrat}</TableCell>
                      <TableCell>{row.catFP}</TableCell>
                      <TableCell>{row.sousCategorie}</TableCell>
                      <TableCell className="whitespace-pre-wrap">
                        {row.obligationsStatutairesEnseignement}
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.bibliothequeActes}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.infosComplementaires}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.modeGestionRemuneration}</TableCell>
                      <TableCell>{row.gradeTG}</TableCell>
                      <TableCell>{row.pseudoGrade}</TableCell>
                      <TableCell>{row.echelon}</TableCell>
                      <TableCell>{row.indiceBrutMajoreForce}</TableCell>
                      <TableCell>{row.situationStatutaire}</TableCell>
                      <TableCell>{row.regimeSecuriteSociale}</TableCell>
                      <TableCell>{row.regimeRetraite}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.codeLibelleHarpege}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.rgPourRDD}</TableCell>
                      <TableCell>{row.codeCISIRH}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{row.libelleCISIRH}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reference1;
