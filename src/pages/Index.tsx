import { useState, useEffect } from "react";
import { FileSpreadsheet, Database, Search, FileText, Hexagon, ChevronRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DataTableWithPagination } from "@/components/DataTableWithPagination";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/supabaseUtils";
import { useToast } from "@/hooks/use-toast";

interface Column {
  key: string;
  label: string;
  width?: string;
  truncate?: boolean;
}

interface SearchResultItem {
  id?: string;
  source: string;
  _tableName: string;
  [key: string]: any;
}

// Configuration for each data source: source label, supabase table, fields, order column
const dataSourcesConfig = [
  {
    label: "Statuts contractuels",
    table: "contractuels" as const,
    orderBy: "code_siham",
    fields: [
      { key: "code_siham", label: "Code Siham" }, { key: "categorie_siham", label: "Catégorie Siham" },
      { key: "libelle_court_siham", label: "Libellé court Siham" }, { key: "libelle_long_siham", label: "Libellé long Siham" },
      { key: "date_deb", label: "Date Deb" }, { key: "date_fin", label: "Date Fin" },
      { key: "references_reglementaires", label: "Références réglementaires" }, { key: "droit_public_prive", label: "Droit public/privé" },
      { key: "cas_utilisation", label: "Cas d'utilisation" }, { key: "permanent_temporaire", label: "Permanent/temporaire" },
      { key: "regle_durees", label: "Règle de durées" }, { key: "type_contrat", label: "Type de contrat" },
      { key: "cat_fp", label: "Cat. FP" }, { key: "sous_categorie", label: "Sous catégorie" },
      { key: "obligations_statutaires_enseignement", label: "Obligations stat. enseignement" },
      { key: "bibliotheque_actes", label: "Bibliothèque des actes" }, { key: "infos_complementaires", label: "Infos complémentaires" },
      { key: "mode_gestion_remuneration", label: "Mode gestion/rémunération" },
      { key: "grade_tg", label: "Grade TG" }, { key: "pseudo_grade", label: "Pseudo grade" },
      { key: "echelon", label: "Echelon" }, { key: "indice_brut_majore_force", label: "Indice brut/majoré forcé" },
      { key: "situation_statutaire", label: "Situation statutaire" }, { key: "regime_securite_sociale", label: "Régime sécu. sociale" },
      { key: "regime_retraite", label: "Régime retraite" }, { key: "code_libelle_harpege", label: "Code/Libellé Harpège" },
      { key: "rg_pour_rdd", label: "RG pour RDD" }, { key: "code_cisirh", label: "Code CISIRH" },
      { key: "libelle_cisirh", label: "Libellé CISIRH" },
    ],
  },
  {
    label: "Vacataires",
    table: "vacataires" as const,
    orderBy: "code_siham",
    fields: [
      { key: "code_siham", label: "Code Siham" }, { key: "categorie_siham", label: "Catégorie Siham" },
      { key: "libelle_court_siham", label: "Libellé court Siham" }, { key: "libelle_long_siham", label: "Libellé long Siham" },
      { key: "date_deb", label: "Date Deb" }, { key: "date_fin", label: "Date Fin" },
      { key: "references_reglementaires", label: "Références réglementaires" }, { key: "cas_utilisation", label: "Cas d'utilisation" },
      { key: "permanent_temporaire", label: "Permanent/temporaire" }, { key: "regle_durees", label: "Règle de durées" },
      { key: "type_contrat", label: "Type de contrat" }, { key: "cat_fp", label: "Cat. FP" },
      { key: "sous_categorie", label: "Sous catégorie" }, { key: "obligations_statutaires_enseignement", label: "Obligations stat. enseignement" },
      { key: "bibliotheque_actes", label: "Bibliothèque des actes" }, { key: "infos_complementaires", label: "Infos complémentaires" },
      { key: "mode_gestion_remuneration", label: "Mode gestion/rémunération" }, { key: "grade_tg", label: "Grade TG" },
      { key: "pseudo_grade", label: "Pseudo grade" }, { key: "echelon", label: "Echelon" },
      { key: "indice_brut_majore_force", label: "Indice brut/majoré forcé" }, { key: "situation_statutaire", label: "Situation statutaire" },
      { key: "regime_securite_sociale", label: "Régime sécu. sociale" }, { key: "regime_retraite", label: "Régime retraite" },
      { key: "code_libelle_harpege", label: "Code/Libellé Harpège" }, { key: "rg_pour_rdd", label: "RG pour RDD" },
      { key: "code_cisirh", label: "Code CISIRH" }, { key: "libelle_cisirh", label: "Libellé CISIRH" },
    ],
  },
  {
    label: "Positions",
    table: "positions" as const,
    orderBy: "code",
    fields: [
      { key: "code", label: "Code" }, { key: "libelle_court", label: "Libellé court" }, { key: "libelle_long", label: "Libellé long" },
      { key: "libelle_long_bis", label: "Libellé long (bis)" }, { key: "position_statutaire", label: "Position statutaire" },
      { key: "temoin_position_entree_sortie", label: "Témoin position entrée/sortie" },
      { key: "temoin_lien_enfant_obligatoire", label: "Témoin lien enfant obligatoire" },
      { key: "tem_exclusion_inclusion_reglem", label: "Tém exclusion/inclusion réglem." },
      { key: "date_debut_validite", label: "Date début validité" }, { key: "date_fin_validite", label: "Date fin validité" },
    ],
  },
  {
    label: "Corps",
    table: "corps" as const,
    orderBy: "code",
    fields: [
      { key: "code", label: "Code" }, { key: "libelle", label: "Libellé" }, { key: "libelle_long", label: "Libellé long" },
      { key: "libelle_long_bis", label: "Libellé long (bis)" }, { key: "libelle_court_bis", label: "Libellé court (bis)" },
      { key: "tem_exclusion_inclusion_reglem", label: "Tém exclusion/inclusion réglem." },
      { key: "date_debut_validite", label: "Date début validité" }, { key: "date_fin_validite", label: "Date fin validité" },
      { key: "code_filiere", label: "Code filière" }, { key: "filiere", label: "Filière" },
      { key: "nombres_grades", label: "Nombres de grades" }, { key: "corps_extinction", label: "Corps en extinction" },
      { key: "code_categorie_statutaire", label: "Code catégorie statutaire" }, { key: "categorie_statutaire", label: "Catégorie statutaire" },
      { key: "service_statutaire", label: "Service statutaire" },
    ],
  },
  {
    label: "Grades",
    table: "grades" as const,
    orderBy: "code",
    fields: [
      { key: "code", label: "Code" }, { key: "libelle", label: "Libellé" }, { key: "libelle_long", label: "Libellé long" },
      { key: "categorie_statutaire", label: "Catégorie statutaire" }, { key: "code_filiere", label: "Code filière" },
      { key: "filiere", label: "Filière" }, { key: "code_corps_cadre_emploi", label: "Code corps/cadre emploi" },
      { key: "corps_cadre_emploi", label: "Corps/cadre emploi" }, { key: "code_groupe_hierarchique", label: "Code groupe hiérarchique" },
      { key: "groupe_hierarchique", label: "Groupe hiérarchique" }, { key: "age_limite_depart_retraite", label: "Age limite retraite" },
      { key: "tem_exclusion_inclusion_reglem", label: "Tém exclusion/inclusion réglem." },
      { key: "date_debut_validite", label: "Date début validité" }, { key: "date_fin_validite", label: "Date fin validité" },
      { key: "code_tresorerie_generale", label: "Code trésorerie générale" },
    ],
  },
  {
    label: "Congés/absences",
    table: "conges" as const,
    orderBy: "code",
    fields: [
      { key: "code", label: "Code" }, { key: "libelle_long", label: "Libellé long" }, { key: "libelle_court", label: "Libellé court" },
      { key: "tem_exclusion_inclusion_reglem", label: "Tém exclusion/inclusion réglem." },
      { key: "date_debut_validite", label: "Date début validité" }, { key: "date_fin_validite", label: "Date fin validité" },
    ],
  },
  {
    label: "Emplois",
    table: "emplois" as const,
    orderBy: "cle",
    fields: [
      { key: "cle", label: "Clé" }, { key: "emploi", label: "Emploi" }, { key: "libelle_emploi", label: "Libellé emploi" },
      { key: "date_effet", label: "Date d'effet" }, { key: "classification_emploi", label: "Classification emploi" },
      { key: "code_plus_utiliser", label: "Code à ne plus utiliser" },
    ],
  },
  {
    label: "Modalités de service",
    table: "modalites" as const,
    orderBy: "code",
    fields: [
      { key: "code", label: "Code" }, { key: "libelle", label: "Libellé" }, { key: "libelle_long", label: "Libellé long" },
      { key: "libelle_long_bis", label: "Libellé long (bis)" }, { key: "temoin_temps_partiel", label: "Témoin temps partiel" },
      { key: "pourcentage_acquisition_conges", label: "% acquisition congés" }, { key: "pourcentage_prise_conge", label: "% prise congé" },
      { key: "temoin_lien_enfant_obligatoire", label: "Témoin lien enfant obligatoire" },
      { key: "tem_exclusion_inclusion", label: "Tém exclusion/inclusion" },
      { key: "date_deb_validite", label: "Date début validité" }, { key: "date_fin_validite", label: "Date fin validité" },
    ],
  },
  {
    label: "Diplômes",
    table: "diplomes" as const,
    orderBy: "code",
    fields: [
      { key: "code", label: "Code" }, { key: "libelle", label: "Libellé" }, { key: "libelle_long", label: "Libellé long" },
      { key: "echelle_internationale", label: "Echelle internationale" }, { key: "modele", label: "Modèle" },
      { key: "tem_exclusion_inclusion", label: "Tém exclusion/inclusion" },
      { key: "date_deb_validite", label: "Date début validité" }, { key: "date_fin_validite", label: "Date fin validité" },
    ],
  },
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allData, setAllData] = useState<{ [key: string]: SearchResultItem[] }>({});
  const [editingItem, setEditingItem] = useState<SearchResultItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadAllData = async () => {
      const loadedData: { [key: string]: SearchResultItem[] } = {};
      for (const source of dataSourcesConfig) {
        try {
          const { data: rows, error } = await fetchAllRows(source.table, source.orderBy);
          if (error) { console.error(`Erreur lors du chargement de ${source.label}:`, error); continue; }
          loadedData[source.label] = (rows || []).map((r: any) => {
            const item: SearchResultItem = { id: r.id, source: source.label, _tableName: source.table };
            source.fields.forEach(f => { item[f.key] = r[f.key] || ""; });
            return item;
          });
        } catch (error) { console.error(`Erreur lors du chargement de ${source.label}:`, error); }
      }
      setAllData(loadedData);
    };
    loadAllData();
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    const results: SearchResultItem[] = [];
    const searchLower = searchTerm.toLowerCase().trim();
    Object.entries(allData).forEach(([, items]) => {
      items.forEach((item) => {
        const matchFound = Object.entries(item).some(([key, value]) =>
          key !== "_tableName" && String(value).toLowerCase().includes(searchLower)
        );
        if (matchFound) results.push({ ...item });
      });
    });
    setSearchResults(results);
    setIsSearching(false);
  };

  const refreshData = async (tableName: string, sourceLabel: string) => {
    const source = dataSourcesConfig.find(s => s.table === tableName);
    if (!source) return;
    const { data: rows, error } = await supabase.from(source.table).select("*").order(source.orderBy);
    if (error) return;
    const newItems = (rows || []).map((r: any) => {
      const item: SearchResultItem = { id: r.id, source: source.label, _tableName: source.table };
      source.fields.forEach(f => { item[f.key] = r[f.key] || ""; });
      return item;
    });
    setAllData(prev => ({ ...prev, [sourceLabel]: newItems }));
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      const updatedAllData = { ...allData, [sourceLabel]: newItems };
      const results: SearchResultItem[] = [];
      Object.entries(updatedAllData).forEach(([, items]) => {
        items.forEach((item) => {
          const matchFound = Object.entries(item).some(([key, value]) =>
            key !== "_tableName" && String(value).toLowerCase().includes(searchLower)
          );
          if (matchFound) results.push({ ...item });
        });
      });
      setSearchResults(results);
    }
  };

  const getFieldsForSource = (sourceLabel: string) => {
    return dataSourcesConfig.find(s => s.label === sourceLabel)?.fields || [];
  };

  const handleEdit = (item: SearchResultItem) => { setEditingItem({ ...item }); setIsDialogOpen(true); };

  const handleSave = async () => {
    if (!editingItem || !editingItem.id) return;
    const tableName = editingItem._tableName;
    const sourceLabel = editingItem.source;
    const fieldsConfig = getFieldsForSource(sourceLabel);
    const payload: Record<string, any> = {};
    fieldsConfig.forEach(f => { payload[f.key] = editingItem[f.key] || ""; });
    const { error } = await supabase.from(tableName as any).update(payload).eq("id", editingItem.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Modifications enregistrées" });
    setIsDialogOpen(false);
    setEditingItem(null);
    refreshData(tableName, sourceLabel);
  };

  const handleDelete = async (item: SearchResultItem) => {
    if (!item.id) return;
    const tableName = item._tableName;
    const sourceLabel = item.source;
    const { error } = await supabase.from(tableName as any).delete().eq("id", item.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Élément supprimé", variant: "destructive" });
    refreshData(tableName, sourceLabel);
  };

  const getDisplayColumns = (): Column[] => {
    const baseColumns: Column[] = [{ key: "source", label: "Source", width: "w-[150px]" }];
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      const keys = Object.keys(firstResult).filter(k => k !== "source" && k !== "id" && k !== "_tableName");
      keys.slice(0, 4).forEach(key => {
        baseColumns.push({ key, label: key.charAt(0).toUpperCase() + key.slice(1), width: "w-[180px]", truncate: true });
      });
    }
    return baseColumns;
  };

  const renderExpandedContent = (row: SearchResultItem) => {
    const fieldsConfig = getFieldsForSource(row.source);
    const displayFields = fieldsConfig.length > 0 ? fieldsConfig : Object.keys(row)
      .filter(k => k !== "source" && k !== "id" && k !== "_tableName")
      .map(k => ({ key: k, label: k }));
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {displayFields.map((f) => (
          <div key={f.key}>
            <p className="font-semibold text-foreground mb-1 font-body">{f.label}:</p>
            <p className="text-muted-foreground whitespace-pre-wrap font-body">{row[f.key]}</p>
          </div>
        ))}
      </div>
    );
  };

  const editingFields = editingItem ? getFieldsForSource(editingItem.source) : [];

  const features = [
    {
      icon: Database,
      title: "Référentiels Centralisés",
      description: "Accédez à tous vos référentiels SIHAM en un seul endroit",
      gradient: "from-primary/20 to-neon-blue/10",
    },
    {
      icon: Search,
      title: "Recherche Rapide",
      description: "Trouvez rapidement les données dont vous avez besoin",
      gradient: "from-neon-blue/20 to-accent/10",
    },
    {
      icon: FileText,
      title: "Données Structurées",
      description: "Consultez vos données organisées de manière claire et professionnelle",
      gradient: "from-accent/20 to-primary/10",
    },
  ];

  const stats = [
    { label: "Référentiels", value: "15+" },
    { label: "Tables", value: "9" },
    { label: "Temps réel", value: "24/7" },
  ];

  return (
    <div className="min-h-[calc(100vh-4.5rem)] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 dot-grid-bg opacity-40 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative container mx-auto max-w-7xl px-3 sm:px-4 py-8 sm:py-16">
        {/* Hero Section */}
        <div className="mb-12 sm:mb-20 text-center">
          {/* Floating hexagon */}
          <div className="mb-6 sm:mb-8 relative inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-glow-pulse" />
              <div className="relative p-5 sm:p-6 rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-sm">
                <Hexagon className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-hex-spin" style={{ animationDuration: '30s' }} />
              </div>
            </div>
            {/* Orbiting dots */}
            <div className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 animate-hex-spin" style={{ animationDuration: '8s' }}>
              <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--neon-cyan))]" />
            </div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 animate-hex-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--neon-purple))]" />
            </div>
          </div>

          <h1 className="mb-4 sm:mb-5 text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-wider">
            <span className="text-foreground">RÉFÉRENTIEL</span>{" "}
            <span className="text-primary text-glow">SIHAM</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl text-muted-foreground font-body leading-relaxed">
            Plateforme de consultation des référentiels principaux SIHAM.
            <br className="hidden sm:block" />
            Accédez facilement à vos données de référence.
          </p>

          {/* Stats bar */}
          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-6 sm:gap-10">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="text-2xl sm:text-3xl font-display font-bold text-primary text-glow">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-body text-muted-foreground tracking-wide uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8 sm:mb-14 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="relative futuristic-card p-4 sm:p-6 overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />

            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-primary" />
              <h2 className="text-lg sm:text-xl font-display font-bold text-foreground tracking-wide">
                RECHERCHE GLOBALE
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Input
                type="text"
                placeholder="Entrez un terme à rechercher (code, libellé, etc.)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 border-primary/20 focus:border-primary/50 bg-background/50 font-body text-base"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-body font-semibold tracking-wide gap-2"
              >
                <Search className="h-4 w-4" />
                Rechercher
              </Button>
            </div>

            {searchTerm && searchResults.length === 0 && !isSearching && (
              <div className="mt-6 text-center text-muted-foreground font-body">
                Aucun résultat trouvé pour "{searchTerm}"
              </div>
            )}
          </div>
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
              onEdit={(item: SearchResultItem) => handleEdit(item)}
              onDelete={(index: number) => {
                const item = searchResults[index];
                if (item) handleDelete(item);
              }}
              onAdd={() => {}}
              renderExpandedContent={renderExpandedContent}
              hideAddButton={true}
              hideSearchField={true}
            />
          </div>
        )}

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-10 sm:mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative futuristic-card p-6 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className="mb-4 relative inline-block">
                  <div className="absolute inset-0 bg-primary/10 rounded-xl blur-md group-hover:bg-primary/20 transition-colors" />
                  <div className="relative p-3 rounded-xl border border-primary/20 group-hover:border-primary/40 transition-colors">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-display font-bold text-foreground tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground font-body text-base leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-body font-semibold opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300">
                  Explorer <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="relative rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          {/* Animated gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-neon-blue to-accent animate-border-rotate bg-[length:200%_200%]" />
          <div className="absolute inset-0 bg-background/10 backdrop-blur-sm" />

          {/* Scan lines */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-foreground/5 to-transparent h-[200%] animate-scan" />
          </div>

          <div className="relative p-6 sm:p-10 text-center">
            <Sparkles className="h-6 w-6 text-primary-foreground mx-auto mb-3 animate-float" />
            <h2 className="mb-3 sm:mb-4 text-xl sm:text-3xl font-display font-bold text-primary-foreground tracking-wider">
              EXPLOREZ VOS RÉFÉRENTIELS
            </h2>
            <p className="mb-2 text-sm sm:text-lg text-primary-foreground/80 font-body max-w-xl mx-auto">
              Utilisez le menu de navigation ci-dessus pour accéder aux différents référentiels
            </p>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto glass-strong border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider text-primary">
              Modifier l'élément ({editingItem?.source})
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {editingFields.map(f => (
                  <div key={f.key} className="space-y-2">
                    <Label htmlFor={f.key} className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">{f.label}</Label>
                    <Input
                      id={f.key}
                      value={editingItem[f.key] || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, [f.key]: e.target.value })}
                      className="text-sm font-body border-primary/20 focus:border-primary/50 bg-background/50"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-body border-border/50">Annuler</Button>
            <Button onClick={handleSave} className="font-body font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
