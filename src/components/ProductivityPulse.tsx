import React, { useState, useEffect, useRef } from 'react';
import { STATIONS } from '../data/stations';
import { ACHIEVEMENTS } from '../data/achievements';

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
  stations: Record<string, number>;
  upgrades: string[];
  achievements: string[];
  startTime: number;
}

const formatNumber = (n: number): string => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(n % 1 === 0 ? 0 : 1);
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays > 0) {
    const h = totalHours % 24;
    return `${totalDays}d ${h}h`;
  }
  if (totalHours > 0) {
    const m = totalMinutes % 60;
    return `${totalHours}h ${m}m`;
  }
  return `${totalMinutes}m`;
};

const headerStyle: React.CSSProperties = {
  fontSize: '10px',
  fontFamily: '"JetBrains Mono", monospace',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  color: '#6A7A8A',
  margin: 0,
  marginBottom: '6px',
};

const monoNum: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  fontVariantNumeric: 'tabular-nums',
};

const ProductivityPulse: React.FC<ProductivityPulseProps> = ({
  wp,
  totalWp,
  wpPerSecond,
  wpPerClick,
  shiftsCompleted,
  overtimeMinutes,
  isOnShift,
  prestigeLevel,
  totalClicks,
  stations,
  upgrades,
  achievements,
  startTime,
}) => {
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const readingsRef = useRef<number[]>([]);
  const [now, setNow] = useState(Date.now());

  // Sparkline sampling every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      const readings = readingsRef.current;
      readings.push(wpPerSecond);
      if (readings.length > 30) readings.shift();
      setSparklineData([...readings]);
    }, 2000);
    return () => clearInterval(interval);
  }, [wpPerSecond]);

  // Live clock tick every 1s
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // === SECTION 1: WPS SPARKLINE ===
  const svgWidth = 300;
  const svgHeight = 60;
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

  // === SECTION 2: MORALE ===
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

  // === SECTION 3: WPS BREAKDOWN ===
  const stationContributions = STATIONS
    .filter((s) => (stations[s.id] || 0) > 0)
    .map((s) => ({
      icon: s.icon,
      name: s.name,
      wps: s.baseWps * (stations[s.id] || 0),
    }))
    .sort((a, b) => b.wps - a.wps)
    .slice(0, 5);
  const maxStationWps = stationContributions.length > 0 ? stationContributions[0].wps : 1;

  // === SECTION 4: NEXT UNLOCK PROGRESS ===
  const nextStation = STATIONS.find(
    (s) => (stations[s.id] || 0) === 0 && totalWp < s.unlockAt
  ) || STATIONS.find((s) => (stations[s.id] || 0) === 0);

  const nextAchievement = ACHIEVEMENTS.find((a) => !achievements.includes(a.id));

  const getAchievementProgress = (a: typeof ACHIEVEMENTS[0]): number => {
    const { type, value } = a.condition;
    let current = 0;
    if (type === 'total_clicks') current = totalClicks;
    else if (type === 'total_wp') current = totalWp;
    else if (type === 'wps') current = wpPerSecond;
    else if (type === 'shifts_completed') current = shiftsCompleted;
    else if (type === 'overtime_worked') current = overtimeMinutes;
    return Math.min(current / value, 1);
  };

  // === SECTION 5: SESSION STATS ===
  const sessionMs = Math.max(now - startTime, 1000);
  const sessionMinutes = sessionMs / 60000;
  const efficiency = wpPerSecond / Math.max(totalClicks, 1);
  const clickRate = totalClicks / Math.max(sessionMinutes, 1);
  const wpPerShift = totalWp / Math.max(shiftsCompleted, 1);

  const sessionStats = [
    { icon: '\uD83D\uDD50', label: 'TIME', value: formatTime(sessionMs) },
    { icon: '\uD83D\uDCC8', label: 'EFFICIENCY', value: formatNumber(efficiency) },
    { icon: '\u26A1', label: 'CLICK RATE', value: formatNumber(clickRate) + '/m' },
    { icon: '\uD83D\uDCCA', label: 'WP/SHIFT', value: formatNumber(wpPerShift) },
  ];

  return (
    <div
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflow: 'auto',
      }}
    >
      {/* Section 1: WPS Sparkline */}
      <div style={{ flexShrink: 0 }}>
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
              ...monoNum,
              fontSize: '16px',
              color: '#00FF66',
              textShadow: '0 0 6px rgba(0, 255, 102, 0.4)',
            }}
          >
            {isIdle ? '' : formatNumber(wpPerSecond)}
          </span>
        </div>
        <div style={{ position: 'relative', width: '100%', height: '60px' }}>
          <svg
            width="100%"
            height="60"
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
                <polygon points={areaPoints} fill="url(#sparkFill)" />
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
                stroke="#6A7A8A"
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
                ...monoNum,
                color: '#6A7A8A',
                letterSpacing: '3px',
              }}
            >
              IDLE
            </span>
          )}
        </div>
      </div>

      {/* Section 2: Morale Status */}
      <div style={{ flexShrink: 0 }}>
        <p style={headerStyle}>MORALE STATUS</p>
        <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
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
        <span style={{ fontSize: '11px', ...monoNum, color: moodColor }}>
          {moodLabel}
        </span>
      </div>

      {/* Section 3: WPS Breakdown */}
      <div style={{ flexShrink: 0 }}>
        <p style={headerStyle}>OUTPUT ANALYSIS</p>
        {stationContributions.length === 0 ? (
          <div
            style={{
              fontSize: '11px',
              ...monoNum,
              color: '#6A7A8A',
              padding: '4px 0',
            }}
          >
            No stations acquired
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {stationContributions.map((s) => (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '20px',
                }}
              >
                <span style={{ fontSize: '12px', width: '16px', textAlign: 'center', flexShrink: 0 }}>
                  {s.icon}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#9AA8B8',
                    width: '72px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.name}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '10px',
                    backgroundColor: '#1A2230',
                    borderRadius: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(s.wps / maxStationWps) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #FFB800, #FFD060)',
                      borderRadius: '1px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    ...monoNum,
                    color: '#FFB800',
                    width: '48px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {formatNumber(s.wps)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 4: Next Unlock Progress */}
      <div style={{ flexShrink: 0 }}>
        <p style={headerStyle}>NEXT TARGETS</p>
        {!nextStation && !nextAchievement ? (
          <div
            style={{
              fontSize: '11px',
              ...monoNum,
              color: '#00FF66',
              padding: '4px 0',
            }}
          >
            ALL TARGETS COMPLETE ✓
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nextStation && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '3px',
                  }}
                >
                  <span style={{ fontSize: '12px' }}>{nextStation.icon}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#9AA8B8',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {nextStation.name}
                  </span>
                  <span style={{ fontSize: '10px', ...monoNum, color: '#7A8899' }}>
                    {Math.min(
                      Math.floor((totalWp / Math.max(nextStation.unlockAt, 1)) * 100),
                      100
                    )}
                    %
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#1A2230',
                    borderRadius: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(
                        (totalWp / Math.max(nextStation.unlockAt, 1)) * 100,
                        100
                      )}%`,
                      height: '100%',
                      backgroundColor: '#FFB800',
                      borderRadius: '1px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}
            {nextAchievement && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '3px',
                  }}
                >
                  <span style={{ fontSize: '12px' }}>❓</span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#9AA8B8',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {nextAchievement.name}
                  </span>
                  <span style={{ fontSize: '10px', ...monoNum, color: '#7A8899' }}>
                    {Math.floor(getAchievementProgress(nextAchievement) * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#1A2230',
                    borderRadius: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${getAchievementProgress(nextAchievement) * 100}%`,
                      height: '100%',
                      backgroundColor: '#FFB800',
                      borderRadius: '1px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 5: Session Stats */}
      <div style={{ flexShrink: 0, flex: 1 }}>
        <p style={headerStyle}>SESSION DATA</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
          }}
        >
          {sessionStats.map((s) => (
            <div
              key={s.label}
              style={{
                backgroundColor: '#111820',
                padding: '8px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>{s.icon}</span>
              <span
                style={{
                  fontSize: '14px',
                  ...monoNum,
                  color: '#00FF66',
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
              <span
                style={{
                  fontSize: '8px',
                  ...monoNum,
                  textTransform: 'uppercase',
                  color: '#6A7A8A',
                  lineHeight: 1,
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductivityPulse;
