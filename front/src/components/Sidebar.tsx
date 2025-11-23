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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: theme.foreground,
};

const mutedLabelStyle: React.CSSProperties = {
  opacity: 0.85,
  color: theme.foregroundMuted,
};

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
      }}
    >
      <div
        style={{
          padding: `${spacing.md}px`,
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: theme.foreground,
            }}
          >
            Detections
          </h2>
          <p
            style={{
              margin: `${spacing.xs}px 0 0 0`,
              fontSize: '0.8rem',
              color: theme.foregroundMuted,
            }}
          >
            Tracked items: {detections.length}
          </p>
        </div>

        <button
          onClick={onExportPdf}
          title="Export current view"
          style={{
            borderRadius: radius.round,
            border: `1px solid ${theme.accentPrimary}80`,
            background: `${theme.accentPrimary}10`,
            color: theme.foreground,
            padding: '4px 10px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            outline: 'none',
            transition:
              'background 0.15s ease, border-color 0.15s ease, transform 0.08s',
          }}
        >
          <span>Export</span>
        </button>
      </div>

      <div
        style={{
          padding: `${spacing.md}px`,
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
          fontSize: '0.8rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.sm,
          }}
        >
          <div style={sectionTitleStyle}>Filters</div>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={mutedLabelStyle}>Object type</span>
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
              <option value="all">All types</option>
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
              gap: 6,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={mutedLabelStyle}>Min confidence</span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: radius.round,
                  border: `1px solid ${theme.border}`,
                  background: theme.background,
                  color: theme.foregroundMuted,
                }}
              >
                ≥ {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={minConfidence}
              onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
              style={{
                width: '100%',
                WebkitAppearance: 'none',
                height: 4,
                borderRadius: 2,
                background: theme.border,
                outline: 'none',
                cursor: 'pointer',
                accentColor: theme.accentPrimary,
              }}
            />
          </label>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.sm,
          }}
        >
          <div style={sectionTitleStyle}>Display</div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.sm,
            }}
          >
            <span style={{ opacity: 0.9, color: theme.foregroundMuted }}>
              High activity overlay
            </span>

            <button
              type="button"
              onClick={() => onToggleActivity(!showActivity)}
              style={{
                width: 38,
                height: 20,
                borderRadius: 999,
                border: `1px solid ${theme.accentPrimary}90`,
                background: showActivity
                  ? `${theme.accentPrimary}20`
                  : theme.background,
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: showActivity ? 'flex-end' : 'flex-start',
                cursor: 'pointer',
                outline: 'none',
                transition:
                  'background 0.15s ease, border-color 0.15s ease, justify-content 0.15s ease',
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '999px',
                  background: `${theme.accentPrimary}90`,
                  boxShadow: '0 0 4px rgba(0,0,0,0.6)',
                }}
              />
            </button>
          </div>
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
                  borderRadius: radius.sm,
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
                    fontFamily: 'JetBrains Mono, monospace',
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
    </div >
  );
}
