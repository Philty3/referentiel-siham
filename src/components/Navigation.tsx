import { NavLink } from "react-router-dom";
import { FileSpreadsheet } from "lucide-react";

const navItems = [
  { name: "Accueil", path: "/" },
  { name: "Statuts contractuels", path: "/ref1" },
  { name: "Vacataires", path: "/ref2" },
  { name: "Positions", path: "/ref3" },
  { name: "Corps", path: "/ref4" },
];

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Référentiel SIHAM</span>
        </div>
        
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
      </div>
    </nav>
  );
};
