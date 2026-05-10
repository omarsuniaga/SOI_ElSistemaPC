export const RouteConfigAdapter = {
  mockData: null,

  async loadMockData() {
    if (!this.mockData) {
      try {
        const res = await fetch('/src/assets/data/mocks/routes_config_mock.json');
        this.mockData = await res.json();
      } catch (err) {
        console.error('Error loading mock data:', err);
        return { levels: [], nodes: [], indicators: [] };
      }
    }
    return this.mockData;
  },

  async getLevels() {
    const data = await this.loadMockData();
    return data.levels || [];
  },

  async getNodesByLevel(levelId) {
    const data = await this.loadMockData();
    return (data.nodes || []).filter(n => n.level_id === levelId);
  },

  async getIndicatorsByNode(nodeId) {
    const data = await this.loadMockData();
    return (data.indicators || []).filter(i => i.node_id === nodeId);
  },

  async addLevel(levelData) {
    const data = await this.loadMockData();
    const newId = Math.max(0, ...data.levels.map(l => l.id)) + 1;
    const newLevel = { id: newId, route_version_id: 1, ...levelData };
    data.levels.push(newLevel);
    return newLevel;
  },

  async addNode(nodeData) {
    const data = await this.loadMockData();
    const newId = Math.max(0, ...data.nodes.map(n => n.id)) + 1;
    const newNode = { id: newId, ...nodeData };
    data.nodes.push(newNode);
    return newNode;
  },

  async addIndicator(indicatorData) {
    const data = await this.loadMockData();
    const newId = Math.max(0, ...data.indicators.map(i => i.id)) + 1;
    const newInd = { id: newId, ...indicatorData };
    data.indicators.push(newInd);
    return newInd;
  },

  async getRouteHierarchy() {
    const data = await this.loadMockData();
    const levels = [...data.levels].sort((a, b) => a.level_number - b.level_number);
    const nodes = data.nodes || [];
    
    // Agrupar nodos por nivel
    const nodesPorNivel = {};
    nodes.forEach(nodo => {
      if (!nodesPorNivel[nodo.level_id]) nodesPorNivel[nodo.level_id] = [];
      nodesPorNivel[nodo.level_id].push(nodo);
    });

    return {
      route: { name: "Ruta Integral de Violín por Nodos", instrument: "violín", description: "Ruta inicial cargada por Mock" },
      version: { version: "1.0" },
      levels: levels,
      nodesPorNivel: nodesPorNivel,
      sampleIndicators: (data.indicators || []).slice(0, 3)
    };
  }
};
