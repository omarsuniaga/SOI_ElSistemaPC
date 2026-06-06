# Graph Report - determined-haslett-2378a2  (2026-06-06)

## Corpus Check
- 1010 files · ~1,059,992 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8 nodes · 11 edges · 2 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `80aea25e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]

## God Nodes (most connected - your core abstractions)
1. `getHistorial()` - 6 edges
2. `fetchObservaciones()` - 2 edges
3. `fetchIndicadores()` - 2 edges
4. `mapObservaciones()` - 2 edges
5. `mapIndicadores()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (2 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.60
Nodes (5): fetchIndicadores(), fetchObservaciones(), getHistorial(), mapIndicadores(), mapObservaciones()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getHistorial()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.619) - this node is a cross-community bridge._