import type { Flowchart, NodeConnection, NodeData } from "../scripts/types";

export function getFlowchartJson(nodes: NodeData[], connections: NodeConnection[]): Flowchart {
    const result: Flowchart = { n: [], c: [] };

    for (const data of nodes) {
        result.n.push({ i: data.id, t: data.text, p: [data.position.x, data.position.y], c: data.settings.color });
    }

    for (const conn of connections) {
        result.c.push([conn.fromNodeId, conn.toNodeId]);
    }

    return result;
}

export function parseFlowchartJson(json: Flowchart): { nodes: NodeData[], connections: NodeConnection[] } {
    const result = { nodes: [], connections: [] };
    for (const node of json.n) {
        result.nodes.push({
            id: node.i,
            text: node.t,
            position: { x: node.p[0], y: node.p[1] },
            settings: { color: node.c },
        });
    }

    for (const conn of json.c) {
        result.connections.push({
            fromNodeId: conn[0],
            toNodeId: conn[1],
        });
    }

    return result;
}

export function findConnectionIndex(connections: NodeConnection[], fromId: number, toId: number): number {
    return connections.findIndex(conn => conn.fromNodeId === fromId && conn.toNodeId === toId);
}