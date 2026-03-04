import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchAllRows } from "@/lib/supabaseUtils";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight, Search, ZoomIn, ZoomOut, Maximize2, Minus, Plus, Pencil, Trash2, ArrowUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UONode {
  id?: string;
  code_uo: string;
  libelle_court: string;
  libelle_long: string;
  code_uo_mere: string;
  type: string;
  niveau: string;
  statut: string;
  code_uai: string;
  responsable_composante: string;
  responsable_administratif: string;
  numero_voie: string;
  complement_adresse: string;
  adresse: string;
  code_postal: string;
  ville: string;
  code_uo_p5_p7: string;
  code_uo_bis: string;
  code_uo_site_associe: string;
  groupe_eval: string;
  groupe_phare: string;
  children: UONode[];
}

const uoFields: { key: keyof Omit<UONode, "children" | "id">; label: string }[] = [
  { key: "code_uo", label: "Code UO" },
  { key: "libelle_long", label: "Libellé long" },
  { key: "libelle_court", label: "Libellé court" },
  { key: "code_uo_mere", label: "Code UO mère" },
  { key: "type", label: "Type" },
  { key: "niveau", label: "Niveau" },
  { key: "code_uai", label: "Code UAI" },
  { key: "statut", label: "Statut" },
  { key: "responsable_composante", label: "Responsable composante" },
  { key: "responsable_administratif", label: "Responsable administratif" },
  { key: "numero_voie", label: "N° voie" },
  { key: "complement_adresse", label: "Complément adresse" },
  { key: "adresse", label: "Adresse" },
  { key: "code_postal", label: "Code postal" },
  { key: "ville", label: "Ville" },
  { key: "code_uo_p5_p7", label: "Code UO P5/P7" },
  { key: "code_uo_bis", label: "Code UO (bis)" },
  { key: "code_uo_site_associe", label: "Code UO site associé" },
  { key: "groupe_eval", label: "Groupe EVAL" },
  { key: "groupe_phare", label: "Groupe PhaRe" },
];

const emptyUO: Omit<UONode, "children"> = Object.fromEntries(
  uoFields.map(f => [f.key, ""])
) as any;

// Palette de couleurs bleu/teal pour les branches de niveau 2 (HSL)
const BRANCH_COLORS: [number, number, number][] = [
  [197, 100, 16],  // #003052
  [225, 50, 22],   // #1C2952
  [225, 75, 28],   // #101E6B
  [220, 80, 36],   // #1135A7
  [200, 100, 49],  // #0E4C94
  [210, 100, 50],  // #0080FE
  [207, 100, 46],  // #008ECD
  [214, 100, 40],  // #0F52BA
  [195, 100, 46],  // #008ECD
  [222, 53, 68],   // #6694F6
  [160, 40, 50],   // #4D516D
  [174, 100, 25],  // #008082
  [190, 40, 54],   // #95C9D9
  [195, 65, 85],   // #B1DFE6
  [165, 70, 60],   // #3CE1D0
  [185, 100, 80],  // #7EF9FF
  [175, 30, 55],   // #598BAF
  [190, 50, 75],   // #8AD0F0
  [180, 40, 66],   // #81D7D1
  [205, 40, 50],   // #4683B4
  [185, 40, 55],   // #57A0D2
  [200, 35, 46],   // #5097A4
  [215, 30, 49],   // #7285A5
  [215, 80, 72],   // #73C2FA
];

// Build a map: code_uo -> { color (HSL tuple), depth } where color comes from the niveau 2 ancestor
function buildColorMap(roots: UONode[]): Map<string, { color: [number, number, number]; depth: number }> {
  const map = new Map<string, { color: [number, number, number]; depth: number }>();
  let colorIndex = 0;

  const walk = (node: UONode, color: [number, number, number] | null, depth: number) => {
    const nodeLevel = parseInt(node.niveau, 10);
    if (nodeLevel === 2 || (isNaN(nodeLevel) && depth === 1)) {
      color = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];
      colorIndex++;
    }
    if (color !== null) {
      map.set(node.code_uo, { color, depth });
    }
    node.children.forEach(child => walk(child, color, depth + 1));
  };

  roots.forEach(root => walk(root, null, 0));
  return map;
}

// Dégrade la couleur de base du niveau 2 vers le blanc selon la profondeur
function degradeColor(base: [number, number, number], depth: number): [number, number, number] {
  // depth 0 = niveau 2 lui-même (couleur pleine), chaque niveau en dessous est plus clair
  const depthFromBranch = Math.max(0, depth - 1); // depth 1 = niveau 2
  const factor = Math.min(depthFromBranch * 0.12, 0.7); // max 70% vers le blanc
  const h = base[0];
  const s = base[1] * (1 - factor * 0.6); // désaturer progressivement
  const l = base[2] + (100 - base[2]) * factor; // éclaircir progressivement
  return [h, Math.max(10, s), Math.min(96, l)];
}

function getNodeColorStyle(color: [number, number, number], depth: number, isSelected: boolean, isHighlighted: boolean) {
  if (isSelected || isHighlighted) return {};
  const [h, s, l] = degradeColor(color, depth);
  const bgL = Math.min(96, l + 20); // fond plus clair
  const borderL = Math.min(80, l);
  return {
    backgroundColor: `hsl(${h}, ${Math.max(15, s * 0.7)}%, ${bgL}%)`,
    borderColor: `hsl(${h}, ${s}%, ${borderL}%)`,
  };
}

function getListItemColorStyle(color: [number, number, number], depth: number, isSelected: boolean, isHighlighted: boolean) {
  if (isSelected || isHighlighted) return {};
  const [h, s, l] = degradeColor(color, depth);
  const bgL = Math.min(96, l + 20);
  return {
    backgroundColor: `hsl(${h}, ${Math.max(15, s * 0.5)}%, ${bgL}%)`,
    borderLeft: `3px solid hsl(${h}, ${s}%, ${Math.min(70, l)}%)`,
  };
}

const OrgNodeCard = ({
  node,
  isExpanded,
  onToggle,
  onSelect,
  isSelected,
  isHighlighted,
  depth,
  colorStyle,
}: {
  node: UONode;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
  isHighlighted: boolean;
  depth: number;
  colorStyle?: React.CSSProperties;
}) => {
  const hasChildren = node.children.length > 0;
  
  return (
    <div
      data-uo={node.code_uo}
      className={`
        relative rounded-lg border-2 px-3 py-2 cursor-pointer transition-all duration-200 min-w-[180px] max-w-[240px]
        ${isSelected 
          ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30" 
          : isHighlighted 
            ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md" 
            : "hover:shadow-md"
        }
      `}
      style={!isSelected && !isHighlighted ? colorStyle : undefined}
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
            {node.libelle_long || node.libelle_court}
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
  colorMap,
  depth = 0,
}: {
  node: UONode;
  expandedNodes: Set<string>;
  toggleNode: (code: string) => void;
  selectedNode: string | null;
  setSelectedNode: (code: string | null) => void;
  highlightedNodes: Set<string>;
  colorMap: Map<string, { color: [number, number, number]; depth: number }>;
  depth?: number;
}) => {
  const isExpanded = expandedNodes.has(node.code_uo);
  const hasChildren = node.children.length > 0;
  const colorInfo = colorMap.get(node.code_uo);
  const isSelected = selectedNode === node.code_uo;
  const isHighlighted = highlightedNodes.has(node.code_uo);
  const colorStyle = colorInfo ? getNodeColorStyle(colorInfo.color, colorInfo.depth, isSelected, isHighlighted) : undefined;

  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard
        node={node}
        isExpanded={isExpanded}
        onToggle={() => toggleNode(node.code_uo)}
        onSelect={() => setSelectedNode(node.code_uo === selectedNode ? null : node.code_uo)}
        isSelected={isSelected}
        isHighlighted={isHighlighted}
        depth={depth}
        colorStyle={colorStyle}
      />
      
      {hasChildren && isExpanded && (
        <>
          <div className="w-px h-4 bg-border" />
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
                  colorMap={colorMap}
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
  colorMap,
  depth = 0,
}: {
  node: UONode;
  expandedNodes: Set<string>;
  toggleNode: (code: string) => void;
  selectedNode: string | null;
  setSelectedNode: (code: string | null) => void;
  highlightedNodes: Set<string>;
  colorMap: Map<string, { color: [number, number, number]; depth: number }>;
  depth?: number;
}) => {
  const isExpanded = expandedNodes.has(node.code_uo);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNode === node.code_uo;
  const isHighlighted = highlightedNodes.has(node.code_uo);
  const colorInfo = colorMap.get(node.code_uo);
  const itemStyle: React.CSSProperties = {
    paddingLeft: `${depth * 20 + 12}px`,
    ...(colorInfo ? getListItemColorStyle(colorInfo.color, colorInfo.depth, isSelected, isHighlighted) : {}),
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-md transition-colors text-sm
          ${isSelected ? "bg-primary/10 text-primary font-semibold" : ""}
          ${isHighlighted ? "bg-amber-50 dark:bg-amber-900/20" : ""}
          hover:bg-muted
        `}
        style={itemStyle}
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
        <span className="truncate">{node.libelle_long || node.libelle_court}</span>
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
              colorMap={colorMap}
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
  const [colorMap, setColorMap] = useState<Map<string, { color: [number, number, number]; depth: number }>>(new Map());
  const [zoom, setZoom] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Omit<UONode, "children"> | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const { toast } = useToast();
  const expandedRef = useRef<Set<string>>(new Set());
  const hasCentered = useRef(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await fetchAllRows("uo", "code_uo");
    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger les UO.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const nodeMap = new Map<string, UONode>();
    (rows || []).forEach((r: any) => {
      const node: UONode = { id: r.id, children: [] } as any;
      uoFields.forEach(f => { (node as any)[f.key] = r[f.key] || ""; });
      nodeMap.set(node.code_uo, node);
    });
    setAllNodesMap(nodeMap);

    const roots: UONode[] = [];
    nodeMap.forEach((node) => {
      if (node.code_uo_mere && nodeMap.has(node.code_uo_mere) && node.code_uo_mere !== node.code_uo) {
        nodeMap.get(node.code_uo_mere)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    const sortChildren = (nodes: UONode[]) => {
      nodes.sort((a, b) => a.code_uo.localeCompare(b.code_uo));
      nodes.forEach(n => sortChildren(n.children));
    };
    sortChildren(roots);
    setData(roots);
    setColorMap(buildColorMap(roots));

    if (expandedRef.current.size === 0) {
      const firstLevel = new Set<string>();
      roots.forEach(r => firstLevel.add(r.code_uo));
      setExpandedNodes(firstLevel);
      expandedRef.current = firstLevel;
    }
    setLoading(false);
  }, []);

  // Center on UDP0000000 after initial load
  useEffect(() => {
    if (!loading && data.length > 0 && !hasCentered.current && viewMode === "tree") {
      hasCentered.current = true;
      setTimeout(() => {
        const el = containerRef.current;
        if (!el) return;
        const target = el.querySelector('[data-uo="UDP0000000"]');
        if (target) {
          target.scrollIntoView({ block: "center", inline: "center" });
        } else {
          // fallback: scroll to center of content
          el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
          el.scrollTop = 0;
        }
      }, 100);
    }
  }, [loading, data, viewMode]);

  // Also center when switching to tree mode
  useEffect(() => {
    if (viewMode === "tree" && data.length > 0) {
      setTimeout(() => {
        const el = containerRef.current;
        if (!el) return;
        const target = el.querySelector('[data-uo="UDP0000000"]');
        if (target) {
          target.scrollIntoView({ block: "center", inline: "center" });
        }
      }, 100);
    }
  }, [viewMode]);

  // Mouse drag to pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    el.scrollLeft = dragStart.current.scrollLeft - dx;
    el.scrollTop = dragStart.current.scrollTop - dy;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    const el = containerRef.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.userSelect = "";
    }
  }, []);

  // Mouse wheel to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(z => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        return Math.min(2.5, Math.max(0.2, z + delta));
      });
    }
  }, []);

  useEffect(() => {
    // Also handle native wheel for preventDefault to work
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [viewMode]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEdit = (node: UONode) => {
    const { children, ...rest } = node;
    setEditingItem({ ...rest });
    setIsNewItem(false);
    setIsDialogOpen(true);
  };

  const handleAdd = (parentCodeUo?: string) => {
    setEditingItem({ ...emptyUO, code_uo_mere: parentCodeUo || "" });
    setIsNewItem(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    const { id, ...payload } = editingItem;
    if (!isNewItem && id) {
      const { error } = await supabase.from("uo").update(payload).eq("id", id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Modifications enregistrées" });
    } else {
      const { error } = await supabase.from("uo").insert(payload);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "UO ajoutée" });
    }
    setIsDialogOpen(false);
    setEditingItem(null);
    expandedRef.current = expandedNodes;
    await loadData();
  };

  const handleDelete = async (node: UONode) => {
    if (!node.id) return;
    if (node.children.length > 0) {
      toast({ title: "Suppression impossible", description: "Cette UO a des sous-unités. Supprimez-les d'abord.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("uo").delete().eq("id", node.id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "UO supprimée", variant: "destructive" });
    setSelectedNode(null);
    expandedRef.current = expandedNodes;
    await loadData();
  };

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

  // Search: build a filtered tree containing only matching nodes + ancestors
  const [filteredData, setFilteredData] = useState<UONode[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setHighlightedNodes(new Set());
      setFilteredData([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const matches = new Set<string>();
    const pathsToExpand = new Set<string>();

    // Recursively filter: keep nodes that match or have matching descendants
    const filterTree = (node: UONode): UONode | null => {
      const nodeMatches =
        node.code_uo.toLowerCase().includes(term) ||
        node.libelle_court.toLowerCase().includes(term) ||
        node.libelle_long.toLowerCase().includes(term);

      const filteredChildren = node.children
        .map(child => filterTree(child))
        .filter(Boolean) as UONode[];

      if (nodeMatches) {
        matches.add(node.code_uo);
      }

      if (nodeMatches || filteredChildren.length > 0) {
        pathsToExpand.add(node.code_uo);
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    const filtered = data
      .map(root => filterTree(root))
      .filter(Boolean) as UONode[];

    setFilteredData(filtered);
    setHighlightedNodes(matches);
    setExpandedNodes(prev => new Set([...prev, ...pathsToExpand]));
  }, [searchTerm, data]);

  const isSearching = searchTerm.trim().length > 0;
  const displayData = isSearching ? filteredData : data;
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
          <Button size="sm" onClick={() => handleAdd()} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
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
                {displayData.map((root) => (
                  <TreeListItem
                    key={root.code_uo}
                    node={root}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    highlightedNodes={highlightedNodes}
                    colorMap={colorMap}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="relative">
              <div
                className="overflow-auto h-[calc(100vh-280px)] p-6"
                ref={containerRef}
                style={{ cursor: "grab" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
              >
                <div
                  className="inline-flex flex-col items-center gap-0 min-w-max"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                >
                  {displayData.map((root) => (
                    <div key={root.code_uo} className="mb-8">
                      <TreeBranch
                        node={root}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                        selectedNode={selectedNode}
                        setSelectedNode={setSelectedNode}
                        highlightedNodes={highlightedNodes}
                        colorMap={colorMap}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-md bg-card"
                  title="Centrer sur UDP0000000"
                  onClick={() => {
                    const el = containerRef.current;
                    if (!el) return;
                    const target = el.querySelector('[data-uo="UDP0000000"]');
                    if (target) {
                      target.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
                    }
                  }}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-md bg-card"
                  title="Agrandir (voir moins d'UO)"
                  onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-md bg-card"
                  title="Réduire (voir plus d'UO)"
                  onClick={() => setZoom(z => Math.max(z - 0.15, 0.2))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedNodeData && (
          <div className="w-80 border rounded-lg bg-card p-4 flex-shrink-0 h-fit sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Détails de l'UO</h3>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEdit(selectedNodeData)} title="Modifier">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleAdd(selectedNodeData.code_uo)} title="Ajouter sous-unité">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(selectedNodeData)} title="Supprimer">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setSelectedNode(null)} title="Fermer">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: "Code UO", value: selectedNodeData.code_uo },
                { label: "Libellé court", value: selectedNodeData.libelle_court },
                { label: "Libellé long", value: selectedNodeData.libelle_long },
                { label: "UO mère", value: selectedNodeData.code_uo_mere },
                { label: "Type", value: selectedNodeData.type },
                { label: "Niveau", value: selectedNodeData.niveau },
                { label: "Statut", value: selectedNodeData.statut },
                { label: "Code UAI", value: selectedNodeData.code_uai },
                { label: "Ville", value: selectedNodeData.ville },
                { label: "Sous-unités", value: String(selectedNodeData.children.length) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-semibold text-muted-foreground">{label}</p>
                  <p className="text-foreground">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNewItem ? "Ajouter une UO" : "Modifier l'UO"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {uoFields.map(f => (
                  <div key={f.key} className="space-y-2">
                    <Label htmlFor={`org-${f.key}`} className="text-xs">{f.label}</Label>
                    <Input
                      id={`org-${f.key}`}
                      value={(editingItem as any)[f.key] || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, [f.key]: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organigramme;
