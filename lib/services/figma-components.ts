
import { FigmaNode } from "../../types/figma-design.types";

/**
 * Professional Design Component Library
 * Helper functions to create consistent, high-quality UI elements
 */

/**
 * Design Tokens - Professional Color Palette
 */
export const Colors = {
    // Primary colors
    Primary: { r: 0.37, g: 0.51, b: 1, a: 1 }, // #5E82FF
    PrimaryHover: { r: 0.29, g: 0.42, b: 0.92, a: 1 },
    Secondary: { r: 0.47, g: 0.55, b: 0.69, a: 1 }, // #788CAF

    // Text colors
    TextDark: { r: 0.11, g: 0.11, b: 0.13, a: 1 }, // #1C1C21
    TextMedium: { r: 0.47, g: 0.47, b: 0.51, a: 1 }, // #787882
    TextLight: { r: 0.71, g: 0.71, b: 0.75, a: 1 }, // #B5B5BF

    // Background colors
    Background: { r: 0.96, g: 0.97, b: 0.98, a: 1 }, // #F5F6F9
    Surface: { r: 1, g: 1, b: 1, a: 1 }, // White
    Border: { r: 0.89, g: 0.90, b: 0.92, a: 1 }, // #E3E5EB

    // Status colors
    Success: { r: 0.13, g: 0.77, b: 0.45, a: 1 }, // #22C55E
    Warning: { r: 0.98, g: 0.75, b: 0.18, a: 1 }, // #F9C02D
    Danger: { r: 0.94, g: 0.27, b: 0.35, a: 1 }, // #EF4444

    // Utility colors
    White: { r: 1, g: 1, b: 1, a: 1 }, // #FFFFFF
};
// --- Effects ---
export function createDropShadow(y = 4, blur = 12, alpha = 0.1) {
    return {
        type: "DROP_SHADOW" as const,
        color: { r: 0, g: 0, b: 0, a: alpha },
        offset: { x: 0, y },
        radius: blur,
        visible: true,
    };
}

// --- Components ---

/**
 * Creates a professional Primary Button
 */
export function createButton(
    text: string,
    x: number,
    y: number,
    width = 320,
    variant: 'primary' | 'secondary' = 'primary'
): FigmaNode {
    const bg = variant === 'primary' ? Colors.Primary : Colors.Secondary;
    const txtColor = variant === 'primary' ? Colors.TextLight : Colors.Primary;

    return {
        type: "FRAME", // Using Frame for potentially better layout simulation
        name: `${variant === 'primary' ? 'Primary' : 'Secondary'} Button`,
        x,
        y,
        width,
        height: 48,
        fills: [{ type: "SOLID", color: bg }],
        cornerRadius: 8,
        effects: variant === 'primary' ? [createDropShadow(4, 10, 0.2)] : [],
        children: [
            {
                type: "TEXT",
                name: "Label",
                x: 0,
                y: 14, // Roughly centered vertically (48-20)/2 = 14
                width, // Full width for alignment
                characters: text,
                fontSize: 16,
                fontName: { family: "Inter", style: "Medium" },
                fills: [{ type: "SOLID", color: txtColor }],
                textAlignHorizontal: "CENTER",
                textAlignVertical: "CENTER",
            },
        ]
    };
}

/**
 * Creates a labeled Text Input field
 */
export function createInput(
    label: string,
    placeholder: string,
    x: number,
    y: number,
    width = 320
): FigmaNode[] {
    return [
        // Label
        {
            type: "TEXT",
            name: "Label",
            x,
            y,
            characters: label,
            fontSize: 14,
            fontName: { family: "Inter", style: "Medium" },
            fills: [{ type: "SOLID", color: Colors.TextDark }],
        },
        // Input Box
        {
            type: "RECTANGLE",
            name: "Input Background",
            x,
            y: y + 24,
            width,
            height: 46,
            fills: [{ type: "SOLID", color: Colors.Surface }],
            strokes: [{ type: "SOLID", color: Colors.Border }],
            strokeWeight: 1,
            cornerRadius: 6,
        },
        // Placeholder Text
        {
            type: "TEXT",
            name: "Placeholder",
            x: x + 12,
            y: y + 24 + 13, // Vertically centered
            characters: placeholder,
            fontSize: 15,
            fontName: { family: "Inter", style: "Regular" },
            fills: [{ type: "SOLID", color: Colors.TextMedium }],
        },
    ];
}

/**
 * Creates a Card container
 */
export function createCard(
    x: number,
    y: number,
    width: number,
    height: number,
    children: FigmaNode[]
): FigmaNode {
    return {
        type: "FRAME",
        name: "Card",
        x,
        y,
        width,
        height,
        fills: [{ type: "SOLID", color: Colors.Surface }],
        cornerRadius: 12,
        effects: [createDropShadow(8, 24, 0.08)],
        strokes: [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9, a: 1 } }],
        strokeWeight: 1,
        children,
    };
}

/**
 * Creates a modern Navbar
 */
export function createNavbar(width = 1440, items: string[] = ["Home", "Features", "Pricing", "About"]): FigmaNode {
    // Generate nav item nodes
    const itemNodes: FigmaNode[] = items.map((item, index) => ({
        type: "TEXT",
        name: `Nav Item ${index}`,
        x: 200 + (index * 100), // Spacing
        y: 28,
        characters: item,
        fontSize: 16,
        fontName: { family: "Inter", style: "Medium" },
        fills: [{ type: "SOLID", color: Colors.TextDark }],
    }));

    // Add Logo
    itemNodes.push({
        type: "TEXT",
        name: "Logo",
        x: 40,
        y: 24,
        characters: "Brand.",
        fontSize: 24,
        fontName: { family: "Inter", style: "Bold" },
        fills: [{ type: "SOLID", color: Colors.Primary }],
    });

    // Add CTA button
    itemNodes.push(createButton("Get Started", width - 180, 16, 140, 'primary'));

    return {
        type: "FRAME",
        name: "Navbar",
        x: 0,
        y: 0,
        width,
        height: 80,
        fills: [{ type: "SOLID", color: Colors.Surface }],
        effects: [createDropShadow(2, 8, 0.05)],
        children: itemNodes
    };
}
