import {
  MapContainer,
  TileLayer,
  Rectangle,
  useMap,
} from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { useEffect } from 'react';
import type { Detection } from '../types/detection';
import { getTheme } from '../theme/theme';
import { ActivityOverlay } from './ActivityOverlay';

const { palette: theme } = getTheme('dark');

type Props = {
  detections: Detection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  showActivity: boolean;
};

function detectionBounds(det: Detection): LatLngBoundsExpression {
  const { min_lat, min_lon, max_lat, max_lon } = det.bbox;
  return [
    [min_lat, min_lon],
    [max_lat, max_lon],
  ];
}

function allDetectionsBounds(detections: Detection[]): LatLngBoundsExpression {
  const lats: number[] = [];
  const lons: number[] = [];

  detections.forEach((d) => {
    lats.push(d.bbox.min_lat, d.bbox.max_lat);
    lons.push(d.bbox.min_lon, d.bbox.max_lon);
  });

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  return [
    [minLat, minLon],
    [maxLat, maxLon],
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
      map.fitBounds(fullBounds, { padding: [20, 20] });
      return;
    }

    const det = detections.find((d) => d.id === selectedId);
    if (!det) return;

    map.fitBounds(detectionBounds(det), { padding: [40, 40] });
  }, [selectedId, detections, fullBounds, map]);

  return null;
}

export function Map({
  detections,
  selectedId,
  onSelect,
  showActivity,
}: Props) {
  const bounds = allDetectionsBounds(detections);

  return (
    <MapContainer
      bounds={bounds}
      style={{ height: '100%', width: '100%' }}
      zoom={16}
      minZoom={10}
      maxZoom={19}
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      <ZoomOnSelection
        detections={detections}
        selectedId={selectedId}
        fullBounds={bounds}
      />

      {showActivity && <ActivityOverlay detections={detections} />}

      {detections.map((det) => {
        const rectBounds = detectionBounds(det);
        const isSelected = det.id === selectedId;

        return (
          <Rectangle
            key={det.id}
            bounds={rectBounds}
            pathOptions={{
              color: theme.accentPrimary,
              weight: isSelected ? 2 : 1,
              fillColor: theme.accentPrimary,
              fillOpacity: isSelected ? 0.22 : 0.08,
            }}
            eventHandlers={{
              click: () => onSelect(det.id),
            }}
          />
        );
      })}
    </ MapContainer>
  );
}
