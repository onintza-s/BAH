import {
  MapContainer,
  TileLayer,
  Rectangle,
  ImageOverlay,
  useMap,
} from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { useEffect, useMemo } from 'react';
import type { Detection, Tile } from '../types/detection';
import { getTheme } from '../theme/theme';
import { ActivityOverlay } from './ActivityOverlay';

const { palette: theme } = getTheme('dark');

type Props = {
  tiles: Tile[];
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

function tilesBounds(tiles: Tile[]): LatLngBoundsExpression | null {
  if (tiles.length === 0) return null;

  const lats: number[] = [];
  const lons: number[] = [];

  tiles.forEach((t) => {
    const [[minLat, minLon], [maxLat, maxLon]] = t.bounds;
    lats.push(minLat, maxLat);
    lons.push(minLon, maxLon);
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
  tilesBounds,
}: {
  detections: Detection[];
  selectedId: string | null;
  tilesBounds: LatLngBoundsExpression;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) {
      map.fitBounds(tilesBounds, { padding: [30, 30] });
      return;
    }

    const det = detections.find((d) => d.id === selectedId);
    if (!det) return;

    map.fitBounds(detectionBounds(det), { padding: [40, 40] });
  }, [selectedId, map, tilesBounds]);

  return null;
}

export function Map({
  tiles,
  detections,
  selectedId,
  onSelect,
  showActivity,
}: Props) {
  const bounds = useMemo(
    () =>
    (tilesBounds(tiles) ?? ([
      [51.88, 4.33],
      [51.90, 4.36],
    ] as LatLngBoundsExpression)),
    [tiles]
  );

  return (
    <MapContainer
      bounds={bounds}
      style={{ height: '100%', width: '100%' }}
      zoom={16}
      minZoom={10}
      maxZoom={18}
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      {tiles.map((tile) => (
        <ImageOverlay
          key={tile.file}
          url={`/tiles/${tile.file}`}
          bounds={tile.bounds as LatLngBoundsExpression}
          opacity={0.9}
        />
      ))}

      <ZoomOnSelection
        detections={detections}
        selectedId={selectedId}
        tilesBounds={bounds}
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
              color: isSelected ? theme.accentSecondary : theme.accentPrimary,
              weight: isSelected ? 3 : 1,
              fillColor: theme.accentPrimary,
              fillOpacity: isSelected ? 0.32 : 0.08,
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
