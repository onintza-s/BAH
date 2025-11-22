import { useEffect, useState } from 'react';
import type { ImageDetections } from './types/detection';
import { Map } from './components/Map';

const IMAGE_PATH = '/images/photo_1.jpg';
const JSON_PATH = '/detections/photo_1.json';

function App() {
  const [data, setData] = useState<ImageDetections | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    return <div>Error</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh' }}>
      <Map
        data={data}
        imagePath={IMAGE_PATH}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}

export default App;
