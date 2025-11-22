import { useEffect, useState } from 'react';
import type { ImageDetections } from './types/detection';
import { Map } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { getTheme } from './theme/theme';

const IMAGE_PATH = '/images/photo_1.jpg';
const JSON_PATH = '/detections/photo_1.json';

const { palette } = getTheme('dark');

function App() {
  const [data, setData] = useState<ImageDetections | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelected = (id: string) => {
    setSelectedId((current) => (current === id ? null : id))
  }

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(JSON_PATH);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(String(err));
        console.error(err);
      }
    }

    loadData();
  }, []);

  if (error) {
    return <div style={{ color: palette.foreground }}>Error</div>;
  }

  if (!data) {
    return <div style={{ color: palette.foreground }}>Loading...</div>;
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: palette.background,
        color: palette.foreground,
      }}
    >
      <div style={{ flex: 4 }}>
        <Map
          data={data}
          imagePath={IMAGE_PATH}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <Sidebar
        detections={data.detections}
        selectedId={selectedId}
        onSelect={handleSelected}
      />
    </div>
  );
}

export default App;
