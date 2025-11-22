import { MapContainer, ImageOverlay, Rectangle, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import type { ImageDetections, Detection } from '../types/detection';
import { useEffect } from 'react';
import { getTheme } from '../theme/theme';

const { palette: theme } = getTheme('dark');

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
  fullBounds,
}: {
  detections: Detection[];
  selectedId: string | null;
  fullBounds: LatLngBoundsExpression;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) {
      map.fitBounds(fullBounds, {
        maxZoom: -1,
        padding: [20, 20],
      });
      return;
    }

    const det = detections.find((d) => d.id === selectedId);
    if (!det) return;

    const b = toRectBounds(det);

    map.fitBounds(b, {
      maxZoom: 2,
      padding: [40, 40],
    });
  }, [selectedId, detections, fullBounds, map]);

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

      <ZoomOnSelection
        detections={detections}
        selectedId={selectedId}
        fullBounds={bounds}
      />

      {detections.map((det) => {
        const rectBounds = toRectBounds(det);
        const isSelected = det.id === selectedId;

        const strokeColor = theme.accentPrimary;
        const fillColor = theme.accentPrimary;

        return (
          <Rectangle
            key={det.id}
            bounds={rectBounds}
            pathOptions={{
              color: strokeColor,
              weight: isSelected ? 2 : 1,
              fillColor: fillColor,
              fillOpacity: isSelected ? 0.22 : 0.08,
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
