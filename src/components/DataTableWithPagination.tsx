import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Edit, Trash2, ChevronDown, Plus, Star, Download, Circle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import logoUpCite from "@/assets/logo-up-cite.png";
import { useToast } from "@/hooks/use-toast";

interface Column {
  key: string;
  label: string;
  width?: string;
  truncate?: boolean;
}

interface DataTableWithPaginationProps<T extends Record<string, any>> {
  title: string;
  data: T[];
  columns: Column[];
  searchFields: string[];
  loading: boolean;
  onEdit: (item: T, index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
  renderExpandedContent: (item: T) => React.ReactNode;
  itemsPerPage?: number;
  hideAddButton?: boolean;
  hideSearchField?: boolean;
  onExport?: () => void;
  showUpCiteIcon?: boolean;
  showHighlighted?: boolean;
  highlightedField?: string;
  extraToolbarContent?: React.ReactNode;
  externalFilter?: (item: T) => boolean;
}

export function DataTableWithPagination<T extends Record<string, any>>({
  title,
  data,
  columns,
  searchFields,
  loading,
  onEdit,
  onDelete,
  onAdd,
  renderExpandedContent,
  itemsPerPage = 20,
  hideAddButton = false,
  hideSearchField = false,
  onExport,
  showUpCiteIcon = false,
  showHighlighted = false,
  highlightedField,
  extraToolbarContent,
  externalFilter,
}: DataTableWithPaginationProps<T>) {
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesFirst, setShowFavoritesFirst] = useState(false);
  const [showUpCiteFirst, setShowUpCiteFirst] = useState(false);
  const [showHighlightedOnly, setShowHighlightedOnly] = useState(false);
  const { toast } = useToast();

  // Clé pour la table basée sur le titre
  const tableName = `favorites-${title.toLowerCase().replace(/\s+/g, '-')}`;

  // Charger les favoris depuis la base de données
  useEffect(() => {
    const loadFavorites = async () => {
      const { data: rows, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('table_name', tableName);
      if (!error && rows) {
        setFavorites(new Set(rows.map((r: any) => r.item_id)));
      }
    };
    loadFavorites();
  }, [tableName]);

  // Sauvegarder un favori dans la base de données
  const saveFavorite = useCallback(async (itemId: string, add: boolean) => {
    if (add) {
      await supabase.from('favorites').upsert(
        { table_name: tableName, item_id: itemId },
        { onConflict: 'table_name,item_id' }
      );
    } else {
      await supabase.from('favorites')
        .delete()
        .eq('table_name', tableName)
        .eq('item_id', itemId);
    }
  }, [tableName]);

  // Générer un ID unique pour un item
  const getItemId = (item: T, index: number) => {
    const firstColumn = columns[0]?.key;
    return `${item[firstColumn]}-${index}`;
  };

  // Toggle favori
  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    const adding = !newFavorites.has(itemId);
    if (adding) {
      newFavorites.add(itemId);
    } else {
      newFavorites.delete(itemId);
    }
    setFavorites(newFavorites);
    saveFavorite(itemId, adding);
  };

  useEffect(() => {
    let result = [...data];

    // Filtrer par recherche
    if (searchTerm) {
      result = result.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtrer uniquement les lignes surlignées si activé
    if (showHighlightedOnly && highlightedField) {
      result = result.filter((item) => !!item[highlightedField]);
    }

    // Trier les favoris en premier si activé
    if (showFavoritesFirst) {
      result.sort((a, b) => {
        const aId = getItemId(a, data.indexOf(a));
        const bId = getItemId(b, data.indexOf(b));
        const aIsFav = favorites.has(aId);
        const bIsFav = favorites.has(bId);
        
        if (aIsFav && !bIsFav) return -1;
        if (!aIsFav && bIsFav) return 1;
        return 0;
      });
    }

    // Trier les codes UP Cité en premier si activé
    if (showUpCiteFirst) {
      result.sort((a, b) => {
        const aUp = !!a.code_up_cite;
        const bUp = !!b.code_up_cite;
        if (aUp && !bUp) return -1;
        if (!aUp && bUp) return 1;
        return 0;
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, data, searchFields, showFavoritesFirst, showUpCiteFirst, showHighlightedOnly, favorites]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="mx-auto w-full max-w-[99vw] px-2 py-4">
      <Card className="overflow-hidden shadow-lg">
        <div className="border-b bg-gradient-to-r from-primary/10 to-accent/10 px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-foreground">{title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {filteredData.length} entrées {filteredData.length !== data.length && `sur ${data.length}`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {extraToolbarContent}
            {onExport && (
              <Button
                onClick={onExport}
                size="sm"
                variant="outline"
                className="h-9 gap-1.5"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
            {!hideAddButton && (
              <Button
                onClick={onAdd}
                size="sm"
                className="h-9 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            )}
          </div>
        </div>

        {!hideSearchField && (
          <div className="border-b bg-muted/20 p-3">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Button
                size="sm"
                variant={showFavoritesFirst ? "default" : "outline"}
                onClick={() => setShowFavoritesFirst(!showFavoritesFirst)}
                className="h-9 gap-2 whitespace-nowrap"
              >
                <Star className={`h-4 w-4 ${showFavoritesFirst ? 'fill-current' : ''}`} />
                Favoris en premier
              </Button>
              {showUpCiteIcon && (
                <Button
                  size="sm"
                  variant={showUpCiteFirst ? "default" : "outline"}
                  onClick={() => setShowUpCiteFirst(!showUpCiteFirst)}
                  className="h-9 gap-2 whitespace-nowrap"
                >
                  <img src={logoUpCite} alt="UP Cité" className="h-4 w-4" />
                  Codes UP Cité
                </Button>
              )}
              {showHighlighted && highlightedField && (
                <Button
                  size="sm"
                  variant={showHighlightedOnly ? "default" : "outline"}
                  onClick={() => setShowHighlightedOnly(!showHighlightedOnly)}
                  className="h-9 gap-2 whitespace-nowrap"
                >
                  <Circle className="h-3 w-3 fill-destructive text-destructive" />
                  Lignes signalées
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto max-h-[calc(100vh-200px)]">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Chargement des données...
            </div>
          ) : (
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="sticky left-0 z-10 w-[60px] bg-muted/50 font-bold px-2 py-1 text-xs">
                    Fav.
                  </TableHead>
                  <TableHead className="sticky left-[60px] z-10 w-[100px] bg-muted/50 font-bold px-2 py-1 text-xs">
                    Actions
                  </TableHead>
                  {columns.map((column, colIndex) => (
                    <TableHead
                      key={column.key}
                      className={`${column.width || 'w-auto'} ${
                        colIndex === 0 ? 'sticky left-[160px] z-10 bg-muted/50 font-bold' : 'font-semibold'
                      } px-2 py-1 text-xs`}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="h-20 text-center text-sm text-muted-foreground">
                      Aucune donnée trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => {
                    const originalIndex = data.findIndex(item => 
                      JSON.stringify(item) === JSON.stringify(row)
                    );
                    const itemId = getItemId(row, originalIndex);
                    const isFavorite = favorites.has(itemId);
                    const rowId = `${originalIndex}-${index}`;
                    const isExpanded = expandedRow === rowId;

                    return (
                      <>
                        <TableRow
                          key={index}
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => setExpandedRow(isExpanded ? null : rowId)}
                        >
                          <TableCell className="sticky left-0 z-10 bg-background px-2 py-0.5">
                            <div className="flex items-center justify-center gap-1">
                              {showHighlighted && highlightedField && row[highlightedField] && (
                                <Circle className="h-2.5 w-2.5 fill-destructive text-destructive flex-shrink-0" />
                              )}
                              <Checkbox
                                checked={isFavorite}
                                onCheckedChange={(checked) => {
                                  toggleFavorite(itemId);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-4 w-4"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="sticky left-[60px] z-10 bg-background px-2 py-0.5">
                            <div className="flex gap-0.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(row, originalIndex);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(originalIndex);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                              >
                                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </Button>
                            </div>
                          </TableCell>
                          {columns.map((column, colIndex) => (
                            <TableCell
                              key={column.key}
                              className={`px-2 py-0.5 text-xs ${
                                colIndex === 0 ? 'sticky left-[160px] z-10 bg-background font-medium whitespace-nowrap' : 'whitespace-normal break-words'
                              } ${column.truncate ? 'max-w-xs truncate' : ''}`}
                            >
                              <span className="relative inline-flex items-center">
                                {colIndex === 0 && showUpCiteIcon && row.code_up_cite && (
                                  <img src={logoUpCite} alt="UP Cité" className="absolute -left-5 h-4 w-4 flex-shrink-0" />
                                )}
                                {row[column.key]}
                              </span>
                            </TableCell>
                          ))}
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={columns.length + 2} className="p-0">
                              <div className="p-4 animate-accordion-down">
                                {renderExpandedContent(row)}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && filteredData.length > 0 && (
          <div className="border-t bg-muted/20 px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              {startIndex + 1}-{Math.min(endIndex, filteredData.length)} / {filteredData.length}
            </div>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-8 text-xs hidden sm:inline-flex"
              >
                Première
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 text-xs"
              >
                ←
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => goToPage(pageNum)}
                      className="h-8 w-8 text-xs p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 text-xs"
              >
                →
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 text-xs hidden sm:inline-flex"
              >
                Dernière
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
