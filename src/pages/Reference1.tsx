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

interface StatutContractuel {
  codeSimam: string;
  categorie: string;
  libelleCourt: string;
  libelleLong: string;
  dateDeb: string;
  dateFin: string;
  referencesReglementaires: string;
  droitPublicPrive: string;
  casUtilisation: string;
  permanentTemporaire: string;
}

const Reference1 = () => {
  const [data, setData] = useState<StatutContractuel[]>([]);
  const [filteredData, setFilteredData] = useState<StatutContractuel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/statuts-contractuels.csv")
      .then((response) => response.text())
      .then((text) => {
        const lines = text.split("\n");
        const parsedData: StatutContractuel[] = [];

        // Skip header (lines 0-4 based on the CSV structure)
        for (let i = 5; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(";");
          if (values.length >= 10) {
            parsedData.push({
              codeSimam: values[0] || "",
              categorie: values[1] || "",
              libelleCourt: values[2] || "",
              libelleLong: values[3] || "",
              dateDeb: values[4] || "",
              dateFin: values[5] || "",
              referencesReglementaires: values[6] || "",
              droitPublicPrive: values[7] || "",
              casUtilisation: values[8] || "",
              permanentTemporaire: values[9] || "",
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
        item.codeSimam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.libelleCourt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.libelleLong.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/50 px-6 py-4">
          <h2 className="text-2xl font-bold text-foreground">Statuts contractuels</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Référentiel des statuts contractuels SIHAM ({data.length} entrées)
          </p>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code, catégorie ou libellé..."
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
                <TableRow>
                  <TableHead className="font-semibold">Code SIHAM</TableHead>
                  <TableHead className="font-semibold">Catégorie</TableHead>
                  <TableHead className="font-semibold">Libellé court</TableHead>
                  <TableHead className="font-semibold">Libellé long</TableHead>
                  <TableHead className="font-semibold">Date début</TableHead>
                  <TableHead className="font-semibold">Date fin</TableHead>
                  <TableHead className="font-semibold">Droit</TableHead>
                  <TableHead className="font-semibold">Permanent/Temporaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucune donnée trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.codeSimam}</TableCell>
                      <TableCell>{row.categorie}</TableCell>
                      <TableCell>{row.libelleCourt}</TableCell>
                      <TableCell className="max-w-md">{row.libelleLong}</TableCell>
                      <TableCell>{row.dateDeb}</TableCell>
                      <TableCell>{row.dateFin}</TableCell>
                      <TableCell>{row.droitPublicPrive}</TableCell>
                      <TableCell>{row.permanentTemporaire}</TableCell>
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
