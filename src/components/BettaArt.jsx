import { useId } from 'react';

// Ilustração vetorial de um Betta, usada enquanto as fotos reais não chegam.
// tail: 'crown' | 'half' | 'plakat'

const rad = (d) => (d * Math.PI) / 180;
const pt = (ox, oy, a, r) => [ox + r * Math.cos(rad(a)), oy - r * Math.sin(rad(a))];
const f = (n) => n.toFixed(1);

function fan({ ox, oy, a0, a1, L, rays, web, spiky, jitter = 0.06 }) {
  const tips = [];
  for (let i = 0; i <= rays; i++) {
    const a = a0 + ((a1 - a0) * i) / rays;
    // leve variação no comprimento dos raios para parecer orgânico
    const k = 1 - jitter * Math.abs(Math.sin(i * 1.7));
    tips.push({ a, p: pt(ox, oy, a, L * k) });
  }
  let d = `M${f(ox)},${f(oy)} L${f(tips[0].p[0])},${f(tips[0].p[1])}`;
  for (let i = 0; i < tips.length - 1; i++) {
    const mid = (tips[i].a + tips[i + 1].a) / 2;
    const next = tips[i + 1].p;
    if (spiky) {
      const v = pt(ox, oy, mid, L * web);
      d += ` Q${f(v[0])},${f(v[1])} ${f(next[0])},${f(next[1])}`;
    } else {
      const c = pt(ox, oy, mid, L * 1.04);
      d += ` Q${f(c[0])},${f(c[1])} ${f(next[0])},${f(next[1])}`;
    }
  }
  d += ' Z';
  return { d, tips: tips.map((t) => t.p) };
}

export default function BettaArt({ art, animate = true, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { tail, body, fin, ears, scales, koi } = art;
  const crown = tail === 'crown';
  const plakat = tail === 'plakat';

  const T = { ox: 226, oy: 130 };
  const tailFan = fan({
    ...T,
    a0: plakat ? -48 : crown ? -82 : -88,
    a1: plakat ? 48 : crown ? 82 : 88,
    L: plakat ? 82 : 122,
    rays: plakat ? 8 : 13,
    web: 0.58,
    spiky: crown,
  });
  const dorsal = fan({
    ox: 180, oy: 108, a0: 22, a1: 112,
    L: plakat ? 50 : 86, rays: plakat ? 5 : 8, web: 0.6, spiky: crown,
  });
  const anal = fan({
    ox: 168, oy: 150, a0: -22, a1: -128,
    L: plakat ? 52 : 92, rays: plakat ? 6 : 9, web: 0.6, spiky: crown,
  });
  const pectoral = ears
    ? fan({ ox: 110, oy: 138, a0: -92, a1: -178, L: 70, rays: 7, web: 0.9, spiky: false, jitter: 0.02 })
    : fan({ ox: 110, oy: 138, a0: -120, a1: -170, L: 26, rays: 4, web: 0.9, spiky: false, jitter: 0 });

  const bodyPath =
    'M64,130 C64,108 100,96 146,99 C186,102 214,114 236,126 C214,142 186,154 146,157 C102,160 64,152 64,130 Z';

  const id = (s) => `${s}${uid}`;

  return (
    <svg
      viewBox="0 0 370 260"
      className={`betta-art ${animate ? 'is-swimming' : ''} ${className}`}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={id('tf')} gradientUnits="userSpaceOnUse" cx={T.ox} cy={T.oy} r={plakat ? 82 : 122}>
          <stop offset="0" stopColor={fin[0]} />
          <stop offset="0.7" stopColor={fin[0]} stopOpacity="0.95" />
          <stop offset="1" stopColor={fin[1]} />
        </radialGradient>
        <radialGradient id={id('df')} gradientUnits="userSpaceOnUse" cx="180" cy="108" r="90">
          <stop offset="0" stopColor={fin[0]} />
          <stop offset="1" stopColor={fin[1]} />
        </radialGradient>
        <radialGradient id={id('af')} gradientUnits="userSpaceOnUse" cx="168" cy="150" r="95">
          <stop offset="0" stopColor={fin[0]} />
          <stop offset="1" stopColor={fin[1]} />
        </radialGradient>
        <linearGradient id={id('bd')} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="1" stopColor={body[1]} />
        </linearGradient>
        <linearGradient id={id('sh')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <radialGradient id={id('ear')} gradientUnits="userSpaceOnUse" cx="110" cy="138" r="72">
          <stop offset="0" stopColor={ears ? ears[0] : fin[0]} />
          <stop offset="1" stopColor={ears ? ears[1] : fin[1]} />
        </radialGradient>
        <pattern id={id('sc')} width="9" height="7" patternUnits="userSpaceOnUse">
          <path d="M0,7 Q4.5,0 9,7" fill="none" stroke="#fff" strokeWidth="0.9" />
        </pattern>
        <clipPath id={id('clip')}>
          <path d={bodyPath} />
        </clipPath>
      </defs>

      {/* cauda */}
      <g className="betta-tail" style={{ transformOrigin: `${T.ox}px ${T.oy}px` }}>
        <path d={tailFan.d} fill={`url(#${id('tf')})`} />
        {tailFan.tips.map(([x, y], i) => (
          <line key={i} x1={T.ox} y1={T.oy} x2={x} y2={y} stroke={fin[1]} strokeOpacity="0.35" strokeWidth="1.1" />
        ))}
      </g>

      {/* dorsal e anal */}
      <g className="betta-dorsal" style={{ transformOrigin: '180px 108px' }}>
        <path d={dorsal.d} fill={`url(#${id('df')})`} />
        {dorsal.tips.map(([x, y], i) => (
          <line key={i} x1="180" y1="108" x2={x} y2={y} stroke={fin[1]} strokeOpacity="0.3" strokeWidth="1" />
        ))}
      </g>
      <g className="betta-anal" style={{ transformOrigin: '168px 150px' }}>
        <path d={anal.d} fill={`url(#${id('af')})`} />
        {anal.tips.map(([x, y], i) => (
          <line key={i} x1="168" y1="150" x2={x} y2={y} stroke={fin[1]} strokeOpacity="0.3" strokeWidth="1" />
        ))}
      </g>

      {/* ventrais */}
      <path d="M122,152 Q118,190 108,214 Q124,190 132,153 Z" fill={fin[0]} />

      {/* corpo */}
      <path d={bodyPath} fill={`url(#${id('bd')})`} />
      <g clipPath={`url(#${id('clip')})`}>
        {koi && (
          <>
            <ellipse cx="150" cy="112" rx="26" ry="14" fill="#f07a24" />
            <ellipse cx="196" cy="140" rx="20" ry="12" fill="#1d1d1d" />
            <ellipse cx="104" cy="146" rx="14" ry="9" fill="#e5561b" />
            <ellipse cx="226" cy="120" rx="12" ry="9" fill="#1d1d1d" />
          </>
        )}
        <rect x="60" y="90" width="190" height="80" fill={`url(#${id('sc')})`} opacity={scales ? 0.55 : 0.14} />
        <path d={bodyPath} fill={`url(#${id('sh')})`} />
      </g>

      {/* opérculo e boca */}
      <path d="M108,108 Q100,130 110,152" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M64,131 Q69,134 74,132" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />

      {/* peitoral */}
      <g className="betta-pec" style={{ transformOrigin: '110px 138px' }}>
        <path d={pectoral.d} fill={`url(#${id('ear')})`} opacity={ears ? 0.95 : 0.6} />
      </g>

      {/* olho */}
      <circle cx="86" cy="122" r="7" fill="#0b0b10" />
      <circle cx="84" cy="120" r="2.2" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}
