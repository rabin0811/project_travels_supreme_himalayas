export default function Logo({ size = 46, light = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Trekking with Rabin logo">
      <defs>
        <linearGradient id="lg-peaks" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light ? '#3A5A8C' : '#A9C6E8'} />
          <stop offset="55%" stopColor={light ? '#5C7FB0' : '#D7E3F2'} />
          <stop offset="100%" stopColor={light ? '#3A5A8C' : '#A9C6E8'} />
        </linearGradient>
      </defs>
      <polygon points="6,46 22,16 30,38 40,22 58,46" fill="url(#lg-peaks)" />
      <polygon points="22,16 27,6 32,14 27,22" fill={light ? '#EDF3FA' : '#FFFFFF'} opacity="0.9" />
      <polygon points="8,52 22,40 28,52 22,56" fill="#0F1A33" opacity="0.85" />
      <polygon points="0,58 22,46 40,52 64,44 64,64 0,64" fill="#0F1A33" opacity="0.9" />
      <polyline points="24,58 34,48 44,58" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.85" />
      <g transform="rotate(6 52 12)">
        <rect x="52" y="8" width="3" height="16" fill="#E8913A" />
        <rect x="55" y="6" width="3" height="16" fill="#A9C6E8" />
        <rect x="58" y="4" width="3" height="16" fill="#3A5A8C" />
        <rect x="61" y="8" width="3" height="16" fill="#ffffff" />
      </g>
    </svg>
  );
}
