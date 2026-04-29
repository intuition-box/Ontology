import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { ATOM_TYPES, ATOM_CATEGORIES, type AtomCategory } from '../data/atom-types';
import { useBodyScrollLock } from '../lib/use-body-scroll-lock';
import { D3_RESET_DURATION_MS } from '../lib/timings';
import { useLiveTriples } from '../intuition/hooks/use-live-triples';
import type { JoinedTripleRecord } from '../intuition/services/graphql.service';

/**
 * Live instance-level knowledge graph.
 *
 * Built from the indexer's recent triples: each unique atom becomes a
 * node (labeled by its on-chain `atom.label`), each triple becomes a
 * directed edge from subject to object. Hovering an edge surfaces the
 * predicate label so the user can read the claim without cluttering
 * the canvas with text.
 *
 * Same UX primitives as the schema graph (force simulation, zoom, pan,
 * fullscreen, hover-to-highlight) so the two views feel consistent.
 * The component is self-contained: drop it anywhere in the page tree
 * and it pulls live data via TanStack Query.
 */

interface AtomNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  category: AtomCategory | 'live';
  color: string;
}

interface TripleEdgeRaw extends d3.SimulationLinkDatum<AtomNode> {
  source: string;
  target: string;
  predicateLabel: string;
  termId: string;
}

interface TripleEdgeLive extends d3.SimulationLinkDatum<AtomNode> {
  source: AtomNode;
  target: AtomNode;
  predicateLabel: string;
  termId: string;
}

const isLive = (l: d3.SimulationLinkDatum<AtomNode>): l is TripleEdgeLive =>
  typeof l.source === 'object' && typeof l.target === 'object';

const endpointId = (
  endpoint: string | AtomNode | number | undefined
): string | null => {
  if (endpoint == null) return null;
  if (typeof endpoint === 'object') return (endpoint as AtomNode).id;
  if (typeof endpoint === 'string') return endpoint;
  return null;
};

const truncateLabel = (label: string, max = 22): string =>
  label.length > max ? `${label.slice(0, max - 1)}…` : label;

const FALLBACK_NODE_COLOR = '#6b6b82';

function colorForAtomType(type: string): string {
  const atom = ATOM_TYPES.find((t) => t.id === type);
  if (atom !== undefined) return ATOM_CATEGORIES[atom.category].color;
  return FALLBACK_NODE_COLOR;
}

function categoryForAtomType(type: string): AtomCategory | 'live' {
  const atom = ATOM_TYPES.find((t) => t.id === type);
  return atom?.category ?? 'live';
}

/**
 * Builds force-graph data from the indexer's joined triple records.
 * Skips triples whose subject/predicate/object joins resolved to null
 * (the indexer marks atoms as nullable when they've been pruned).
 * De-duplicates atoms across triples so the same `max` appears once.
 */
function buildInstanceGraph(
  triples: JoinedTripleRecord[]
): { nodes: AtomNode[]; links: TripleEdgeRaw[] } {
  const nodeMap = new Map<string, AtomNode>();
  const links: TripleEdgeRaw[] = [];

  for (const triple of triples) {
    const subject = triple.subject;
    const predicate = triple.predicate;
    const object = triple.object;
    if (subject === null || predicate === null || object === null) continue;
    if (
      subject === undefined ||
      predicate === undefined ||
      object === undefined
    ) {
      continue;
    }

    if (!nodeMap.has(subject.term_id)) {
      nodeMap.set(subject.term_id, {
        id: subject.term_id,
        label: subject.label || subject.type,
        type: subject.type,
        category: categoryForAtomType(subject.type),
        color: colorForAtomType(subject.type),
      });
    }
    if (!nodeMap.has(object.term_id)) {
      nodeMap.set(object.term_id, {
        id: object.term_id,
        label: object.label || object.type,
        type: object.type,
        category: categoryForAtomType(object.type),
        color: colorForAtomType(object.type),
      });
    }

    links.push({
      source: subject.term_id,
      target: object.term_id,
      predicateLabel: predicate.label || predicate.type,
      termId: triple.term_id,
    });
  }

  return { nodes: Array.from(nodeMap.values()), links };
}

export function LiveInstanceGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const liveTriplesQuery = useLiveTriples({ limit: 100 });
  const { nodes, links } = useMemo(() => {
    const triples = liveTriplesQuery.data;
    if (triples === undefined) return { nodes: [], links: [] };
    return buildInstanceGraph(triples);
  }, [liveTriplesQuery.data]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(D3_RESET_DURATION_MS)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
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

  useBodyScrollLock(isFullscreen);

  // Build / rebuild simulation when nodes or links change. Cleanup
  // stops the previous simulation so we never accumulate ticks on
  // re-render.
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = isFullscreen
      ? window.innerHeight - 160
      : container.clientHeight || 480;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`);

    const g = svg.append('g');

    svg.append('defs').append('marker')
      .attr('id', 'live-arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'var(--color-accent)')
      .attr('opacity', 0.6);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
        if (event.sourceEvent) setHasInteracted(true);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    const simulation = d3
      .forceSimulation<AtomNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<AtomNode, TripleEdgeRaw>(links)
          .id((d) => d.id)
          .distance(80)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide(28));

    const link = g
      .append('g')
      .selectAll<SVGLineElement, TripleEdgeRaw>('line')
      .data(links)
      .join('line')
      .attr('stroke', 'var(--color-accent)')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.45)
      .attr('marker-end', 'url(#live-arrowhead)')
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d) => {
        const tooltip = tooltipRef.current;
        if (tooltip === null) return;
        tooltip.textContent = d.predicateLabel;
        tooltip.style.opacity = '1';
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY + 12}px`;
      })
      .on('mousemove', (event: MouseEvent) => {
        const tooltip = tooltipRef.current;
        if (tooltip === null) return;
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY + 12}px`;
      })
      .on('mouseleave', () => {
        const tooltip = tooltipRef.current;
        if (tooltip === null) return;
        tooltip.style.opacity = '0';
      });

    const node = g
      .append('g')
      .selectAll<SVGGElement, AtomNode>('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, AtomNode>()
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

    node
      .append('circle')
      .attr('r', 8)
      .attr('fill', (d) => d.color)
      .attr('stroke', 'var(--color-bg)')
      .attr('stroke-width', 1.5);

    node
      .append('text')
      .text((d) => truncateLabel(d.label))
      .attr('dx', 14)
      .attr('dy', '0.35em')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none');

    node
      .on('mouseenter', (_event: MouseEvent, d: AtomNode) => {
        const connectedIds = new Set<string>([d.id]);
        for (const l of links) {
          const srcId = endpointId(l.source);
          const tgtId = endpointId(l.target);
          if (srcId === d.id && tgtId !== null) connectedIds.add(tgtId);
          if (tgtId === d.id && srcId !== null) connectedIds.add(srcId);
        }
        node.select('circle').attr('opacity', (n) => connectedIds.has(n.id) ? 1 : 0.15);
        node.select('text').attr('opacity', (n) => connectedIds.has(n.id) ? 1 : 0.15);
        link.attr('stroke-opacity', (l) => {
          const srcId = endpointId(l.source);
          const tgtId = endpointId(l.target);
          return srcId === d.id || tgtId === d.id ? 0.85 : 0.05;
        });
      })
      .on('mouseleave', () => {
        node.select('circle').attr('opacity', 1);
        node.select('text').attr('opacity', 1);
        link.attr('stroke-opacity', 0.45);
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (isLive(d) ? d.source.x ?? 0 : 0))
        .attr('y1', (d) => (isLive(d) ? d.source.y ?? 0 : 0))
        .attr('x2', (d) => (isLive(d) ? d.target.x ?? 0 : 0))
        .attr('y2', (d) => (isLive(d) ? d.target.y ?? 0 : 0));
      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, isFullscreen]);

  const status = liveTriplesQuery.isLoading
    ? 'loading'
    : liveTriplesQuery.error !== null && liveTriplesQuery.error !== undefined
      ? 'error'
      : nodes.length === 0
        ? 'empty'
        : 'ready';

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-[var(--color-bg)] p-6 overflow-auto' : ''}>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] h-full min-h-[480px] flex flex-col relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 z-10 rounded-t-xl p-6"
          style={{
            background:
              'linear-gradient(to bottom, var(--color-surface) 0%, color-mix(in srgb, var(--color-surface) 80%, transparent) 50%, transparent 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Live Knowledge Graph
              </h2>
              <StatusBadge
                status={status}
                count={nodes.length}
                edgeCount={links.length}
                error={liveTriplesQuery.error}
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {hasInteracted && (
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

        <div ref={containerRef} className="w-full flex-1 min-h-0">
          {status === 'empty' ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-[var(--color-text-muted)]">
              No claims indexed yet — publish one to populate the graph.
            </div>
          ) : (
            <svg
              ref={svgRef}
              className="w-full h-full"
              style={{ cursor: 'grab' }}
              role="img"
              aria-label="Live knowledge graph of on-chain atoms and triples"
            />
          )}
        </div>
      </div>

      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-50 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 text-xs font-medium text-[var(--color-text)] shadow-lg transition-opacity"
        style={{ opacity: 0 }}
      />
    </div>
  );
}

function StatusBadge({
  status,
  count,
  edgeCount,
  error,
}: {
  status: 'loading' | 'error' | 'empty' | 'ready';
  count: number;
  edgeCount: number;
  error: Error | null;
}) {
  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-muted)] animate-pulse" aria-hidden />
        Loading
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--destructive)]"
        title={error?.message ?? 'unknown error'}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--destructive)]" aria-hidden />
        Indexer error
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent)]"
      title={`${count} atoms, ${edgeCount} triples`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
      {count} atoms · {edgeCount} triples
    </span>
  );
}

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
