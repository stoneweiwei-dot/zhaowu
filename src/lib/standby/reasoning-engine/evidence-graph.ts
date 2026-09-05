import type { EvidenceEdge, EvidenceGraph, EvidenceNode } from "./types";

export function createEvidenceGraph(nodes: EvidenceNode[] = [], edges: EvidenceEdge[] = []): EvidenceGraph {
  return { nodes: [...nodes], edges: [...edges] };
}

export function addEvidenceNode(graph: EvidenceGraph, node: EvidenceNode): EvidenceGraph {
  if (graph.nodes.some((item) => item.id === node.id)) return graph;
  return { ...graph, nodes: [...graph.nodes, node] };
}

export function addEvidenceEdge(graph: EvidenceGraph, edge: EvidenceEdge): EvidenceGraph {
  const exists = graph.edges.some((item) => item.from === edge.from && item.to === edge.to && item.relation === edge.relation);
  if (exists) return graph;
  return { ...graph, edges: [...graph.edges, edge] };
}

export function traceEvidence(graph: EvidenceGraph, targetId: string) {
  const incoming = graph.edges.filter((edge) => edge.to === targetId);
  const nodeIds = new Set(incoming.map((edge) => edge.from));
  return {
    target: graph.nodes.find((node) => node.id === targetId) ?? null,
    supporting: graph.nodes.filter((node) => nodeIds.has(node.id) && incoming.some((edge) => edge.from === node.id && edge.relation === "supports")),
    contradicting: graph.nodes.filter((node) => nodeIds.has(node.id) && incoming.some((edge) => edge.from === node.id && edge.relation === "contradicts")),
    requirements: graph.nodes.filter((node) => nodeIds.has(node.id) && incoming.some((edge) => edge.from === node.id && edge.relation === "requires")),
  };
}

export function validateEvidenceGraph(graph: EvidenceGraph) {
  const ids = new Set(graph.nodes.map((node) => node.id));
  const dangling = graph.edges.filter((edge) => !ids.has(edge.from) || !ids.has(edge.to));
  const duplicateNodes = graph.nodes.filter((node, index, list) => list.findIndex((item) => item.id === node.id) !== index);
  return { valid: dangling.length === 0 && duplicateNodes.length === 0, dangling, duplicateNodes };
}
