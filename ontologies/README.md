# Ecosystem Ontology Definitions

This directory contains formal ontology definitions for each app in the [Intuition-Box](https://github.com/intuition-box) ecosystem.

## Structure

Each JSON file defines the **atom types**, **predicates**, and **valid type combinations** for one ecosystem app. All definitions follow the same schema used by the Ontology explorer's `PredicateRule` format.

## Schema

```typescript
interface AppOntology {
  app: string;              // App name
  repo: string;             // GitHub repo path
  description: string;      // What the app does
  atomTypes: AtomType[];    // Entity types the app uses
  predicates: Predicate[];  // Relationships the app defines
}

interface AtomType {
  id: string;               // Schema.org-compatible type ID
  label: string;            // Human-readable label
  description: string;      // What this type represents
}

interface Predicate {
  id: string;               // Predicate ID (camelCase)
  label: string;            // Display label
  description: string;      // What this relationship means
  subjectTypes: string[];   // Valid subject atom types
  objectTypes: string[];    // Valid object atom types
}
```

## Cross-App Consistency

Shared types use identical IDs across all apps:

| Shared ID | Used By |
|-----------|---------|
| `Person` | All apps (wallet identity) |
| `trusts` | Sofia, Extension, Graph, Spread Trust, AgentId |
| `Organization` | Values, Atlas |
| `SoftwareApplication` | AgentId, MCP Server |

## Files

| File | App | Atom Types | Predicates |
|------|-----|:----------:|:----------:|
| `sofia.json` | Sofia | 7 | 7 |
| `atlas.json` | Atlas | 5 | 5 |
| `agentid.json` | AgentId | 5 | 7 |
| `values.json` | Values | 4 | 4 |
| `graph.json` | Graph | 3 | 3 |
| `spread-trust.json` | Spread Trust | 3 | 3 |
| `fee-proxy.json` | Fee Proxy Template | 3 | 3 |
| `rpc.json` | RPC | 3 | 2 |
| `mcp-server.json` | MCP Server | 3 | 3 |
| `ideation.json` | Intuition Ideation | 3 | 3 |
| `ontology.json` | Ontology | 3 | 3 |
| `_shared.json` | Cross-app shared types | 6 | 2 |
