import { useState, useEffect } from "react";
import { FileSpreadsheet, Database, Search, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { formatExcelDate } from "@/lib/dateValidator";

interface SearchResult {
  source: string;
  sourcePath: string;
  data: any;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allData, setAllData] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    // Charger toutes les données au démarrage
    const loadAllData = async () => {
      const dataSources = [
        { name: "Statuts contractuels", path: "/data/statuts-contractuels.csv", type: "csv" },
        { name: "Vacataires", path: "/data/vacataires.xlsx", type: "xlsx" },
        { name: "Positions", path: "/data/positions.xlsx", type: "xlsx" },
        { name: "Corps", path: "/data/corps.xlsx", type: "xlsx" },
        { name: "Grades", path: "/data/grades.xlsx", type: "xlsx" },
        { name: "Congés/absences", path: "/data/conges.xlsx", type: "xlsx" },
        { name: "Emplois", path: "/data/emplois.xlsx", type: "xlsx" },
        { name: "Modalités de service", path: "/data/modalites.xlsx", type: "xlsx" },
        { name: "Diplômes", path: "/data/diplomes.xlsx", type: "xlsx" },
      ];

      const loadedData: { [key: string]: any[] } = {};

      for (const source of dataSources) {
        try {
          const response = await fetch(source.path);
          const buffer = await response.arrayBuffer();
          
          if (source.type === "csv") {
            const text = new TextDecoder().decode(buffer);
            const lines = text.split("\n");
            const data = [];
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(";");
              if (values.length > 0 && values[0]) {
                data.push({ code: values[0], raw: lines[i] });
              }
            }
            loadedData[source.name] = data;
          } else {
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            const data = [];
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (row.length > 0 && row[0]) {
                data.push({ code: String(row[0]), row: row });
              }
            }
            loadedData[source.name] = data;
          }
        } catch (error) {
          console.error(`Erreur lors du chargement de ${source.name}:`, error);
        }
      }

      setAllData(loadedData);
    };

    loadAllData();
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results: SearchResult[] = [];
    const searchLower = searchTerm.toLowerCase().trim();

    Object.entries(allData).forEach(([sourceName, items]) => {
      items.forEach((item) => {
        if (item.code && item.code.toLowerCase().includes(searchLower)) {
          results.push({
            source: sourceName,
            sourcePath: getSourcePath(sourceName),
            data: item,
          });
        }
      });
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  const getSourcePath = (sourceName: string): string => {
    const pathMap: { [key: string]: string } = {
      "Statuts contractuels": "/ref1",
      "Vacataires": "/ref2",
      "Positions": "/ref3",
      "Corps": "/ref4",
      "Grades": "/grades",
      "Congés/absences": "/conges",
      "Emplois": "/emplois",
      "Modalités de service": "/modalites",
      "Diplômes": "/diplomes",
    };
    return pathMap[sourceName] || "/";
  };

  const features = [
    {
      icon: Database,
      title: "Référentiels Centralisés",
      description: "Accédez à tous vos référentiels SIHAM en un seul endroit",
    },
    {
      icon: Search,
      title: "Recherche Rapide",
      description: "Trouvez rapidement les données dont vous avez besoin",
    },
    {
      icon: FileText,
      title: "Données Structurées",
      description: "Consultez vos données organisées de manière claire et professionnelle",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
            <FileSpreadsheet className="h-16 w-16 text-primary" />
          </div>
          <h1 className="mb-4 text-5xl font-bold text-foreground">
            Référentiel SIHAM
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Plateforme de consultation des référentiels principaux SIHAM.
            Accédez facilement à vos données de référence.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <Card className="border-2 p-6">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Rechercher un code</h2>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Entrez un code à rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Résultats ({searchResults.length})
                </h3>
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <Card key={index} className="border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {result.source}
                        </span>
                        <a
                          href={result.sourcePath}
                          className="text-sm text-muted-foreground hover:text-primary hover:underline"
                        >
                          Voir la page →
                        </a>
                      </div>
                      <div className="text-sm text-foreground">
                        <span className="font-semibold">Code:</span> {result.data.code}
                      </div>
                      {result.data.row && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {result.data.row.slice(0, 5).map((cell: any, i: number) => (
                            <div key={i}>
                              <span className="font-semibold">Colonne {i + 1}:</span> {String(cell)}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchTerm && searchResults.length === 0 && !isSearching && (
              <div className="mt-6 text-center text-muted-foreground">
                Aucun résultat trouvé pour "{searchTerm}"
              </div>
            )}
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 p-6 transition-all hover:border-primary hover:shadow-lg"
            >
              <feature.icon className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-lg bg-gradient-to-r from-primary to-accent p-8 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Prêt à explorer vos référentiels ?</h2>
          <p className="mb-6 text-lg opacity-90">
            Utilisez le menu de navigation ci-dessus pour accéder aux différents référentiels
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
