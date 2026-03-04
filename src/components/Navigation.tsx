import { NavLink } from "react-router-dom";
import { Download, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAllDataToExcel } from "@/lib/exportToExcel";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import logoVideo from "@/assets/logo-video.mp4";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { name: "Statuts contractuels", path: "/ref1" },
  { name: "Vacataires", path: "/ref2" },
  { name: "Hébergés", path: "/heberges" },
  { name: "Actes", path: "/actes" },
  { name: "Positions", path: "/ref3" },
  { name: "Corps", path: "/ref4" },
  { name: "Grades", path: "/grades" },
  { name: "Congés/absences", path: "/conges" },
  { name: "Emplois", path: "/emplois" },
  { name: "Modalités de service", path: "/modalites" },
  { name: "Diplômes", path: "/diplomes" },
  { name: "Établissements", path: "/etablissements" },
  { name: "UO", path: "/uo" },
];

export const Navigation = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReversing, setIsReversing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isReversing && video.currentTime >= video.duration - 0.1) {
        setIsReversing(true);
        video.pause();
        const reverseInterval = setInterval(() => {
          if (video.currentTime <= 0.1) {
            clearInterval(reverseInterval);
            setIsReversing(false);
            video.play();
          } else {
            video.currentTime = Math.max(0, video.currentTime - 0.033);
          }
        }, 33);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isReversing]);

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
            <video 
              ref={videoRef}
              src={logoVideo}
              autoPlay
              muted
              playsInline
              className={`h-14 w-14 object-cover rounded-full transition-transform duration-300 ${scrolled ? "scale-90" : ""}`}
            />
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
        <div className="hidden lg:flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Référentiels
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover shadow-lg z-50">
                <ScrollArea className="h-[360px]">
                  <div className="p-2 flex flex-col gap-0.5">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setDropdownOpen(false)}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-popover-foreground hover:bg-muted"
                          }`
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          
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
