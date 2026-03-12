import { NavLink } from "react-router-dom";
import { Download, Menu, X, ChevronDown, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAllDataToExcel } from "@/lib/exportToExcel";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import logoVideo from "@/assets/logo-video.mp4";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdmin } from "@/contexts/AdminContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  { name: "Organigramme", path: "/organigramme" },
  { name: "Centres de coûts", path: "/centres-couts" },
];

export const Navigation = () => {
  const { toast } = useToast();
  const { isAdmin, login } = useAdmin();
  const [isExporting, setIsExporting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReversing, setIsReversing] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [password, setPassword] = useState("");

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
  const handleLogin = () => {
    if (login(password)) {
      setLoginDialogOpen(false);
      setPassword("");
      toast({ title: "Connecté", description: "Accès administration activé" });
    } else {
      toast({ title: "Erreur", description: "Mot de passe incorrect", variant: "destructive" });
    }
  };

  return (
    <>

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
              `relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 overflow-hidden ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-foreground hover:bg-muted hover:shadow-sm"
              }`
            }
          >
            <span className="relative z-10">Accueil</span>
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
              <>
                <div className="fixed inset-0 top-16 bg-foreground/30 backdrop-blur-sm z-40 animate-in fade-in-0 duration-200" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 rounded-xl border bg-secondary shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
                     style={{ width: 'min(90vw, 720px)' }}>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Référentiels disponibles</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {navItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setDropdownOpen(false)}
                          className={({ isActive }) =>
                            `group relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden ${
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-popover-foreground hover:bg-accent/10 hover:text-accent hover:translate-x-1"
                            }`
                          }
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300 shrink-0" />
                          <span className="relative z-10">{item.name}</span>
                          <span className="absolute inset-y-0 left-0 w-0 bg-accent/5 group-hover:w-full transition-all duration-300 rounded-lg" />
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              </>
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

          {isAdmin ? (
            <NavLink to="/administration">
              <Button variant="outline" size="sm" className="gap-2 hover:scale-105 transition-transform duration-200">
                <Lock className="h-4 w-4" />
                Administration
              </Button>
            </NavLink>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLoginDialogOpen(true)}
              className="gap-1 text-xs text-muted-foreground"
            >
              <LogIn className="h-3 w-3" />
            </Button>
          )}
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

    <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Accès Administration</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full">Se connecter</Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};
