export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
}

export interface NodeData {
    id: number;
    text: string;
    position: Point;
    settings: NodeSettingsData;
}

export interface NodeConnection {
    fromNodeId: number;
    toNodeId: number;
}

export interface NodeRef {
    id: number;
    deselect: () => void;
}

export interface Point {
    x: number;
    y: number;
}

export interface NodeSettingsData {
    color: string;
}

export interface Flowchart {
    // Simplified versions of NodeData and NodeConnection
    n: { i: number, t: string, p: number[], c: string }[];
    c: number[][];
}