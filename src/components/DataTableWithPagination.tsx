import { useState, useEffect } from "react";
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
import { Search, Edit, Trash2, ChevronDown, Plus, Star } from "lucide-react";
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
}: DataTableWithPaginationProps<T>) {
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesFirst, setShowFavoritesFirst] = useState(false);
  const { toast } = useToast();

  // Clé pour le localStorage basée sur le titre
  const storageKey = `favorites-${title.toLowerCase().replace(/\s+/g, '-')}`;

  // Charger les favoris depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Erreur lors du chargement des favoris:', e);
      }
    }
  }, [storageKey]);

  // Sauvegarder les favoris dans localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newFavorites)));
    setFavorites(newFavorites);
  };

  // Générer un ID unique pour un item
  const getItemId = (item: T, index: number) => {
    // Utiliser les premières colonnes comme identifiant unique
    const firstColumn = columns[0]?.key;
    return `${item[firstColumn]}-${index}`;
  };

  // Toggle favori
  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    saveFavorites(newFavorites);
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

    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, data, searchFields, showFavoritesFirst, favorites]);

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
        <div className="border-b bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {filteredData.length} entrées {filteredData.length !== data.length && `sur ${data.length}`}
            </p>
          </div>
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
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={`${column.width || 'w-auto'} ${
                        column.key === columns[0].key ? 'bg-muted/50 font-bold' : 'font-semibold'
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
                            <div className="flex items-center justify-center">
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
                          {columns.map((column) => (
                            <TableCell
                              key={column.key}
                              className={`px-2 py-0.5 text-xs ${
                                column.key === columns[0].key ? 'bg-background font-medium' : ''
                              } ${column.truncate ? 'max-w-xs truncate' : 'whitespace-normal break-words'}`}
                            >
                              {row[column.key]}
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
          <div className="border-t bg-muted/20 px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredData.length)} sur {filteredData.length} entrées
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-8 text-xs"
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
                Précédent
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
                Suivant
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 text-xs"
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
