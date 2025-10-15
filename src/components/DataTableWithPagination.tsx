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
import { Search, Edit, Trash2, ChevronDown, Plus } from "lucide-react";
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
}: DataTableWithPaginationProps<T>) {
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      setCurrentPage(1);
      return;
    }

    const filtered = data.filter((item) =>
      searchFields.some((field) =>
        String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data, searchFields]);

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
          <Button
            onClick={onAdd}
            size="sm"
            className="h-9 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        <div className="border-b bg-muted/20 p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[calc(100vh-200px)]">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Chargement des données...
            </div>
          ) : (
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="sticky left-0 z-10 w-[100px] bg-muted/50 font-bold px-2 py-0 text-xs">
                    Actions
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={`${column.width || 'w-auto'} ${
                        column.key === columns[0].key ? 'bg-muted/50 font-bold' : 'font-semibold'
                      } px-2 py-0 text-xs`}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="h-20 text-center text-sm text-muted-foreground">
                      Aucune donnée trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => {
                    const originalIndex = data.findIndex(item => 
                      JSON.stringify(item) === JSON.stringify(row)
                    );
                    const rowId = `${originalIndex}-${index}`;
                    const isExpanded = expandedRow === rowId;

                    return (
                      <>
                        <TableRow
                          key={index}
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => setExpandedRow(isExpanded ? null : rowId)}
                        >
                          <TableCell className="sticky left-0 z-10 bg-background px-2 py-0">
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
                              className={`px-2 py-0 text-xs ${
                                column.key === columns[0].key ? 'bg-background font-medium' : ''
                              } ${column.truncate ? `max-w-[${column.width || '200px'}] truncate` : ''}`}
                            >
                              {row[column.key]}
                            </TableCell>
                          ))}
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={columns.length + 1} className="p-0">
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
