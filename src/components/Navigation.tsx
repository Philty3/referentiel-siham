import { NavLink } from "react-router-dom";
import { FileSpreadsheet, Download, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAllDataToExcel } from "@/lib/exportToExcel";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Statuts contractuels", path: "/ref1" },
  { name: "Vacataires", path: "/ref2" },
  { name: "Positions", path: "/ref3" },
  { name: "Corps", path: "/ref4" },
  { name: "Grades", path: "/grades" },
  { name: "Congés/absences", path: "/conges" },
  { name: "Emplois", path: "/emplois" },
  { name: "Modalités de service", path: "/modalites" },
  { name: "Diplômes", path: "/diplomes" },
  { name: "Établissements", path: "/etablissements" },
];

export const Navigation = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav 
      className={`sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md shadow-sm transition-all duration-300 ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className={`h-8 w-8 text-primary transition-transform duration-300 ${scrolled ? "scale-90" : ""}`} />
            <span className={`text-xl font-bold text-foreground transition-all duration-300 ${scrolled ? "text-lg" : ""}`}>
              Référentiel SIHAM
            </span>
          </div>
          
          {/* Bouton Accueil toujours visible */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-foreground hover:bg-muted hover:shadow-sm"
              }`
            }
          >
            Accueil
          </NavLink>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4">
          <ul className="flex items-center gap-1">
            {navItems.map((item, index) => (
              <li 
                key={item.path}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-fade-in"
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-foreground hover:bg-muted hover:shadow-sm"
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
            className="gap-2 hover:scale-105 transition-transform duration-200"
          >
            <Download className={`h-4 w-4 ${isExporting ? "animate-pulse" : ""}`} />
            {isExporting ? "Export..." : "Export"}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Menu du référentiel</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-card/95 backdrop-blur-md animate-accordion-down">
          <div className="p-4 border-b">
            <p className="text-xs font-semibold text-muted-foreground">Menu du référentiel</p>
          </div>
          <ul className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-foreground hover:bg-muted"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <Button
                onClick={() => {
                  handleExport();
                  setMobileMenuOpen(false);
                }}
                disabled={isExporting}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Download className={`h-4 w-4 ${isExporting ? "animate-pulse" : ""}`} />
                {isExporting ? "Export..." : "Export"}
              </Button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
