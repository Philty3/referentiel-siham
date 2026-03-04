import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchAllRows } from "@/lib/supabaseUtils";
import { ChevronDown, ChevronRight, Search, ZoomIn, ZoomOut, Maximize2, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UONode {
  code_uo: string;
  libelle_court: string;
  libelle_long: string;
  code_uo_mere: string;
  type: string;
  niveau: string;
  statut: string;
  children: UONode[];
}

const OrgNodeCard = ({
  node,
  isExpanded,
  onToggle,
  onSelect,
  isSelected,
  isHighlighted,
  depth,
}: {
  node: UONode;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
  isHighlighted: boolean;
  depth: number;
}) => {
  const hasChildren = node.children.length > 0;
  
  return (
    <div
      className={`
        relative rounded-lg border-2 px-3 py-2 cursor-pointer transition-all duration-200 min-w-[180px] max-w-[240px]
        ${isSelected 
          ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30" 
          : isHighlighted 
            ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md" 
            : "border-border bg-card hover:border-primary/50 hover:shadow-md"
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start gap-1.5">
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="mt-0.5 p-0.5 rounded hover:bg-muted transition-colors flex-shrink-0"
          >
            {isExpanded 
              ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> 
              : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            }
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono text-muted-foreground leading-tight">{node.code_uo}</p>
          <p className="text-xs font-semibold text-foreground leading-tight mt-0.5 line-clamp-2">
            {node.libelle_court || node.libelle_long}
          </p>
          {node.type && (
            <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {node.type}
            </span>
          )}
        </div>
      </div>
      {hasChildren && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground bg-card px-1 rounded">
          {node.children.length}
        </div>
      )}
    </div>
  );
};

const TreeBranch = ({
  node,
  expandedNodes,
  toggleNode,
  selectedNode,
  setSelectedNode,
  highlightedNodes,
  depth = 0,
}: {
  node: UONode;
  expandedNodes: Set<string>;
  toggleNode: (code: string) => void;
  selectedNode: string | null;
  setSelectedNode: (code: string | null) => void;
  highlightedNodes: Set<string>;
  depth?: number;
}) => {
  const isExpanded = expandedNodes.has(node.code_uo);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard
        node={node}
        isExpanded={isExpanded}
        onToggle={() => toggleNode(node.code_uo)}
        onSelect={() => setSelectedNode(node.code_uo === selectedNode ? null : node.code_uo)}
        isSelected={selectedNode === node.code_uo}
        isHighlighted={highlightedNodes.has(node.code_uo)}
        depth={depth}
      />
      
      {hasChildren && isExpanded && (
        <>
          {/* Vertical connector from parent */}
          <div className="w-px h-4 bg-border" />
          
          {/* Horizontal connector bar */}
          {node.children.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div 
                className="h-px bg-border absolute top-0"
                style={{
                  left: `${100 / (node.children.length * 2)}%`,
                  right: `${100 / (node.children.length * 2)}%`,
                }}
              />
            </div>
          )}
          
          {/* Children */}
          <div className="flex gap-3 pt-0">
            {node.children.map((child) => (
              <div key={child.code_uo} className="flex flex-col items-center">
                <div className="w-px h-4 bg-border" />
                <TreeBranch
                  node={child}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  selectedNode={selectedNode}
                  setSelectedNode={setSelectedNode}
                  highlightedNodes={highlightedNodes}
                  depth={depth + 1}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Vertical tree list view for large datasets
const TreeListItem = ({
  node,
  expandedNodes,
  toggleNode,
  selectedNode,
  setSelectedNode,
  highlightedNodes,
  depth = 0,
}: {
  node: UONode;
  expandedNodes: Set<string>;
  toggleNode: (code: string) => void;
  selectedNode: string | null;
  setSelectedNode: (code: string | null) => void;
  highlightedNodes: Set<string>;
  depth?: number;
}) => {
  const isExpanded = expandedNodes.has(node.code_uo);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNode === node.code_uo;
  const isHighlighted = highlightedNodes.has(node.code_uo);

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-md transition-colors text-sm
          ${isSelected ? "bg-primary/10 text-primary font-semibold" : ""}
          ${isHighlighted ? "bg-amber-50 dark:bg-amber-900/20" : ""}
          hover:bg-muted
        `}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={() => setSelectedNode(node.code_uo === selectedNode ? null : node.code_uo)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); toggleNode(node.code_uo); }}
            className="p-0.5 rounded hover:bg-muted-foreground/10 flex-shrink-0"
          >
            {isExpanded
              ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            }
          </button>
        ) : (
          <Minus className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0 ml-0.5" />
        )}
        <span className="font-mono text-[10px] text-muted-foreground w-24 flex-shrink-0">{node.code_uo}</span>
        <span className="truncate">{node.libelle_court || node.libelle_long}</span>
        {hasChildren && (
          <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">({node.children.length})</span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeListItem
              key={child.code_uo}
              node={child}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              highlightedNodes={highlightedNodes}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Organigramme = () => {
  const [data, setData] = useState<UONode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [allNodesMap, setAllNodesMap] = useState<Map<string, UONode>>(new Map());
  const [viewMode, setViewMode] = useState<"tree" | "list">("list");
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: rows, error } = await fetchAllRows("uo", "code_uo");
      if (error) {
        toast({ title: "Erreur", description: "Impossible de charger les UO.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Build node map
      const nodeMap = new Map<string, UONode>();
      (rows || []).forEach((r: any) => {
        nodeMap.set(r.code_uo || "", {
          code_uo: r.code_uo || "",
          libelle_court: r.libelle_court || "",
          libelle_long: r.libelle_long || "",
          code_uo_mere: r.code_uo_mere || "",
          type: r.type || "",
          niveau: r.niveau || "",
          statut: r.statut || "",
          children: [],
        });
      });

      setAllNodesMap(nodeMap);

      // Build tree
      const roots: UONode[] = [];
      nodeMap.forEach((node) => {
        if (node.code_uo_mere && nodeMap.has(node.code_uo_mere) && node.code_uo_mere !== node.code_uo) {
          nodeMap.get(node.code_uo_mere)!.children.push(node);
        } else {
          roots.push(node);
        }
      });

      // Sort children at each level
      const sortChildren = (nodes: UONode[]) => {
        nodes.sort((a, b) => a.code_uo.localeCompare(b.code_uo));
        nodes.forEach(n => sortChildren(n.children));
      };
      sortChildren(roots);

      setData(roots);
      // Expand first level by default
      const firstLevel = new Set<string>();
      roots.forEach(r => firstLevel.add(r.code_uo));
      setExpandedNodes(firstLevel);
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleNode = useCallback((code: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const expandAll = () => {
    const all = new Set<string>();
    allNodesMap.forEach((_, key) => all.add(key));
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    const firstLevel = new Set<string>();
    data.forEach(r => firstLevel.add(r.code_uo));
    setExpandedNodes(firstLevel);
  };

  // Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setHighlightedNodes(new Set());
      return;
    }
    const term = searchTerm.toLowerCase();
    const matches = new Set<string>();
    const pathsToExpand = new Set<string>();

    // Find matching nodes and their ancestor paths
    const findPath = (node: UONode): boolean => {
      const nodeMatches =
        node.code_uo.toLowerCase().includes(term) ||
        node.libelle_court.toLowerCase().includes(term) ||
        node.libelle_long.toLowerCase().includes(term);

      let childMatches = false;
      node.children.forEach(child => {
        if (findPath(child)) childMatches = true;
      });

      if (nodeMatches) {
        matches.add(node.code_uo);
      }
      if (nodeMatches || childMatches) {
        pathsToExpand.add(node.code_uo);
        return true;
      }
      return false;
    };

    data.forEach(root => findPath(root));
    setHighlightedNodes(matches);
    setExpandedNodes(prev => new Set([...prev, ...pathsToExpand]));
  }, [searchTerm, data]);

  const selectedNodeData = selectedNode ? allNodesMap.get(selectedNode) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de l'organigramme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Organigramme des UO</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Structure hiérarchique des Unités Organisationnelles ({allNodesMap.size} unités, {data.length} racines)
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une UO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={expandAll}>Tout déplier</Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>Tout replier</Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            Liste
          </Button>
          <Button
            variant={viewMode === "tree" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("tree")}
          >
            Arbre
          </Button>
          {viewMode === "tree" && (
            <>
              <div className="h-6 w-px bg-border mx-1" />
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(1)}>
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {highlightedNodes.size > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
          {highlightedNodes.size} résultat(s) trouvé(s)
        </p>
      )}

      <div className="flex gap-4">
        {/* Tree / List view */}
        <div className="flex-1 border rounded-lg bg-card overflow-hidden">
          {viewMode === "list" ? (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-2">
                {data.map((root) => (
                  <TreeListItem
                    key={root.code_uo}
                    node={root}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    highlightedNodes={highlightedNodes}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="overflow-auto h-[calc(100vh-280px)] p-6" ref={containerRef}>
              <div
                className="inline-flex flex-col items-center gap-0 min-w-max"
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
              >
                {data.map((root) => (
                  <div key={root.code_uo} className="mb-8">
                    <TreeBranch
                      node={root}
                      expandedNodes={expandedNodes}
                      toggleNode={toggleNode}
                      selectedNode={selectedNode}
                      setSelectedNode={setSelectedNode}
                      highlightedNodes={highlightedNodes}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedNodeData && (
          <div className="w-72 border rounded-lg bg-card p-4 flex-shrink-0 h-fit sticky top-24">
            <h3 className="text-sm font-bold text-foreground mb-3">Détails de l'UO</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { label: "Code UO", value: selectedNodeData.code_uo },
                { label: "Libellé court", value: selectedNodeData.libelle_court },
                { label: "Libellé long", value: selectedNodeData.libelle_long },
                { label: "UO mère", value: selectedNodeData.code_uo_mere },
                { label: "Type", value: selectedNodeData.type },
                { label: "Niveau", value: selectedNodeData.niveau },
                { label: "Statut", value: selectedNodeData.statut },
                { label: "Sous-unités", value: String(selectedNodeData.children.length) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-semibold text-muted-foreground">{label}</p>
                  <p className="text-foreground">{value || "—"}</p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 text-xs"
              onClick={() => setSelectedNode(null)}
            >
              Fermer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Organigramme;
