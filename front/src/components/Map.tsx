import { MapContainer, ImageOverlay, Rectangle } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import type { ImageDetections, Detection } from '../types/detection';

type Props = {
  data: ImageDetections;
  imagePath: string;
};

function toRectBounds(det: Detection): LatLngBoundsExpression {
  const { x, y, w, h } = det.bbox;
  return [
    [y, x],
    [y + h, x + w],
  ];
}

export function Map({ data, imagePath }: Props) {
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

      {detections.map((det) => {
        const rectBounds = toRectBounds(det);

        return (
          <Rectangle
            key={det.id}
            bounds={rectBounds}
            pathOptions={{ color: 'grey', weight: 1 }}
          />
        );
      })}
    </MapContainer>
  );
}
