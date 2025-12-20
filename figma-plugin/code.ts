/**
 * 021 CTO Design Generator - Figma Plugin
 * 
 * This plugin fetches design data from the 021 API and creates
 * the design in the user's Figma file.
 * 
 * CTO ADVISOR EXCLUSIVE FEATURE
 */

// Show the plugin UI
figma.showUI(__html__, { width: 400, height: 300 });

// Interface for design data from API
interface FigmaNode {
    type: "RECTANGLE" | "TEXT" | "FRAME" | "ELLIPSE" | "LINE" | "VECTOR";
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fills?: Array<{
        type: string;
        color?: { r: number; g: number; b: number; a: number };
    }>;
    strokes?: Array<{
        type: string;
        color?: { r: number; g: number; b: number; a: number };
    }>;
    strokeWeight?: number;
    cornerRadius?: number;
    characters?: string;
    fontSize?: number;
    fontName?: { family: string; style: string };
    children?: FigmaNode[];
    // New properties
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

interface FigmaDesignData {
    nodes: FigmaNode[];
    name?: string;
    description?: string;
}

interface FigmaDesignFetchResponse {
    success: boolean;
    designData?: FigmaDesignData;
    error?: string;
}

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
    if (msg.type === "generate-design") {
        try {
            const { designId } = msg;

            // Fetch design data from API
            // Note: Update this URL to your production URL when deploying
            const apiUrl = `http://localhost:3000/api/figma-design/fetch?designId=${designId}`;

            const response = await fetch(apiUrl);
            const data: FigmaDesignFetchResponse = await response.json();

            if (!data.success || !data.designData) {
                figma.ui.postMessage({
                    type: "design-error",
                    error: data.error || "Failed to fetch design data",
                });
                return;
            }

            // Create the design in Figma
            const createdNodes = await createDesignNodes(data.designData);

            // Select the created nodes
            if (createdNodes.length > 0) {
                figma.currentPage.selection = createdNodes;
                figma.viewport.scrollAndZoomIntoView(createdNodes);
            }

            figma.ui.postMessage({
                type: "design-success",
            });
        } catch (error) {
            console.error("Error generating design:", error);
            figma.ui.postMessage({
                type: "design-error",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            });
        }
    }
};

/**
 * Create Figma nodes from design data
 */
async function createDesignNodes(
    designData: FigmaDesignData
): Promise<SceneNode[]> {
    const createdNodes: SceneNode[] = [];

    for (const nodeData of designData.nodes) {
        const node = await createNode(nodeData);
        if (node) {
            figma.currentPage.appendChild(node);
            createdNodes.push(node);
        }
    }

    return createdNodes;
}

/**
 * Create a single Figma node from node data
 */
async function createNode(nodeData: FigmaNode): Promise<SceneNode | null> {
    let node: SceneNode | null = null;

    switch (nodeData.type) {
        case "RECTANGLE":
            node = figma.createRectangle();
            break;
        case "TEXT":
            node = figma.createText();
            break;
        case "FRAME":
            node = figma.createFrame();
            break;
        case "ELLIPSE":
            node = figma.createEllipse();
            break;
        case "LINE":
            node = figma.createLine();
            break;
        default:
            console.warn(`Unsupported node type: ${nodeData.type}`);
            return null;
    }

    if (!node) return null;

    // Set basic properties
    if (nodeData.name) node.name = nodeData.name;
    if (nodeData.x !== undefined) node.x = nodeData.x;
    if (nodeData.y !== undefined) node.y = nodeData.y;

    // Set size (if applicable)
    if ("resize" in node && nodeData.width && nodeData.height) {
        node.resize(nodeData.width, nodeData.height);
    }

    // Set opacity
    if (nodeData.opacity !== undefined && "opacity" in node) {
        node.opacity = nodeData.opacity;
    }

    // Set fills
    if (nodeData.fills && "fills" in node) {
        const fills: Paint[] = nodeData.fills.map((fill) => {
            if (fill.type === "SOLID" && fill.color) {
                return {
                    type: "SOLID",
                    color: {
                        r: fill.color.r,
                        g: fill.color.g,
                        b: fill.color.b,
                    },
                    opacity: fill.color.a !== undefined ? fill.color.a : 1,
                } as SolidPaint;
            }
            return { type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } } as SolidPaint;
        });
        node.fills = fills;
    }

    // Set strokes
    if (nodeData.strokes && "strokes" in node) {
        const strokes: Paint[] = nodeData.strokes.map((stroke) => {
            if (stroke.type === "SOLID" && stroke.color) {
                return {
                    type: "SOLID",
                    color: {
                        r: stroke.color.r,
                        g: stroke.color.g,
                        b: stroke.color.b,
                    },
                    opacity: stroke.color.a !== undefined ? stroke.color.a : 1,
                } as SolidPaint;
            }
            return { type: "SOLID", color: { r: 0, g: 0, b: 0 } } as SolidPaint;
        });
        node.strokes = strokes;
    }

    // Set stroke weight
    if (nodeData.strokeWeight && "strokeWeight" in node) {
        node.strokeWeight = nodeData.strokeWeight;
    }

    // Set corner radius (for rectangles)
    if (nodeData.cornerRadius && "cornerRadius" in node) {
        node.cornerRadius = nodeData.cornerRadius;
    }

    // Set effects (Drop Shadow etc)
    if (nodeData.effects && "effects" in node) {
        const effects: Effect[] = nodeData.effects.map((effect) => {
            if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
                return {
                    type: effect.type,
                    color: effect.color
                        ? { r: effect.color.r, g: effect.color.g, b: effect.color.b, a: effect.color.a ?? 1 }
                        : { r: 0, g: 0, b: 0, a: 0.25 },
                    offset: effect.offset || { x: 0, y: 4 },
                    radius: effect.radius || 4,
                    visible: effect.visible !== false,
                    blendMode: (effect.blendMode as BlendMode) || "NORMAL",
                };
            }
            // Add other effects if needed
            return {
                type: "DROP_SHADOW",
                color: { r: 0, g: 0, b: 0, a: 0.25 },
                offset: { x: 0, y: 4 },
                radius: 4,
                visible: true,
                blendMode: "NORMAL"
            } as DropShadowEffect;
        });
        node.effects = effects;
    }

    // Set text properties (for text nodes)
    if (node.type === "TEXT" && nodeData.characters) {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });

        // Load custom font if specified
        if (nodeData.fontName) {
            try {
                await figma.loadFontAsync({
                    family: nodeData.fontName.family,
                    style: nodeData.fontName.style,
                });
            } catch (error) {
                console.warn("Failed to load custom font, using default");
            }
        }

        node.characters = nodeData.characters;

        if (nodeData.fontSize) {
            node.fontSize = nodeData.fontSize;
        }

        if (nodeData.fontName) {
            node.fontName = {
                family: nodeData.fontName.family,
                style: nodeData.fontName.style,
            };
        }

        if (nodeData.textAlignHorizontal) {
            node.textAlignHorizontal = nodeData.textAlignHorizontal;
        }

        if (nodeData.textAlignVertical) {
            node.textAlignVertical = nodeData.textAlignVertical;
        }
    }

    // Handle Auto Layout (for frames)
    if (node.type === "FRAME" && nodeData.autoLayout) {
        const al = nodeData.autoLayout;
        node.layoutMode = al.layoutMode;
        if (al.primaryAxisSizingMode) node.primaryAxisSizingMode = al.primaryAxisSizingMode;
        if (al.counterAxisSizingMode) node.counterAxisSizingMode = al.counterAxisSizingMode;
        if (al.primaryAxisAlignItems) node.primaryAxisAlignItems = al.primaryAxisAlignItems;
        if (al.counterAxisAlignItems) node.counterAxisAlignItems = al.counterAxisAlignItems;
        if (al.paddingLeft) node.paddingLeft = al.paddingLeft;
        if (al.paddingRight) node.paddingRight = al.paddingRight;
        if (al.paddingTop) node.paddingTop = al.paddingTop;
        if (al.paddingBottom) node.paddingBottom = al.paddingBottom;
        if (al.itemSpacing) node.itemSpacing = al.itemSpacing;
    }

    // Handle children (for frames)
    if (nodeData.children && "appendChild" in node) {
        for (const childData of nodeData.children) {
            const childNode = await createNode(childData);
            if (childNode) {
                node.appendChild(childNode);
            }
        }
    }

    return node;
}
