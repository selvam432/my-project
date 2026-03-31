export default function ScoreRing({ score, size = 100 }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const gap = circumference - filled

  const color = score >= 70 ? '#43e97b' : score >= 45 ? '#ffd166' : '#ff6584'
  const label = score >= 70 ? 'Highly Suitable' : score >= 45 ? 'Moderate Fit' : 'Low Match'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-elevated)" strokeWidth={10}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text
          x={size / 2} y={size / 2 + 1}
          textAnchor="middle" dominantBaseline="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}
          fill={color}
          fontSize={size * 0.22}
          fontFamily="Syne, sans-serif"
          fontWeight="800"
        >
          {Math.round(score)}%
        </text>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
  )
}
