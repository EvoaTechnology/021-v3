import FigmaDesign from "../../model/figma-design.model";
import { connectToDatabase } from "../connectToDB";
import { logger } from "../utils/logger";
import type { FigmaDesignData, FigmaNode } from "../../types/figma-design.types";
import {
    Colors,
    createButton,
    createCard,
    createInput,
    createNavbar,
    createDropShadow
} from "./figma-components";

/**
 * Auto-generate a Figma design based on the AI's description
 * CTO ADVISOR ONLY - Smart detection to avoid over-generation
 */
export async function autoGenerateFigmaDesign(
    aiResponse: string,
    userId: string,
    activeRole: string
): Promise<string | null> {
    if (activeRole.toLowerCase() !== "cto") {
        return null;
    }

    const lowerResponse = aiResponse.toLowerCase();

    // STRICT CRITERIA: Only generate Figma when explicitly requested or clearly beneficial

    // 1. Explicit user requests (highest priority)
    const explicitRequests = [
        /\b(create|design|build|make|generate)\s+(a|an)?\s*(figma|ui|interface|wireframe|mockup)/i,
        /figma\s+(design|mockup|wireframe)/i,
        /\b(show|give|provide)\s+me\s+(a|an)?\s*(design|ui|mockup)/i,
    ];

    const hasExplicitRequest = explicitRequests.some(pattern => pattern.test(aiResponse));

    // 2. Check if response is about UI/UX design (not just mentioning it)
    const isDesignFocused = (
        (lowerResponse.includes('design') || lowerResponse.includes('ui') || lowerResponse.includes('interface')) &&
        (lowerResponse.includes('page') || lowerResponse.includes('screen') || lowerResponse.includes('component'))
    );

    // 3. Specific page type mentions with design context
    const designKeywords = ['figma', 'wireframe', 'mockup', 'prototype', 'layout'];
    const hasDesignKeyword = designKeywords.some(keyword => lowerResponse.includes(keyword));

    // DECISION: Only generate if explicit request OR (design-focused AND has design keyword)
    const shouldGenerate = hasExplicitRequest || (isDesignFocused && hasDesignKeyword);

    if (!shouldGenerate) {
        logger.info("🎨 [AUTO-FIGMA] Skipping - no explicit design request detected");
        return null;
    }

    try {
        const designId = `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const designData = generateSimpleDesign(aiResponse);

        await connectToDatabase();
        await FigmaDesign.create({
            designId,
            designData,
            userId,
            activeRole: "cto",
        });

        logger.info("✅ [AUTO-FIGMA] Design auto-generated", {
            designId,
            userId,
            nodeCount: designData.nodes.length,
        });

        return designId;
    } catch (error) {
        logger.error("❌ [AUTO-FIGMA] Failed to auto-generate design:", error);
        return null;
    }
}

/**
 * Intelligently generate a design based on the AI response content
 * Analyzes the actual user request and context to determine the right design
 */
function generateSimpleDesign(aiResponse: string): FigmaDesignData {
    const lowerResponse = aiResponse.toLowerCase();

    // Extract what the user is actually asking for by looking for key phrases
    // Priority 1: Direct design requests (highest confidence)
    if (lowerResponse.match(/\b(create|design|build|make)\s+(a|an)?\s*(signup|registration|sign\s*up)\s+(page|form|screen)/i)) {
        logger.info("🎨 [FIGMA] Detected: Signup page request");
        return generateSignupPageDesign();
    }

    if (lowerResponse.match(/\b(create|design|build|make)\s+(a|an)?\s*(login|sign\s*in|auth)\s+(page|form|screen)/i)) {
        logger.info("🎨 [FIGMA] Detected: Login page request");
        return generateLoginPageDesign();
    }

    if (lowerResponse.match(/\b(create|design|build|make)\s+(a|an)?\s*(dashboard|admin\s*panel|analytics)/i)) {
        logger.info("🎨 [FIGMA] Detected: Dashboard request");
        return generateDashboardDesign();
    }

    if (lowerResponse.match(/\b(create|design|build|make)\s+(a|an)?\s*(landing|home|website|marketing)\s*(page|site)?/i)) {
        logger.info("🎨 [FIGMA] Detected: Landing page request");
        return generateLandingPageDesign();
    }

    // Priority 2: Look for "figma design of X" pattern
    const figmaMatch = lowerResponse.match(/figma\s+design\s+(?:of|for)\s+(?:a|an)?\s*(\w+(?:\s+\w+)?)/i);
    if (figmaMatch) {
        const designType = figmaMatch[1].toLowerCase();
        logger.info(`🎨 [FIGMA] Detected from 'figma design of': ${designType}`);

        if (designType.includes('signup') || designType.includes('registration')) {
            return generateSignupPageDesign();
        }
        if (designType.includes('login') || designType.includes('sign in')) {
            return generateLoginPageDesign();
        }
        if (designType.includes('dashboard') || designType.includes('admin')) {
            return generateDashboardDesign();
        }
        if (designType.includes('landing') || designType.includes('home') || designType.includes('website')) {
            return generateLandingPageDesign();
        }
    }

    // Priority 3: Specific page type mentions (only if clearly a design request)
    const hasDesignIntent = lowerResponse.includes('design') || lowerResponse.includes('figma') ||
        lowerResponse.includes('ui') || lowerResponse.includes('interface') ||
        lowerResponse.includes('wireframe') || lowerResponse.includes('mockup');

    if (hasDesignIntent) {
        // Now check for specific page types
        if (lowerResponse.includes('dashboard') || lowerResponse.includes('admin panel')) {
            logger.info("🎨 [FIGMA] Detected: Dashboard (design intent + keyword)");
            return generateDashboardDesign();
        }

        if (lowerResponse.includes('landing page') || lowerResponse.includes('homepage')) {
            logger.info("🎨 [FIGMA] Detected: Landing page (design intent + keyword)");
            return generateLandingPageDesign();
        }

        // Check for login BEFORE signup (login is more specific)
        if (lowerResponse.includes('login') || lowerResponse.includes('sign in')) {
            logger.info("🎨 [FIGMA] Detected: Login (design intent + keyword)");
            return generateLoginPageDesign();
        }

        if (lowerResponse.includes('signup') || lowerResponse.includes('registration')) {
            logger.info("🎨 [FIGMA] Detected: Signup (design intent + keyword)");
            return generateSignupPageDesign();
        }
    }

    // Priority 4: Default based on context clues
    // If mentions data/analytics → dashboard
    if (lowerResponse.includes('analytics') || lowerResponse.includes('metrics') ||
        lowerResponse.includes('statistics') || lowerResponse.includes('data visualization')) {
        logger.info("🎨 [FIGMA] Detected: Dashboard (context: analytics)");
        return generateDashboardDesign();
    }

    // If mentions marketing/product → landing page
    if (lowerResponse.includes('marketing') || lowerResponse.includes('product page') ||
        lowerResponse.includes('hero section') || lowerResponse.includes('call to action')) {
        logger.info("🎨 [FIGMA] Detected: Landing page (context: marketing)");
        return generateLandingPageDesign();
    }

    // Default: Landing page (most versatile and professional)
    logger.warn("⚠️ [AUTO-FIGMA] Could not determine specific design type, defaulting to landing page");
    return generateLandingPageDesign();
}

/**
 * Professional Signup Page
 */
function generateSignupPageDesign(): FigmaDesignData {
    // Card inputs and button
    const cardContent = [
        // Title
        {
            type: "TEXT" as const,
            name: "Title",
            x: 40, y: 40,
            characters: "Create an account",
            fontSize: 24,
            fontName: { family: "Inter", style: "Bold" },
            fills: [{ type: "SOLID", color: Colors.TextDark }],
        },
        // Subtitle
        {
            type: "TEXT" as const,
            name: "Subtitle",
            x: 40, y: 76,
            characters: "Enter your details below to get started.",
            fontSize: 14,
            fontName: { family: "Inter", style: "Regular" },
            fills: [{ type: "SOLID", color: Colors.TextMedium }],
        },
        // Inputs
        ...createInput("Full Name", "John Doe", 40, 120, 360),
        ...createInput("Email Address", "john@example.com", 40, 210, 360),
        ...createInput("Password", "••••••••", 40, 300, 360),
        // Button
        createButton("Sign Up", 40, 390, 360, "primary"),
        // Footer text
        {
            type: "TEXT" as const,
            name: "Footer",
            x: 40, y: 460,
            width: 360,
            textAlignHorizontal: "CENTER",
            characters: "Already have an account? Sign in",
            fontSize: 14,
            fontName: { family: "Inter", style: "Regular" },
            fills: [{ type: "SOLID", color: Colors.TextMedium }],
        },
    ];

    return {
        name: "Signup Page (Pro)",
        nodes: [
            // Background
            {
                type: "FRAME",
                name: "Page Background",
                x: 0, y: 0,
                width: 1440, height: 1024,
                fills: [{ type: "SOLID", color: Colors.Background }],
                children: [
                    createNavbar(1440, ["Product", "Solutions", "Pricing"]),
                    // Centered Card
                    createCard(500, 200, 440, 520, cardContent as FigmaNode[])
                ]
            }
        ]
    };
}

/**
 * Professional Login Page
 */
function generateLoginPageDesign(): FigmaDesignData {
    const cardContent = [
        {
            type: "TEXT" as const,
            name: "Title",
            x: 40, y: 40,
            characters: "Welcome back",
            fontSize: 24,
            fontName: { family: "Inter", style: "Bold" },
            fills: [{ type: "SOLID", color: Colors.TextDark }],
        },
        ...createInput("Email Address", "john@example.com", 40, 100, 360),
        ...createInput("Password", "••••••••", 40, 190, 360),
        createButton("Sign In", 40, 280, 360, "primary"),
        createButton("Sign in with Google", 40, 340, 360, "secondary"),
    ];

    return {
        name: "Login Page (Pro)",
        nodes: [
            {
                type: "FRAME",
                name: "Page Background",
                x: 0, y: 0,
                width: 1440, height: 1024,
                fills: [{ type: "SOLID", color: Colors.Background }],
                children: [
                    createNavbar(1440),
                    createCard(500, 200, 440, 440, cardContent)
                ]
            }
        ]
    };
}

/**
 * Production-Ready Dashboard with Complex Components
 */
function generateDashboardDesign(): FigmaDesignData {
    // Sidebar navigation
    const sidebar = {
        type: "FRAME" as const,
        name: "Sidebar",
        x: 0, y: 0,
        width: 240, height: 900,
        fills: [{ type: "SOLID", color: { r: 0.05, g: 0.05, b: 0.1, a: 1 } }],
        children: [
            // Logo
            {
                type: "TEXT" as const,
                name: "Logo",
                x: 24, y: 24,
                characters: "Dashboard",
                fontSize: 20,
                fontName: { family: "Inter", style: "Bold" },
                fills: [{ type: "SOLID", color: Colors.White }],
            },
            // Nav items
            ...["Overview", "Analytics", "Reports", "Settings"].map((item, i) => ({
                type: "FRAME" as const,
                name: `Nav-${item}`,
                x: 16, y: 80 + (i * 48),
                width: 208, height: 40,
                fills: i === 0 ? [{ type: "SOLID", color: Colors.Primary }] : [],
                cornerRadius: 8,
                children: [{
                    type: "TEXT" as const,
                    x: 16, y: 12,
                    characters: item,
                    fontSize: 14,
                    fontName: { family: "Inter", style: i === 0 ? "SemiBold" : "Regular" },
                    fills: [{ type: "SOLID", color: Colors.White }],
                }]
            }))
        ]
    };

    // Stats cards
    const statsCards = [
        { label: "Total Revenue", value: "$45,231", change: "+12.5%", color: Colors.Success },
        { label: "Active Users", value: "2,845", change: "+8.2%", color: Colors.Success },
        { label: "Conversion Rate", value: "3.24%", change: "-2.1%", color: Colors.Danger },
        { label: "Avg. Order Value", value: "$127", change: "+5.3%", color: Colors.Success },
    ].map((stat, i) =>
        createCard(260 + (i * 280), 24, 260, 120, [
            {
                type: "TEXT" as const,
                x: 20, y: 20,
                characters: stat.label,
                fontSize: 14,
                fontName: { family: "Inter", style: "Medium" },
                fills: [{ type: "SOLID", color: Colors.TextMedium }],
            },
            {
                type: "TEXT" as const,
                x: 20, y: 48,
                characters: stat.value,
                fontSize: 28,
                fontName: { family: "Inter", style: "Bold" },
                fills: [{ type: "SOLID", color: Colors.TextDark }],
            },
            {
                type: "TEXT" as const,
                x: 20, y: 88,
                characters: stat.change,
                fontSize: 14,
                fontName: { family: "Inter", style: "SemiBold" },
                fills: [{ type: "SOLID", color: stat.color }],
            },
        ])
    );

    // Chart placeholder
    const chartCard = createCard(260, 164, 1160, 320, [
        {
            type: "TEXT" as const,
            x: 24, y: 24,
            characters: "Revenue Overview",
            fontSize: 18,
            fontName: { family: "Inter", style: "Bold" },
            fills: [{ type: "SOLID", color: Colors.TextDark }],
        },
        // Chart bars (simplified visualization)
        ...Array.from({ length: 12 }, (_, i) => ({
            type: "RECTANGLE" as const,
            name: `Bar-${i}`,
            x: 40 + (i * 90), y: 260 - (Math.random() * 150),
            width: 60, height: Math.random() * 150 + 50,
            fills: [{ type: "SOLID", color: i % 3 === 0 ? Colors.Primary : Colors.Secondary }],
            cornerRadius: 4,
        })),
        // X-axis labels
        ...["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => ({
            type: "TEXT" as const,
            x: 45 + (i * 90), y: 275,
            characters: month,
            fontSize: 12,
            fontName: { family: "Inter", style: "Regular" },
            fills: [{ type: "SOLID", color: Colors.TextMedium }],
        }))
    ]);

    // Recent activity table
    const activityTable = createCard(260, 504, 760, 380, [
        {
            type: "TEXT" as const,
            x: 24, y: 24,
            characters: "Recent Activity",
            fontSize: 18,
            fontName: { family: "Inter", style: "Bold" },
            fills: [{ type: "SOLID", color: Colors.TextDark }],
        },
        // Table headers
        ...["User", "Action", "Time", "Status"].map((header, i) => ({
            type: "TEXT" as const,
            x: 24 + (i * 180), y: 64,
            characters: header,
            fontSize: 12,
            fontName: { family: "Inter", style: "SemiBold" },
            fills: [{ type: "SOLID", color: Colors.TextMedium }],
        })),
        // Table rows (5 rows)
        ...Array.from({ length: 5 }, (_, row) => [
            {
                type: "TEXT" as const,
                x: 24, y: 100 + (row * 48),
                characters: `User ${row + 1}`,
                fontSize: 14,
                fills: [{ type: "SOLID", color: Colors.TextDark }],
            },
            {
                type: "TEXT" as const,
                x: 204, y: 100 + (row * 48),
                characters: ["Purchase", "Login", "Update", "Delete", "Create"][row],
                fontSize: 14,
                fills: [{ type: "SOLID", color: Colors.TextMedium }],
            },
            {
                type: "TEXT" as const,
                x: 384, y: 100 + (row * 48),
                characters: `${row + 1}h ago`,
                fontSize: 14,
                fills: [{ type: "SOLID", color: Colors.TextMedium }],
            },
            createButton(["Success", "Pending", "Success", "Failed", "Success"][row], 564, 94 + (row * 48), 140, row % 2 === 0 ? "primary" : "secondary"),
        ]).flat()
    ]);

    // Quick actions card
    const quickActions = createCard(1040, 504, 380, 380, [
        {
            type: "TEXT" as const,
            x: 24, y: 24,
            characters: "Quick Actions",
            fontSize: 18,
            fontName: { family: "Inter", style: "Bold" },
            fills: [{ type: "SOLID", color: Colors.TextDark }],
        },
        createButton("Create Report", 24, 70, 332, "primary"),
        createButton("Export Data", 24, 130, 332, "secondary"),
        createButton("Invite Team", 24, 190, 332, "secondary"),
        createButton("View Settings", 24, 250, 332, "secondary"),
    ]);

    return {
        name: "Dashboard (Production)",
        nodes: [
            {
                type: "FRAME",
                name: "Dashboard Container",
                x: 0, y: 0,
                width: 1440, height: 900,
                fills: [{ type: "SOLID", color: Colors.Background }],
                children: [
                    sidebar,
                    ...statsCards,
                    chartCard,
                    activityTable,
                    quickActions
                ]
            }
        ]
    };
}

/**
 * Professional Landing Page
 */
function generateLandingPageDesign(): FigmaDesignData {
    return {
        name: "Landing Page (Pro)",
        nodes: [
            {
                type: "FRAME",
                name: "Landing Page",
                x: 0, y: 0,
                width: 1440, height: 2000,
                fills: [{ type: "SOLID", color: Colors.Background }],
                children: [
                    createNavbar(),
                    // Hero Section
                    {
                        type: "FRAME",
                        name: "Hero Section",
                        x: 0, y: 80,
                        width: 1440, height: 700,
                        fills: [{ type: "SOLID", color: Colors.Surface }],
                        children: [
                            {
                                type: "TEXT", x: 300, y: 150, width: 840, textAlignHorizontal: "CENTER",
                                characters: "Build faster with AI.", fontSize: 72, fontName: { family: "Inter", style: "Bold" },
                                fills: [{ type: "SOLID", color: Colors.TextDark }]
                            },
                            {
                                type: "TEXT", x: 420, y: 260, width: 600, textAlignHorizontal: "CENTER",
                                characters: "Generate comprehensive UI designs, components, and code in seconds. The future of design is here.",
                                fontSize: 20, fontName: { family: "Inter", style: "Regular" },
                                fills: [{ type: "SOLID", color: Colors.TextMedium }]
                            },
                            createButton("Get Started for Free", 620, 360, 200, "primary"),
                            // Hero Image Placeholder using Card
                            createCard(320, 460, 800, 400, [
                                { type: "TEXT", x: 350, y: 180, characters: "App Screenshot", fontSize: 16, fills: [{ type: "SOLID", color: Colors.TextMedium }] }
                            ])
                        ]
                    }
                ]
            }
        ]
    };
}

function generateGenericDesign(): FigmaDesignData {
    return {
        name: "Generic Design",
        nodes: [createCard(100, 100, 400, 300, [
            { type: "TEXT", x: 40, y: 40, characters: "Generic Design", fontSize: 24, fontName: { family: "Inter", style: "Bold" } }
        ])]
    };
}

