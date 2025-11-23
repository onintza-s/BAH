import { useEffect, useState } from 'react';
import type { Detection, Tile } from './types/detection';
import { Map } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { getTheme } from './theme/theme';

const DETECTIONS_PATH = '/detections/detections_15_tiles.json';
const TILES_PATH = '/tiles/tiles.json';

const { palette } = getTheme('dark');

type DetectionTypeFilter = 'all' | string;

function App() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeType, setActiveType] = useState<DetectionTypeFilter>('all');
  const [showActivity, setShowActivity] = useState(false);
  const [minConfidence, setMinConfidence] = useState<number>(0);

  const handleSelected = (id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [detRes, tileRes] = await Promise.all([
          fetch(DETECTIONS_PATH),
          fetch(TILES_PATH),
        ]);

        const rawDetections = await detRes.json();
        const rawTiles = await tileRes.json();

        const mappedDetections: Detection[] = rawDetections
          .filter((d: any) => d && d.bbox && d.center)
          .map((d: any, idx: number) => ({
            id: `${d.file}-${idx}`,
            file: d.file,
            class: d.label,
            confidence: d.score,
            bbox: {
              min_lon: d.bbox.min_lon,
              min_lat: d.bbox.min_lat,
              max_lon: d.bbox.max_lon,
              max_lat: d.bbox.max_lat,
            },
          }));

        setDetections(mappedDetections);
        setTiles(rawTiles);
      } catch (err) {
        setError(String(err));
        console.error(err);
      }
    }

    loadData();
  }, []);

  if (error) {
    return <div style={{ color: palette.foreground }}>Error: {error}</div>;
  }

  if (detections.length === 0 || tiles.length === 0) {
    return <div style={{ color: palette.foreground }}>Loading...</div>;
  }

  const allTypes = Array.from(new Set<string>(detections.map((d) => d.class)));

  const filteredDetections: Detection[] = detections
    .filter((det) => (activeType === 'all' ? true : det.class === activeType))
    .filter((det) => det.confidence >= minConfidence);

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
          tiles={tiles}
          detections={filteredDetections}
          selectedId={selectedId}
          onSelect={handleSelected}
          showActivity={showActivity}
        />
      </div>

      <Sidebar
        detections={filteredDetections}
        allTypes={allTypes}
        activeType={activeType}
        onTypeChange={setActiveType}
        selectedId={selectedId}
        onSelect={handleSelected}
        showActivity={showActivity}
        onToggleActivity={setShowActivity}
        minConfidence={minConfidence}
        onConfidenceChange={setMinConfidence}
      />
    </div>
  );
}

export default App;
