import {
  MapContainer,
  TileLayer,
  Rectangle,
  ImageOverlay,
  useMap,
} from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { useEffect } from 'react';
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

function detectionsBounds(detections: Detection[]): LatLngBoundsExpression | null {
  if (detections.length === 0) return null;

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

function computeMapBounds(
  detections: Detection[],
  tiles: Tile[],
): LatLngBoundsExpression {
  const detBounds = detectionsBounds(detections);
  const tileBounds = tilesBounds(tiles);

  if (detBounds) return detBounds;
  if (tileBounds) return tileBounds;

  return [
    [51.88, 4.33],
    [51.90, 4.36],
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
  tiles,
  detections,
  selectedId,
  onSelect,
  showActivity,
}: Props) {
  const bounds = computeMapBounds(detections, tiles);

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
    </MapContainer>
  );
}
