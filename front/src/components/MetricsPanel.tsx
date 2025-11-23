import { getTheme } from '../theme/theme';
import type { Metrics } from '../types/detection';

const { palette } = getTheme('dark');

type Props = {
  metrics: Metrics;
};

export function MetricsPanel({ metrics }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1000,
        padding: '8px 12px',
        background: `${palette.backgroundAlt}90`,
        borderRadius: 8,
        fontSize: '0.8rem',
        lineHeight: 1.4,
        border: `1px solid ${palette.accentPrimary}90`,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        CPU Inference (16 cores, 32GB RAM)
      </div>
      <div>Images: {metrics.num_images}</div>
      <div>Detections: {metrics.num_detections}</div>
      <div>Total: {metrics.total_seconds.toFixed(2)} s</div>
      {metrics.avg_seconds_per_image !== null && (
        <div>Avg / image: {metrics.avg_seconds_per_image.toFixed(2)} s</div>
      )}
    </div>
  );
}
