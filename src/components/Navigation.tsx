import { NavLink } from "react-router-dom";
import { Download, Menu, X, ChevronDown, Lock, LogIn, Hexagon, Zap, Moon, Sun } from "lucide-react";
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
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
    toast({ title: "Export en cours...", description: "Génération du fichier Excel en cours" });
    const success = await exportAllDataToExcel();
    setIsExporting(false);
    if (success) {
      toast({ title: "Export réussi", description: "Le fichier Excel a été téléchargé avec succès" });
    } else {
      toast({ title: "Erreur d'export", description: "Une erreur s'est produite lors de l'export", variant: "destructive" });
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
        className={`sticky top-0 z-50 w-full border-b bg-card transition-all duration-500 ${
          scrolled
            ? "border-primary/30 shadow-[0_4px_30px_-4px_hsl(var(--neon-cyan)/0.2)]"
            : "border-border/50"
        }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <video
                  ref={videoRef}
                  src={logoVideo}
                  autoPlay
                  muted
                  playsInline
                  className={`h-12 w-12 object-cover rounded-lg ring-1 ring-primary/30 transition-all duration-500 group-hover:ring-primary/60 group-hover:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)] ${
                    scrolled ? "scale-90" : ""
                  }`}
                />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
              </div>
              <div className="flex flex-col">
                <span className={`font-display font-bold tracking-wider text-foreground transition-all duration-300 ${scrolled ? "text-sm" : "text-base"}`}>
                  RÉFÉRENTIEL
                </span>
                <span className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase">
                  SIHAM • v2.0
                </span>
              </div>
            </div>

            <NavLink
              to="/"
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-lg text-sm font-semibold font-body tracking-wide transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_hsl(var(--neon-cyan)/0.15)]"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent"
                }`
              }
            >
              <Zap className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
              Accueil
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 font-body font-semibold tracking-wide border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 ${
                  dropdownOpen ? "border-primary/50 bg-primary/10 text-primary" : ""
                }`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <Hexagon className="h-3.5 w-3.5" />
                Référentiels
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
              </Button>
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 top-[4.5rem] bg-background/60 backdrop-blur-md z-40 animate-in fade-in-0 duration-300"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-3 rounded-xl bg-card border border-primary/20 shadow-[0_8px_40px_-8px_hsl(var(--neon-cyan)/0.2)] z-50 animate-fade-in-up overflow-hidden"
                    style={{ width: "min(90vw, 720px)" }}
                  >
                    {/* Top glow bar */}
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4 px-1">
                        <Hexagon className="h-3.5 w-3.5 text-primary" />
                        <p className="text-xs font-display font-semibold text-primary tracking-[0.2em] uppercase">
                          Référentiels disponibles
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {navItems.map((item, i) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setDropdownOpen(false)}
                            style={{ animationDelay: `${i * 30}ms` }}
                            className={({ isActive }) =>
                              `group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body font-semibold transition-all duration-300 animate-fade-in-up opacity-0 ${
                                isActive
                                  ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_hsl(var(--neon-cyan)/0.1)]"
                                  : "text-foreground hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/20"
                              }`
                            }
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_6px_hsl(var(--neon-cyan)/0.6)] transition-all duration-300 shrink-0" />
                            {item.name}
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
              className="gap-2 font-body font-semibold tracking-wide border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
            >
              <Download className={`h-3.5 w-3.5 ${isExporting ? "animate-pulse" : ""}`} />
              {isExporting ? "Export..." : "Export"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDark(!isDark)}
              className="gap-2 font-body font-semibold tracking-wide border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
              title={isDark ? "Mode clair" : "Mode sombre"}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>

            {isAdmin ? (
              <NavLink to="/administration">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 font-body font-semibold tracking-wide border-accent/30 text-accent hover:border-accent/60 hover:bg-accent/10 transition-all duration-300"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Administration
                </Button>
              </NavLink>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLoginDialogOpen(true)}
                className="gap-1 text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                <LogIn className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground hover:text-primary transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-primary/10 bg-card animate-accordion-down">
            <div className="p-4 border-b border-primary/10">
              <p className="text-xs font-display font-semibold text-primary tracking-[0.15em] uppercase">
                Menu du référentiel
              </p>
            </div>
            <ul className="flex flex-col p-4 gap-1.5">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 rounded-lg text-sm font-body font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "text-foreground hover:bg-primary/5 hover:text-primary border border-transparent"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
              <li className="pt-2">
                <Button
                  onClick={() => { handleExport(); setMobileMenuOpen(false); }}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 font-body font-semibold border-primary/20"
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
        <DialogContent className="sm:max-w-sm glass-strong border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider text-primary">
              Accès Administration
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="border-primary/20 focus:border-primary/50 bg-background/50 font-body"
            />
            <Button type="submit" className="w-full font-body font-semibold tracking-wide bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
              Se connecter
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
