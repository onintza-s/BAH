import type { Detection } from '../types/detection';
import { getTheme, spacing, radius } from '../theme/theme';

type Props = {
  detections: Detection[];
  allTypes: string[];
  activeType: string | 'all';
  onTypeChange: (value: string | 'all') => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  showActivity: boolean;
  onToggleActivity: (value: boolean) => void;
  minConfidence: number;
  onConfidenceChange: (value: number) => void;
  onExportPdf: () => void;
};

const { palette: theme } = getTheme('dark');

export function Sidebar({
  detections,
  allTypes,
  activeType,
  onTypeChange,
  selectedId,
  onSelect,
  showActivity,
  onToggleActivity,
  minConfidence,
  onConfidenceChange,
  onExportPdf,
}: Props) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${theme.border}`,
        background: theme.backgroundAlt,
        color: theme.foreground,
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          padding: `${spacing.md}px`,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <h2
          style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: theme.foregroundMuted,
          }}
        >
          Detections
        </h2>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.sm,
            fontSize: '0.8rem',
            marginBottom: spacing.sm,
          }}
        >
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ opacity: 0.8 }}>Type</span>
            <select
              value={activeType}
              onChange={(e) =>
                onTypeChange(e.target.value === 'all' ? 'all' : e.target.value)
              }
              style={{
                background: theme.background,
                color: theme.foreground,
                borderRadius: radius.sm,
                border: `1px solid ${theme.border}`,
                fontSize: '0.8rem',
                padding: '4px 6px',
                outline: 'none',
              }}
            >
              <option value="all">All</option>
              {allTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: '0.8rem',
              opacity: 0.9,
            }}
          >
            <span>
              Confidence ≥ {(minConfidence * 100).toFixed(0)}%
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={minConfidence}
              onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
              style={{
                width: '100%',
              }}
            />
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8rem',
              opacity: 0.85,
              marginTop: spacing.xs,
            }}
          >
            <input
              type="checkbox"
              checked={showActivity}
              onChange={(e) => onToggleActivity(e.target.checked)}
            />
            High activity overlay
          </label>

          <p
            style={{
              color: theme.foregroundMuted,
              fontSize: '0.8rem',
              margin: `${spacing.xs}px 0 0 0`,
            }}
          >
            Tracked items: {detections.length}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: spacing.sm,
            marginTop: spacing.sm,
          }}
        >
          <button
            onClick={onExportPdf}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: radius.sm,
              border: `1px solid ${theme.accentPrimary}`,
              background: `${theme.accentPrimary}20`,
              color: theme.foreground,
              fontSize: '0.8rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
          >
            Export current view
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${spacing.md}px`,
        }}
      >
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
                  marginBottom: `${spacing.sm}px`,
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
                  lon [{det.bbox.min_lon.toFixed(5)} –{' '}
                  {det.bbox.max_lon.toFixed(5)}], lat [
                  {det.bbox.min_lat.toFixed(5)} –{' '}
                  {det.bbox.max_lat.toFixed(5)}]
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
