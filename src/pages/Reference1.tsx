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
    <div className="mx-auto w-full max-w-[99vw] px-2 py-4">
      <Card className="overflow-hidden shadow-lg">
        <div className="border-b bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
          <h2 className="text-xl font-bold text-foreground">Statuts contractuels</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {data.length} entrées
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
                  <TableHead className="sticky left-0 z-10 w-[90px] bg-muted/50 font-bold px-2 py-2 text-xs">
                    Code Siham
                  </TableHead>
                  <TableHead className="w-[110px] font-semibold px-2 py-2 text-xs">Catégorie Siham</TableHead>
                  <TableHead className="w-[140px] font-semibold px-2 py-2 text-xs">Libellé court Siham</TableHead>
                  <TableHead className="w-[200px] font-semibold px-2 py-2 text-xs">Libellé long Siham</TableHead>
                  <TableHead className="w-[85px] font-semibold px-2 py-2 text-xs">Date Deb</TableHead>
                  <TableHead className="w-[85px] font-semibold px-2 py-2 text-xs">Date Fin</TableHead>
                  <TableHead className="w-[180px] font-semibold px-2 py-2 text-xs">Références réglementaires</TableHead>
                  <TableHead className="w-[120px] font-semibold px-2 py-2 text-xs">Droit public / Droit privé</TableHead>
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
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={29} className="h-20 text-center text-sm text-muted-foreground">
                      Aucune donnée trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="sticky left-0 z-10 bg-background font-medium px-2 py-1.5 text-xs">
                        {row.codeSiham}
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.categorieSiham}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.libelleCourtSiham}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.libelleLongSiham}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.dateDeb}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.dateFin}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.referencesReglementaires}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.droitPublicPrive}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.casUtilisation}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.permanentTemporaire}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.regleDurees}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.typeContrat}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.catFP}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.sousCategorie}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">
                        {row.obligationsStatutairesEnseignement}
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.bibliothequeActes}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.infosComplementaires}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.modeGestionRemuneration}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.gradeTG}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.pseudoGrade}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.echelon}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.indiceBrutMajoreForce}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.situationStatutaire}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.regimeSecuriteSociale}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.regimeRetraite}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.codeLibelleHarpege}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.rgPourRDD}</TableCell>
                      <TableCell className="px-2 py-1.5 text-xs">{row.codeCISIRH}</TableCell>
                      <TableCell className="whitespace-pre-wrap px-2 py-1.5 text-xs">{row.libelleCISIRH}</TableCell>
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
