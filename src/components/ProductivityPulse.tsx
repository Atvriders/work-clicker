import React, { useState, useEffect, useRef } from 'react';

interface ProductivityPulseProps {
  wp: number;
  totalWp: number;
  wpPerSecond: number;
  wpPerClick: number;
  shiftsCompleted: number;
  overtimeMinutes: number;
  isOnShift: boolean;
  prestigeLevel: number;
  totalClicks: number;
}

const formatNumber = (n: number): string => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(n % 1 === 0 ? 0 : 1);
};

const headerStyle: React.CSSProperties = {
  fontSize: '10px',
  fontFamily: '"JetBrains Mono", monospace',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  color: '#3E4E60',
  margin: 0,
  marginBottom: '6px',
};

const ProductivityPulse: React.FC<ProductivityPulseProps> = ({
  wpPerSecond,
  isOnShift,
  shiftsCompleted,
  overtimeMinutes,
  prestigeLevel,
  totalClicks,
}) => {
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const readingsRef = useRef<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const readings = readingsRef.current;
      readings.push(wpPerSecond);
      if (readings.length > 30) {
        readings.shift();
      }
      setSparklineData([...readings]);
    }, 2000);

    return () => clearInterval(interval);
  }, [wpPerSecond]);

  // --- Section 1: WPS Sparkline ---
  const svgWidth = 300;
  const svgHeight = 50;
  const maxVal = Math.max(...sparklineData, 1);
  const points = sparklineData.map((val, i) => {
    const x = (i / Math.max(sparklineData.length - 1, 1)) * svgWidth;
    const y = svgHeight - (val / maxVal) * (svgHeight - 4) - 2;
    return `${x},${y}`;
  });
  const polylinePoints = points.join(' ');
  const areaPoints =
    sparklineData.length > 0
      ? `0,${svgHeight} ${polylinePoints} ${svgWidth},${svgHeight}`
      : '';
  const isIdle = wpPerSecond === 0 && sparklineData.every((v) => v === 0);

  // --- Section 2: Corporate Mood Meter ---
  let moodScore = 0;
  if (wpPerSecond > 0) moodScore += 20;
  if (wpPerSecond > 100) moodScore += 20;
  if (wpPerSecond > 1000) moodScore += 10;
  if (isOnShift) moodScore += 15;
  if (overtimeMinutes === 0) moodScore += 10;
  if (shiftsCompleted > 0) moodScore += 10;
  if (prestigeLevel > 0) moodScore += 15;
  moodScore = Math.min(moodScore, 100);

  let moodLabel: string;
  let moodColor: string;
  let filledSegments: number;

  if (moodScore <= 20) {
    moodLabel = 'BURNOUT';
    moodColor = '#FF2E2E';
    filledSegments = 1;
  } else if (moodScore <= 40) {
    moodLabel = 'STRESSED';
    moodColor = '#FF8C00';
    filledSegments = 2;
  } else if (moodScore <= 60) {
    moodLabel = 'COPING';
    moodColor = '#FFB800';
    filledSegments = 3;
  } else if (moodScore <= 80) {
    moodLabel = 'PRODUCTIVE';
    moodColor = '#88CC00';
    filledSegments = 4;
  } else {
    moodLabel = 'THRIVING';
    moodColor = '#00FF66';
    filledSegments = 5;
  }

  // --- Section 3: Milestones ---
  const milestones = [
    {
      icon: '⌨',
      label: 'CLICKS',
      value: formatNumber(totalClicks),
      color: '#00FF66',
    },
    {
      icon: '🔄',
      label: 'SHIFTS',
      value: formatNumber(shiftsCompleted),
      color: '#FFB800',
    },
    {
      icon: '⏰',
      label: 'OVERTIME',
      value: overtimeMinutes + 'm',
      color: overtimeMinutes > 0 ? '#FF2E2E' : '#3E4E60',
    },
    {
      icon: '⭐',
      label: 'PRESTIGE',
      value: formatNumber(prestigeLevel),
      color: prestigeLevel > 0 ? '#FFB800' : '#3E4E60',
    },
  ];

  return (
    <div style={{ fontFamily: '"JetBrains Mono", monospace' }}>
      {/* Section 1: WPS Sparkline */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={headerStyle}>PRODUCTIVITY INDEX</p>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '16px',
              color: '#00FF66',
              textShadow: '0 0 6px rgba(0, 255, 102, 0.4)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {isIdle ? '' : formatNumber(wpPerSecond)}
          </span>
        </div>
        <div style={{ position: 'relative', width: '100%', height: '50px' }}>
          <svg
            width="100%"
            height="50"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            style={{ display: 'block' }}
          >
            <defs>
              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB80022" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {sparklineData.length > 1 && !isIdle && (
              <>
                <polygon
                  points={areaPoints}
                  fill="url(#sparkFill)"
                />
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#FFB800"
                  strokeWidth="1.5"
                />
              </>
            )}
            {(sparklineData.length <= 1 || isIdle) && (
              <line
                x1="0"
                y1={svgHeight - 2}
                x2={svgWidth}
                y2={svgHeight - 2}
                stroke="#3E4E60"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
            )}
          </svg>
          {isIdle && (
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '11px',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#3E4E60',
                letterSpacing: '3px',
              }}
            >
              IDLE
            </span>
          )}
        </div>
      </div>

      {/* Section 2: Corporate Mood Meter */}
      <div style={{ marginBottom: '12px' }}>
        <p style={headerStyle}>MORALE STATUS</p>
        <div
          style={{
            display: 'flex',
            gap: '3px',
            marginBottom: '4px',
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '18%',
                height: '8px',
                borderRadius: '1px',
                backgroundColor: i < filledSegments ? moodColor : '#1A2230',
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontSize: '11px',
            fontFamily: '"JetBrains Mono", monospace',
            color: moodColor,
          }}
        >
          {moodLabel}
        </span>
      </div>

      {/* Section 3: Shift Milestones */}
      <div>
        <p style={headerStyle}>MILESTONES</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
          }}
        >
          {milestones.map((m) => (
            <div
              key={m.label}
              style={{
                backgroundColor: '#111820',
                width: '60px',
                height: '52px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>{m.icon}</span>
              <span
                style={{
                  fontSize: '14px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontVariantNumeric: 'tabular-nums',
                  color: m.color,
                  lineHeight: 1,
                }}
              >
                {m.value}
              </span>
              <span
                style={{
                  fontSize: '8px',
                  fontFamily: '"JetBrains Mono", monospace',
                  textTransform: 'uppercase',
                  color: '#3E4E60',
                  lineHeight: 1,
                }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductivityPulse;
