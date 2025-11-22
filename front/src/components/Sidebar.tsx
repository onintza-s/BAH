import type { Detection } from '../types/detection';

type Props = {
  detections: Detection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function Sidebar({ detections, selectedId, onSelect }: Props) {
  return (
    <div
      style={{
        flex: 1,
        borderLeft: '1px solid grey',
        padding: '1rem',
        background: '#0A0A0A',
        color: '#f5f5f5',
        overflowY: 'auto',
      }}
    >
      <h2>Detections</h2>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {detections.map((det) => {
          const isSelected = det.id === selectedId;

          return (
            <li
              key={det.id}
              onClick={() => onSelect(det.id)}
              style={{
                padding: '0.5rem',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                borderRadius: '6px',
                background: isSelected ? '#ff000010' : 'transparent',
                border: isSelected
                  ? '1px solid red'
                  : '1px solid grey',
                transition: 'all 0.15s',
              }}
            >
              <div>
                <strong>{det.class}</strong>{' '}
                <span style={{ opacity: 0.7 }}>
                  {(det.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                bbox: x={det.bbox.x}, y={det.bbox.y}, w={det.bbox.w}, h={det.bbox.h}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
