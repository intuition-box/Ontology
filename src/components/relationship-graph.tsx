import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { ATOM_TYPES, ATOM_CATEGORIES, type AtomCategory } from '../data/atom-types';
import { PREDICATES } from '../data/predicates';

interface RelationshipGraphProps {
  highlightTypeId: string | null;
  onSelectType?: (typeId: string) => void;
  searchQuery?: string;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  category: AtomCategory;
  color: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  predicateCount: number;
}

/** Build graph data from atom types and predicates */
function buildGraph(): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodeMap = new Map<string, GraphNode>();
  for (const atomType of ATOM_TYPES) {
    nodeMap.set(atomType.id, {
      id: atomType.id,
      label: atomType.label,
      category: atomType.category,
      color: ATOM_CATEGORIES[atomType.category].color,
    });
  }

  // Aggregate links: one link per unique (source, target) pair
  const linkMap = new Map<string, number>();
  for (const pred of PREDICATES) {
    for (const subj of pred.subjectTypes) {
      if (!nodeMap.has(subj)) continue;
      for (const obj of pred.objectTypes) {
        if (!nodeMap.has(obj)) continue;
        const key = `${subj}→${obj}`;
        linkMap.set(key, (linkMap.get(key) ?? 0) + 1);
      }
    }
  }

  const links: GraphLink[] = [];
  for (const [key, count] of linkMap) {
    const [source, target] = key.split('→');
    links.push({ source, target, predicateCount: count });
  }

  return { nodes: Array.from(nodeMap.values()), links };
}

export function RelationshipGraph({ highlightTypeId, onSelectType, searchQuery }: RelationshipGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const prevHighlightRef = useRef(highlightTypeId);

  // Auto-reset when selection is cleared externally (e.g., Entity Hierarchy Reset)
  useEffect(() => {
    if (prevHighlightRef.current && !highlightTypeId) {
      setHasInteracted(false);
      if (svgRef.current && zoomRef.current) {
        d3.select(svgRef.current)
          .transition()
          .duration(400)
          .call(zoomRef.current.transform, d3.zoomIdentity);
      }
    }
    prevHighlightRef.current = highlightTypeId;
  }, [highlightTypeId]);

  // Refs for D3 selections — avoid full rebuild on highlight/search changes
  const nodeSelRef = useRef<d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null>(null);
  const linkSelRef = useRef<d3.Selection<SVGLineElement, GraphLink, SVGGElement, unknown> | null>(null);
  const graphDataRef = useRef<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  // Stable callback refs so D3 event handlers don't go stale
  const onSelectTypeRef = useRef(onSelectType);
  onSelectTypeRef.current = onSelectType;
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(400)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
    onSelectTypeRef.current?.(null as unknown as string);
    setHasInteracted(false);
  }, []);

  // Close fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  // Build simulation — once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // Manual offset to visually center the graph within the card
    const offsetX = 60;  // shift graph left
    const offsetY = -30; // shift graph down

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `${-width / 2 + offsetX} ${-height / 2 + offsetY} ${width} ${height}`);

    // Main group that gets zoomed/panned
    const g = svg.append('g');

    // Arrow marker for directed edges
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'var(--color-border)');

    // Set up zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
        if (event.sourceEvent) setHasInteracted(true);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    const graphData = buildGraph();
    graphDataRef.current = graphData;
    const { nodes, links } = graphData;

    // Force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide(30));
    simulationRef.current = simulation;

    // Links
    const link = g
      .append('g')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', 'var(--color-border)')
      .attr('stroke-width', (d) => Math.min(d.predicateCount, 5) * 0.5 + 0.5)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');
    linkSelRef.current = link;

    // Node groups
    const node = g
      .append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
            setHasInteracted(true);
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as never
      );
    nodeSelRef.current = node;

    // Node circles (initial defaults — highlighting effect updates these)
    node
      .append('circle')
      .attr('r', 7)
      .attr('fill', (d) => d.color)
      .attr('stroke', 'var(--color-bg)')
      .attr('stroke-width', 1.5);

    // Node labels (initial defaults — highlighting effect updates these)
    node
      .append('text')
      .text((d) => d.label)
      .attr('dx', 14)
      .attr('dy', '0.35em')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('font-size', '10px')
      .attr('font-weight', '400');

    // Hover: highlight connections (uses refs for current search state)
    node
      .on('mouseenter', (_event, d) => {
        const sq = (searchQueryRef.current ?? '').trim().toLowerCase();
        if (sq) return; // Search takes precedence

        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        links.forEach((l) => {
          const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
          const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
          if (srcId === d.id) connectedIds.add(tgtId);
          if (tgtId === d.id) connectedIds.add(srcId);
        });

        node.select('circle').attr('opacity', (n) => connectedIds.has(n.id) ? 1 : 0.15);
        node.select('text').attr('opacity', (n) => connectedIds.has(n.id) ? 1 : 0.15);
        link.attr('stroke-opacity', (l) => {
          const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
          const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
          return srcId === d.id || tgtId === d.id ? 0.8 : 0.05;
        });
      })
      .on('mouseleave', () => {
        const sq = (searchQueryRef.current ?? '').trim().toLowerCase();
        if (sq) return; // Search takes precedence

        node.select('circle').attr('opacity', 1);
        node.select('text').attr('opacity', 1);
        link.attr('stroke-opacity', 0.6);
      })
      .on('click', (_event, d) => {
        onSelectTypeRef.current?.(d.id);
      });

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, []);


  // Resize viewBox when entering/exiting fullscreen — no simulation rebuild
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = isFullscreen ? window.innerHeight - 160 : container.clientHeight || 480;
    const offsetX = 60;
    const offsetY = -50;

    d3.select(svgRef.current)
      .attr('viewBox', `${-width / 2 + offsetX} ${-height / 2 + offsetY} ${width} ${height}`);
  }, [isFullscreen]);

  // Update visual highlighting without rebuilding the simulation
  useEffect(() => {
    const node = nodeSelRef.current;
    const link = linkSelRef.current;
    if (!node || !link) return;

    const { nodes, links } = graphDataRef.current;
    const sq = (searchQuery ?? '').trim().toLowerCase();
    const isSearchMatch = (d: GraphNode) =>
      !sq || d.label.toLowerCase().includes(sq) || d.id.toLowerCase().includes(sq);

    // When a type is selected, find its connected nodes and hide everything else
    const connectedIds = new Set<string>();
    if (highlightTypeId) {
      connectedIds.add(highlightTypeId);
      links.forEach((l) => {
        const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
        const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
        if (srcId === highlightTypeId) connectedIds.add(tgtId);
        if (tgtId === highlightTypeId) connectedIds.add(srcId);
      });
    }

    const isConnected = (id: string) => !highlightTypeId || connectedIds.has(id);

    // Node visibility — entirely remove non-connected nodes when selected
    node.style('display', (d) => isConnected(d.id) ? null : 'none');

    // Circles
    node.select<SVGCircleElement>('circle')
      .attr('r', (d) => (d.id === highlightTypeId ? 10 : 7))
      .attr('stroke', (d) => d.id === highlightTypeId ? 'var(--color-text)' : 'var(--color-bg)')
      .attr('stroke-width', (d) => (d.id === highlightTypeId ? 2.5 : 1.5))
      .attr('opacity', (d) => (sq && !isSearchMatch(d) ? 0.15 : 1));

    // Labels
    node.select<SVGTextElement>('text')
      .attr('fill', (d) => d.id === highlightTypeId ? 'var(--color-text)' : 'var(--color-text-secondary)')
      .attr('font-size', (d) => (d.id === highlightTypeId ? '13px' : '10px'))
      .attr('font-weight', (d) => (d.id === highlightTypeId ? '600' : '400'))
      .attr('opacity', (d) => (sq && !isSearchMatch(d) ? 0.15 : 1));

    // Links — hide links that don't involve the selected node
    if (highlightTypeId) {
      link
        .style('display', (l) => {
          const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
          const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
          return srcId === highlightTypeId || tgtId === highlightTypeId ? null : 'none';
        })
        .attr('stroke-opacity', 0.6);
    } else if (sq) {
      link
        .style('display', null)
        .attr('stroke-opacity', (l) => {
          const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
          const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
          const srcNode = nodes.find((n) => n.id === srcId);
          const tgtNode = nodes.find((n) => n.id === tgtId);
          return (srcNode && isSearchMatch(srcNode)) || (tgtNode && isSearchMatch(tgtNode)) ? 0.6 : 0.05;
        });
    } else {
      link.style('display', null).attr('stroke-opacity', 0.6);
    }
  }, [highlightTypeId, searchQuery]);

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-[var(--color-bg)] p-6 overflow-auto' : ''}>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] h-full min-h-[480px] flex flex-col relative overflow-hidden">
        {/* Glass header overlay */}
        <div className="absolute inset-x-0 top-0 z-10 rounded-t-xl p-6" style={{ background: 'linear-gradient(to bottom, var(--color-surface) 0%, color-mix(in srgb, var(--color-surface) 80%, transparent) 50%, transparent 100%)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Entity Relationship</h2>
            <div className="flex items-center gap-1 shrink-0">
              {(hasInteracted || highlightTypeId) && (
                <button
                  onClick={handleReset}
                  className="focus-ring h-7 inline-flex items-center rounded-md px-3 text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors"
                  aria-label="Reset view"
                >
                  Reset
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className={`focus-ring h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${
                  isFullscreen
                    ? 'text-[var(--color-text)] bg-[var(--color-surface-raised)]'
                    : 'text-[var(--color-text-muted)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                }`}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                <FullscreenIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Full-bleed graph */}
        <div ref={containerRef} className="w-full flex-1 min-h-0">
          <svg ref={svgRef} className="w-full h-full" style={{ cursor: 'grab' }} role="img" aria-label="Entity relationship graph visualization" />
        </div>
      </div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────

function FullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="10 2 14 2 14 6" />
      <polyline points="6 14 2 14 2 10" />
      <line x1="14" y1="2" x2="9.5" y2="6.5" />
      <line x1="2" y1="14" x2="6.5" y2="9.5" />
    </svg>
  );
}

