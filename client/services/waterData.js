
const KOLKATA_CENTER = [22.5726, 88.3639];

// Helper to offset coordinates
const offset = (coords, latOffset, lngOffset) => [coords[0] + latOffset, coords[1] + lngOffset];

export const generateNetwork = () => {
  const nodes = [];
  const segments = [];
  const sensors = [];

  // 1. Create a Main Loop (The "Giant Water Loop")
  const radius = 0.015; // approx 1.5km radius
  const loopNodesCount = 8;
  const loopNodeIds = [];

  for (let i = 0; i < loopNodesCount; i++) {
    const angle = (i / loopNodesCount) * 2 * Math.PI;
    const lat = KOLKATA_CENTER[0] + radius * Math.cos(angle);
    const lng = KOLKATA_CENTER[1] + radius * Math.sin(angle);
    
    const id = `J-${i}`;
    nodes.push({
      id,
      type: "Junction",
      coordinates: [lat, lng],
      status: "Open", // Valves at junctions
      hasWater: true,
    });
    loopNodeIds.push(id);
  }

  // Connect the loop
  for (let i = 0; i < loopNodesCount; i++) {
    const sourceId = loopNodeIds[i];
    const targetId = loopNodeIds[(i + 1) % loopNodesCount];
    segments.push({
      id: `PIPE-LOOP-${i}`,
      source: sourceId,
      target: targetId,
      coordinates: [
        nodes.find(n => n.id === sourceId).coordinates,
        nodes.find(n => n.id === targetId).coordinates
      ],
      material: "Steel",
      diameter: 500,
      status: "Normal",
      type: "Confirmed",
      pressure: 80,
      age: 1985 + Math.floor(Math.random() * 30), // 1985-2015
      priorityScore: Math.floor(Math.random() * 100),
      replacementStatus: "Pending"
    });
  }

  // 2. Add Sources (Water Treatment Plants)
  const sources = [
    { id: "WTP-North", angle: 0 },
    { id: "WTP-South", angle: Math.PI }
  ];

  sources.forEach((src, idx) => {
    const lat = KOLKATA_CENTER[0] + (radius * 1.5) * Math.cos(src.angle);
    const lng = KOLKATA_CENTER[1] + (radius * 1.5) * Math.sin(src.angle);
    
    nodes.push({
      id: src.id,
      type: "Source",
      coordinates: [lat, lng],
      hasWater: true,
    });

    // Connect Source to nearest Loop Node
    // For simplicity, connect to specific indices
    const targetIndex = src.angle === 0 ? 0 : Math.floor(loopNodesCount / 2);
    const targetId = loopNodeIds[targetIndex];
    
    segments.push({
      id: `PIPE-FEEDER-${idx}`,
      source: src.id,
      target: targetId,
      coordinates: [
        [lat, lng],
        nodes.find(n => n.id === targetId).coordinates
      ],
      material: "Ductile Iron",
      diameter: 800,
      status: "Normal",
      type: "Confirmed",
      pressure: 90,
      age: 1990 + Math.floor(Math.random() * 30),
      priorityScore: Math.floor(Math.random() * 100),
      replacementStatus: "Pending"
    });
  });

  // 3. Add Demand Branches (Neighborhoods)
  loopNodeIds.forEach((loopNodeId, i) => {
    if (i % 2 === 0) return; // Only add branches to some nodes

    // Create a branch structure: LoopNode -> DistNode -> [House1, House2]
    const loopNode = nodes.find(n => n.id === loopNodeId);
    
    // Direction vector away from center
    const latDir = loopNode.coordinates[0] - KOLKATA_CENTER[0];
    const lngDir = loopNode.coordinates[1] - KOLKATA_CENTER[1];
    const len = Math.sqrt(latDir*latDir + lngDir*lngDir);
    
    const distNodeCoords = [
        loopNode.coordinates[0] + (latDir/len) * 0.008,
        loopNode.coordinates[1] + (lngDir/len) * 0.008
    ];
    const distNodeId = `DIST-${i}`;
    
    nodes.push({
        id: distNodeId,
        type: "Distribution",
        coordinates: distNodeCoords,
        hasWater: true,
    });

    segments.push({
        id: `PIPE-BRANCH-${i}`,
        source: loopNodeId,
        target: distNodeId,
        coordinates: [loopNode.coordinates, distNodeCoords],
        material: "PVC",
        diameter: 200,
        status: "Normal",
        type: "Confirmed",
        pressure: 50,
        age: 2000 + Math.floor(Math.random() * 20),
        priorityScore: Math.floor(Math.random() * 100),
        replacementStatus: "Pending"
    });

    // Sub-branches (Households/Small areas)
    for(let j=0; j<3; j++) {
        const subCoords = offset(distNodeCoords, (Math.random()-0.5)*0.004, (Math.random()-0.5)*0.004);
        const subId = `HOUSE-${i}-${j}`;
        nodes.push({
            id: subId,
            type: "Demand",
            coordinates: subCoords,
            hasWater: true
        });
        segments.push({
            id: `PIPE-SUB-${i}-${j}`,
            source: distNodeId,
            target: subId,
            coordinates: [distNodeCoords, subCoords],
            material: "PVC",
            diameter: 100,
            status: "Normal",
            type: "Confirmed",
            pressure: 45,
            age: 2005 + Math.floor(Math.random() * 15),
            priorityScore: Math.floor(Math.random() * 100),
            replacementStatus: "Pending"
        });
    }
  });

  // Generate Sensors
  nodes.forEach((node, i) => {
    if (Math.random() > 0.7) {
        sensors.push({
            id: `SENSOR-${i}`,
            coordinates: node.coordinates,
            type: Math.random() > 0.5 ? "Pressure" : "Acoustic",
            status: "Active",
            battery: 85 + Math.floor(Math.random() * 15)
        });
    }
  });

  // Generate Replacement Zones (Polygons)
  const replacementZones = [];
  // Create a zone around the first loop node
  if (loopNodeIds.length > 0) {
    const zoneCenter = nodes.find(n => n.id === loopNodeIds[0]).coordinates;
    const zoneRadius = 0.005;
    const zoneCoords = [];
    for (let i = 0; i <= 6; i++) { // Hexagon
        const angle = (i / 6) * 2 * Math.PI;
        zoneCoords.push([
            zoneCenter[0] + zoneRadius * Math.cos(angle),
            zoneCenter[1] + zoneRadius * Math.sin(angle)
        ]);
    }
    replacementZones.push({
        id: "ZONE-A",
        coordinates: zoneCoords,
        status: "Active Work",
        progress: 45,
        completionDate: "2025-12-01"
    });
  }

  return { nodes, segments, sensors, replacementZones };
};

// BFS to determine which nodes have water
export const calculateReachability = (nodes, segments) => {
    const activeSegments = segments.filter(s => s.status !== "Burst" && s.status !== "Isolated");
    
    // Build adjacency list
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    activeSegments.forEach(s => {
        if (adj[s.source]) adj[s.source].push(s.target);
        if (adj[s.target]) adj[s.target].push(s.source);
    });

    const sources = nodes.filter(n => n.type === "Source").map(n => n.id);
    const visited = new Set(sources);
    const queue = [...sources];

    while (queue.length > 0) {
        const curr = queue.shift();
        if (adj[curr]) {
            adj[curr].forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            });
        }
    }

    // Update nodes with water status
    return nodes.map(n => ({
        ...n,
        hasWater: visited.has(n.id)
    }));
};

export const simulateBurst = (network, pipeId) => {
    const { nodes, segments, sensors } = network;
    
    // 1. Mark pipe as Burst
    const updatedSegments = segments.map(s => {
        if (s.id === pipeId) return { ...s, status: "Burst" };
        return s;
    });

    const burstPipe = segments.find(s => s.id === pipeId);
    
    // 2. Identify valves to close (Nodes connected to the burst pipe)
    // In this simplified model, we assume nodes are capable of isolation (valves)
    const nodesToIsolate = [burstPipe.source, burstPipe.target];

    // 3. Recalculate water flow (Reachability)
    // effectively removing the edge
    const updatedNodes = calculateReachability(nodes, updatedSegments);

    // 4. Determine Impact
    const dryNodes = updatedNodes.filter(n => !n.hasWater);
    const affectedPopulation = dryNodes.filter(n => n.type === "Demand").length * 45; // random multiplier

    // 5. Generate Recommendations
    const recommendations = [];
    
    recommendations.push({
        title: "Isolate Burst",
        action: `Close valves at ${burstPipe.source} and ${burstPipe.target}`,
        type: "critical"
    });

    if (dryNodes.length > 0) {
        recommendations.push({
            title: "Bypass Required",
            action: `Check for auxiliary connections near ${dryNodes[0].id}`,
            type: "warning"
        });
    } else {
        recommendations.push({
            title: "Redundancy Effective",
            action: "Loop system maintaining supply to all downstream nodes.",
            type: "success"
        });
    }

    return {
        network: { nodes: updatedNodes, segments: updatedSegments, sensors },
        impact: {
            affectedNodes: dryNodes.length,
            population: affectedPopulation
        },
        recommendations
    };
};

export const getAlerts = () => {
  return [
    { id: 1, type: "System Ready", location: "Network Monitor", severity: "Low", time: "Just now" },
  ];
};

export const getWorkOrders = () => {
    return [
        { id: "WO-101", type: "Leak Repair", location: "Sector 4, Pipe-Loop-2", priority: "High", status: "Open", time: "08:30 AM" },
        { id: "WO-102", type: "Sensor Install", location: "Sector 2, Junction-5", priority: "Medium", status: "Pending", time: "10:00 AM" },
        { id: "WO-103", type: "Valve Maintenance", location: "WTP-North Intake", priority: "Low", status: "Completed", time: "Yesterday" },
    ];
};

export const getWaterQualityData = () => {
    return {
        current: { ph: 7.2, turbidity: 0.5, chlorine: 1.5, status: "Good" },
        history: [
            { day: "Mon", ph: 7.1, quality: 95 },
            { day: "Tue", ph: 7.2, quality: 98 },
            { day: "Wed", ph: 7.0, quality: 92 },
            { day: "Thu", ph: 7.3, quality: 96 },
            { day: "Fri", ph: 7.2, quality: 97 },
        ]
    };
};

export const getConservationTips = () => {
    return [
        { id: 1, title: "Fix Leaky Faucets", text: "A dripping faucet can waste 20 gallons of water a day.", icon: "Droplet" },
        { id: 2, title: "Full Loads Only", text: "Run your dishwasher and washing machine only when full.", icon: "Activity" },
        { id: 3, title: "Harvest Rainwater", text: "Use rain barrels to water your garden during dry spells.", icon: "CloudRain" },
    ];
};
