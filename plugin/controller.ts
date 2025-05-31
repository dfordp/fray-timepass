figma.showUI(__html__, { width: 300, height: 450 });

type RGB = { r: number; g: number; b: number };

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): RGB {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!parsed) throw new Error('Invalid HEX');
  return {
    r: parseInt(parsed[1], 16) / 255,
    g: parseInt(parsed[2], 16) / 255,
    b: parseInt(parsed[3], 16) / 255,
  };
}

function extractColorsFromSelection(): string[] {
  const colorSet = new Set<string>();
  for (const node of figma.currentPage.selection) {
    if ('fills' in node && Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.visible !== false) {
          const { r, g, b } = fill.color;
          const hex = rgbToHex(r, g, b);
          colorSet.add(hex);
        }
      }
    }
  }
  return Array.from(colorSet);
}


figma.ui.onmessage = (msg: {
  type: string;
  colorSave?: { color: RGB | string; title: string };
}) => {
  const savedPage = figma.root.findOne((node) => node.name === 'better-color') as PageNode;

    if (msg.type === 'PING') {
    console.log('UI is ready');
  }

  if (msg.type === 'colorSave' && msg.colorSave) {
    const colorRGB: RGB = typeof msg.colorSave.color === 'string'
      ? hexToRgb(msg.colorSave.color)
      : msg.colorSave.color;

    const rect = figma.createRectangle();
    rect.name = msg.colorSave.title || Math.random().toString(36).substr(2, 11);
    rect.fills = [{ type: 'SOLID', color: colorRGB }];

    if (savedPage) {
      savedPage.appendChild(rect);
    } else {
      const newPage = figma.createPage();
      newPage.name = 'better-color';
      figma.root.appendChild(newPage);
      newPage.appendChild(rect);
    }
  }

  else if (msg.type === 'pick' && msg.colorSave) {
    const colorRGB: RGB = typeof msg.colorSave.color === 'string'
      ? hexToRgb(msg.colorSave.color)
      : msg.colorSave.color;

    for (const node of figma.currentPage.selection) {
      if ('fills' in node) {
        node.fills = [{ type: 'SOLID', color: colorRGB }];
      }
    }
  }

  else if (msg.type === 'getSaved') {
    if (savedPage) {
      const data = savedPage.children
        .filter((item) => item.type === 'RECTANGLE')
        .map((item) => {
          const rect = item as RectangleNode;
          const fill = rect.fills?.[0];
          if (fill && fill.type === 'SOLID') {
            return {
              title: rect.name,
              color: rgbToHex(fill.color.r, fill.color.g, fill.color.b),
            };
          }
        })
        .filter(Boolean);
      figma.ui.postMessage({ type: 'SAVED_COLORS', data });
    } else {
      figma.ui.postMessage({ type: 'SAVED_COLORS', data: [] });
    }
  }

  else if (msg.type === 'extractColors') {
    const colors = extractColorsFromSelection();
    figma.ui.postMessage({ type: 'COLOR_DATA', colors });
  }

  else if (msg.type === 'CLOSE_PLUGIN') {
    figma.closePlugin();
  }
};
