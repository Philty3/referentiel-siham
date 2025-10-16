import { useState, useEffect } from "react";
import { FileSpreadsheet, Database, Search, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import * as XLSX from "xlsx";
import { formatExcelDate } from "@/lib/dateValidator";

interface Column {
  key: string;
  label: string;
  width?: string;
  truncate?: boolean;
}

interface SearchResultItem {
  source: string;
  [key: string]: any;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allData, setAllData] = useState<{ [key: string]: any[] }>({});
  const [allHeaders, setAllHeaders] = useState<{ [key: string]: string[] }>({});

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
      const loadedHeaders: { [key: string]: string[] } = {};

      for (const source of dataSources) {
        try {
          const response = await fetch(source.path);
          const buffer = await response.arrayBuffer();
          
          if (source.type === "csv") {
            const text = new TextDecoder().decode(buffer);
            const lines = text.split("\n");
            const headers = lines[0].split(";");
            loadedHeaders[source.name] = headers;
            
            const data = [];
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(";");
              if (values.length > 0 && values[0]) {
                const rowObj: any = { source: source.name };
                headers.forEach((header, idx) => {
                  rowObj[header] = values[idx] || "";
                });
                data.push(rowObj);
              }
            }
            loadedData[source.name] = data;
          } else {
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            const headers = jsonData[0] as string[];
            loadedHeaders[source.name] = headers.map(h => String(h));
            
            const data = [];
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (row.length > 0 && row[0]) {
                const rowObj: any = { source: source.name };
                headers.forEach((header, idx) => {
                  rowObj[String(header)] = row[idx] ? String(row[idx]) : "";
                });
                data.push(rowObj);
              }
            }
            loadedData[source.name] = data;
          }
        } catch (error) {
          console.error(`Erreur lors du chargement de ${source.name}:`, error);
        }
      }

      setAllData(loadedData);
      setAllHeaders(loadedHeaders);
    };

    loadAllData();
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results: SearchResultItem[] = [];
    const searchLower = searchTerm.toLowerCase().trim();

    Object.entries(allData).forEach(([sourceName, items]) => {
      items.forEach((item) => {
        // Rechercher dans toutes les valeurs de l'objet
        const matchFound = Object.values(item).some((value) => 
          String(value).toLowerCase().includes(searchLower)
        );
        
        if (matchFound) {
          results.push({ ...item, source: sourceName });
        }
      });
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  const getDisplayColumns = (): Column[] => {
    const baseColumns: Column[] = [
      { key: "source", label: "Source", width: "w-[150px]" },
    ];
    
    // Ajouter les 4 premières colonnes disponibles
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      const keys = Object.keys(firstResult).filter(k => k !== "source");
      keys.slice(0, 4).forEach(key => {
        baseColumns.push({
          key: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          width: "w-[180px]",
          truncate: true
        });
      });
    }
    
    return baseColumns;
  };

  const renderExpandedContent = (row: SearchResultItem) => {
    const keys = Object.keys(row).filter(k => k !== "source");
    
    return (
      <div className="grid grid-cols-2 gap-4 text-xs">
        {keys.map((key) => (
          <div key={key}>
            <p className="font-semibold text-foreground mb-1">{key}:</p>
            <p className="text-muted-foreground whitespace-pre-wrap">{row[key]}</p>
          </div>
        ))}
      </div>
    );
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
            <h2 className="mb-4 text-2xl font-bold text-foreground">Rechercher dans tous les référentiels</h2>
            <div className="flex gap-4 mb-6">
              <Input
                type="text"
                placeholder="Entrez un terme à rechercher (code, libellé, etc.)..."
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

            {searchTerm && searchResults.length === 0 && !isSearching && (
              <div className="mt-6 text-center text-muted-foreground">
                Aucun résultat trouvé pour "{searchTerm}"
              </div>
            )}
          </Card>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-12">
            <DataTableWithPagination
              title={`Résultats de recherche (${searchResults.length})`}
              data={searchResults}
              columns={getDisplayColumns()}
              searchFields={[]}
              loading={false}
              onEdit={() => {}}
              onDelete={() => {}}
              onAdd={() => {}}
              renderExpandedContent={renderExpandedContent}
              hideAddButton={true}
              hideSearchField={true}
            />
          </div>
        )}

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
