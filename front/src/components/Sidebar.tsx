import type { Detection } from '../types/detection';
import { getTheme, spacing, radius } from '../theme/theme';

type Props = {
  detections: Detection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const { palette: theme } = getTheme('dark');

export function Sidebar({ detections, selectedId, onSelect }: Props) {
  return (
    <div
      style={{
        flex: 1,
        borderLeft: `1px solid ${theme.border}`,
        padding: `${spacing.md}px`,
        background: theme.backgroundAlt,
        color: theme.foreground,
        overflowY: 'auto',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <h2
        style={{
          margin: '0 0 1rem 0',
          fontSize: '0.95rem',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: theme.foregroundMuted,
        }}
      >
        Detections
      </h2>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {detections.map((det) => {
          const isSelected = det.id === selectedId;

          const background = isSelected
            ? `${theme.accentPrimary}20`
            : 'transparent';

          const borderColor = isSelected
            ? theme.accentPrimary
            : `${theme.accentPrimary}33`;

          return (
            <li
              key={det.id}
              onClick={() => onSelect(det.id)}
              style={{
                padding: `${spacing.sm}px ${spacing.md}px`,
                marginBottom: `${spacing.xs}px`,
                cursor: 'pointer',
                borderRadius: `${radius.sm}px`,
                background,
                border: `1px solid ${borderColor}`,
                transition:
                  'background 0.12s ease-out, border 0.12s ease-out, transform 0.08s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span style={{ fontWeight: 600 }}>{det.class}</span>
                <span
                  style={{
                    opacity: 0.7,
                    fontSize: '0.8rem',
                    color: theme.foregroundMuted,
                  }}
                >
                  {(det.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  opacity: 0.6,
                  lineHeight: 1.3,
                }}
              >
                x={det.bbox.x}, y={det.bbox.y}, w={det.bbox.w}, h={det.bbox.h}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
