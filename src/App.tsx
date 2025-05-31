import { useEffect, useState } from 'react';
import './App.css';

type ColorSwatch = {
  title: string;
  color: string; // hex string
};

const App = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [savedColors, setSavedColors] = useState<ColorSwatch[]>([]);

  useEffect(() => {
    
    console.log('UI mounted');
    parent.postMessage({ pluginMessage: { type: 'PING' } }, '*');

    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;

      if (msg.type === 'COLOR_DATA') {
        setColors(msg.colors);
      }

      if (msg.type === 'SAVED_COLORS') {
        setSavedColors(msg.data);
      }
    };

    // On mount, try to fetch saved colors
    parent.postMessage({ pluginMessage: { type: 'getSaved' } }, '*');
  }, []);

  const sendMessage = (type: string, payload: any = {}) => {
    parent.postMessage({ pluginMessage: { type, ...payload } }, '*');
  };

  const handleSave = (hex: string) => {
    const title = prompt('Enter a title for this color:', hex);
    if (!title) return;

    sendMessage('colorSave', {
      colorSave: { color: hex, title },
    });

    // Optionally reload saved colors after save
    setTimeout(() => {
      sendMessage('getSaved');
    }, 100);
  };

  const handleApply = (hex: string) => {
    sendMessage('pick', {
      colorSave: { color: hex },
    });
  };

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h2>🎨 Detected Colors</h2>
      <button onClick={() => sendMessage('extractColors')}>🔄 Refresh Selection</button>
      {colors.length === 0 ? (
        <p>No colors found in selection</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 12 }}>
          {colors.map((hex, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div
                style={{
                  background: hex,
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                }}
                title={`Apply ${hex}`}
                onClick={() => handleApply(hex)}
              />
              <button onClick={() => handleSave(hex)} style={{ fontSize: 10, marginTop: 4 }}>
                Save
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: 24 }}>💾 Saved Swatches</h2>
      <button onClick={() => sendMessage('getSaved')}>📁 Load Saved Colors</button>
      {savedColors.length === 0 ? (
        <p>No saved colors yet</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 12 }}>
          {savedColors.map((swatch, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div
                style={{
                  background: swatch.color,
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                }}
                title={`Apply ${swatch.title}`}
                onClick={() => handleApply(swatch.color)}
              />
              <div style={{ fontSize: 10, marginTop: 4 }}>{swatch.title}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <button onClick={() => sendMessage('CLOSE_PLUGIN')}>❌ Close Plugin</button>
      </div>
    </div>
  );
};

export default App;
