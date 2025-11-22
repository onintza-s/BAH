import { useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { Detection } from '../types/detection';

type Props = {
  detections: Detection[];
};

export function ActivityOverlay({ detections }: Props) {
  const map = useMap();

  const points = useMemo(
    () =>
      detections.map((det) => {
        const { x, y, w, h } = det.bbox;
        const cx = x + w / 2;
        const cy = y + h / 2;

        const intensity = 0.8;

        return [cy, cx, intensity] as [number, number, number];
      }),
    [detections]
  );

  useEffect(() => {
    if (!map) return;
    if (points.length === 0) return;

    const anyL = L as any;
    if (!anyL.heatLayer) {
      console.warn('leaflet.heat not hooked into L');
      return;
    }

    const heatLayer = anyL.heatLayer(points, {
      radius: 55,
      blur: 35,
      maxZoom: 6,
      minOpacity: 0.25,
      gradient: {
        0.0: 'rgba(0,0,0,0)',
        0.2: '#22c55e',
        0.4: '#a3e635',
        0.6: '#facc15',
        0.8: '#fb923c',
        1.0: '#ef4444',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}
