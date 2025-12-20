# 021 CTO Design Generator - Figma Plugin

This Figma plugin allows you to generate designs created by the **CTO advisor** directly in your Figma files.

## Features

- **CTO Exclusive**: Only the CTO advisor can generate Figma designs
- **One-Click Generation**: Paste a design ID and instantly create the design in Figma
- **Unlimited & Free**: No API costs, works in Figma Web and Desktop
- **Automatic Rendering**: Supports frames, rectangles, text, ellipses, and nested components

## Installation

### Prerequisites

- Figma Desktop or Figma Web account
- Node.js 18+ (for building the plugin)

### Steps

1. **Install Dependencies**

   ```bash
   cd figma-plugin
   npm install
   ```

2. **Build the Plugin**

   ```bash
   npm run build
   ```

   This compiles `code.ts` to `code.js`.

3. **Import Plugin in Figma**

   - Open Figma Desktop or Figma Web
   - Go to **Plugins** → **Development** → **Import plugin from manifest**
   - Select `figma-plugin/manifest.json`
   - The plugin is now installed!

## Usage

### Step 1: Get a Design from CTO Advisor

1. Open the 021 app and navigate to the chat
2. Select the **CTO advisor**
3. Ask for a design, for example:
   - "Create a login page design"
   - "Design a dashboard with sidebar and main content"
   - "Generate a landing page wireframe"

4. The CTO will respond with a design link containing a `designId`, like:
   ```
   Generate in Figma: [Open Design](figma://design_1234567890_abc)
   ```

5. Copy the `designId` (e.g., `design_1234567890_abc`)

### Step 2: Generate Design in Figma

1. Open a Figma file
2. Run the plugin: **Plugins** → **Development** → **021 CTO Design Generator**
3. Paste the `designId` in the input field
4. Click **Generate Design**
5. The design will appear on your canvas!

## Development

### Watch Mode

For development, you can run TypeScript in watch mode:

```bash
npm run watch
```

This will automatically recompile `code.ts` whenever you make changes.

### Testing

1. Make changes to `code.ts` or `ui.html`
2. Rebuild: `npm run build`
3. In Figma, go to **Plugins** → **Development** → **021 CTO Design Generator**
4. Test the plugin with a valid `designId`

## Architecture

### Files

- **`manifest.json`**: Plugin configuration
- **`code.ts`**: Main plugin logic (TypeScript)
- **`code.js`**: Compiled plugin code (generated)
- **`ui.html`**: Plugin user interface
- **`tsconfig.json`**: TypeScript configuration
- **`package.json`**: Dependencies and scripts

### How It Works

1. User enters a `designId` in the plugin UI
2. UI sends a message to `code.ts` via `postMessage`
3. `code.ts` fetches design data from `/api/figma-design/fetch?designId=...`
4. Design data is parsed and Figma nodes are created
5. Nodes are added to the current page and selected

### API Integration

The plugin fetches design data from:

```
GET /api/figma-design/fetch?designId={designId}
```

Response format:

```json
{
  "success": true,
  "designData": {
    "nodes": [
      {
        "type": "RECTANGLE",
        "name": "Button",
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 40,
        "fills": [{ "type": "SOLID", "color": { "r": 0.2, "g": 0.6, "b": 1, "a": 1 } }]
      }
    ]
  }
}
```

## Troubleshooting

### Plugin Not Showing Up

- Make sure you imported the plugin from `manifest.json`
- Check that `code.js` exists (run `npm run build`)
- Restart Figma Desktop

### "Failed to fetch design data"

- Verify the `designId` is correct
- Check that the 021 app is running (`npm run dev`)
- Ensure the API endpoint is accessible

### "Design not found"

- The design may have expired (designs auto-delete after 30 days)
- Ask the CTO advisor to generate a new design

## Security

- **CTO-Only Creation**: Only the CTO advisor can create designs (enforced at API level)
- **Public Fetch**: The fetch endpoint is public (no auth) to work with Figma's security model
- **CORS Enabled**: API allows cross-origin requests from Figma

## Limitations

- Designs expire after 30 days (automatic cleanup)
- Only supports basic Figma node types (rectangles, text, frames, ellipses, lines)
- Complex vector graphics and images are not supported

## Support

For issues or questions, please contact the 021 development team.

---

**Built with ❤️ for the 021 CTO Advisor**
