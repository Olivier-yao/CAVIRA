interface ProgressRingProps {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

export function ProgressRing({ pct, size = 64, stroke = 7, color = "var(--accent)", label }: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="progress-ring__arc"
        />
      </svg>
      <div className="progress-ring__center">
        <span className="progress-ring__pct">{pct}%</span>
        {label && <span className="progress-ring__label">{label}</span>}
      </div>
    </div>
  );
}
