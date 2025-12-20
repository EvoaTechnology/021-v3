/**
 * Type definitions for Figma design generation feature
 * CTO advisor exclusive functionality
 */

export interface FigmaNode {
    type: "RECTANGLE" | "TEXT" | "FRAME" | "ELLIPSE" | "LINE" | "VECTOR";
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
    strokes?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
    strokeWeight?: number;
    cornerRadius?: number;
    characters?: string; // For TEXT nodes
    fontSize?: number;
    fontName?: { family: string; style: string };
    children?: FigmaNode[];
    // New properties for professional designs
    effects?: Array<{
        type: "DROP_SHADOW" | "INNER_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
        color?: { r: number; g: number; b: number; a: number };
        offset?: { x: number; y: number };
        radius?: number;
        visible?: boolean;
        blendMode?: string;
    }>;
    opacity?: number;
    textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
    textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
    autoLayout?: {
        layoutMode: "HORIZONTAL" | "VERTICAL";
        primaryAxisSizingMode?: "FIXED" | "AUTO";
        counterAxisSizingMode?: "FIXED" | "AUTO";
        primaryAxisAlignItems?: "MIN" | "MAX" | "CENTER" | "SPACE_BETWEEN";
        counterAxisAlignItems?: "MIN" | "MAX" | "CENTER";
        paddingLeft?: number;
        paddingRight?: number;
        paddingTop?: number;
        paddingBottom?: number;
        itemSpacing?: number;
    };
}

export interface FigmaDesignData {
    nodes: FigmaNode[];
    name?: string;
    description?: string;
}

export interface FigmaDesignRequest {
    designId: string;
    designData: FigmaDesignData;
    activeRole: string;
}

export interface FigmaDesignResponse {
    success: boolean;
    designId: string;
    message?: string;
}

export interface FigmaDesignDocument {
    _id?: string;
    designId: string;
    designData: FigmaDesignData;
    userId: string;
    activeRole: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface FigmaDesignFetchResponse {
    success: boolean;
    designData?: FigmaDesignData;
    error?: string;
}
