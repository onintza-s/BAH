import { MapContainer, ImageOverlay, Rectangle, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import type { ImageDetections, Detection } from '../types/detection';
import { useEffect } from 'react';

type Props = {
  data: ImageDetections;
  imagePath: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function toRectBounds(det: Detection): LatLngBoundsExpression {
  const { x, y, w, h } = det.bbox;
  return [
    [y, x],
    [y + h, x + w],
  ];
}

function ZoomOnSelection({
  detections,
  selectedId,
}: {
  detections: Detection[];
  selectedId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const det = detections.find((d) => d.id === selectedId);
    if (!det) return;
    const b = toRectBounds(det);
    map.fitBounds(b, { maxZoom: 2, padding: [40, 40] });
  }, [selectedId, detections, map]);

  return null;
}

export function Map({ data, imagePath, selectedId, onSelect }: Props) {
  const { width, height, detections } = data;

  const bounds: LatLngBoundsExpression = [
    [0, 0],
    [height, width],
  ];

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      style={{ height: '100%', width: '100%' }}
      minZoom={-2}
      maxZoom={4}
    >
      <ImageOverlay url={imagePath} bounds={bounds} />

      <ZoomOnSelection detections={detections} selectedId={selectedId} />

      {detections.map((det) => {
        const rectBounds = toRectBounds(det);
        const isSelected = det.id === selectedId;

        return (
          <Rectangle
            key={det.id}
            bounds={rectBounds}
            pathOptions={{
              color: isSelected ? 'red' : 'grey',
              weight: isSelected ? 2 : 1,
            }}
            eventHandlers={{
              click: () => onSelect(det.id),
            }}
          />
        );
      })}
    </MapContainer>
  );
}
