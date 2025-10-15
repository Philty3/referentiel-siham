import { NavLink } from "react-router-dom";
import { FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAllDataToExcel } from "@/lib/exportToExcel";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const navItems = [
  { name: "Accueil", path: "/" },
  { name: "Statuts contractuels", path: "/ref1" },
  { name: "Vacataires", path: "/ref2" },
  { name: "Positions", path: "/ref3" },
  { name: "Corps", path: "/ref4" },
  { name: "Grades", path: "/grades" },
  { name: "Congés/absences", path: "/conges" },
];

export const Navigation = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    toast({
      title: "Export en cours...",
      description: "Génération du fichier Excel en cours",
    });

    const success = await exportAllDataToExcel();
    
    setIsExporting(false);
    
    if (success) {
      toast({
        title: "Export réussi",
        description: "Le fichier Excel a été téléchargé avec succès",
      });
    } else {
      toast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de l'export",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Référentiel SIHAM</span>
        </div>
        
        <div className="flex items-center gap-4">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
          
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Export..." : "Export"}
          </Button>
        </div>
      </div>
    </nav>
  );
};
