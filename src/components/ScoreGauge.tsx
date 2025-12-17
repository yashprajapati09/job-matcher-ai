import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 180 }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [score]);

  const getScoreColor = () => {
    if (score >= 85) return "hsl(var(--score-excellent))";
    if (score >= 70) return "hsl(var(--score-good))";
    if (score >= 50) return "hsl(var(--score-average))";
    if (score >= 30) return "hsl(var(--score-poor))";
    return "hsl(var(--score-reject))";
  };

  const getScoreLabel = () => {
    if (score >= 85) return "Excellent Match";
    if (score >= 70) return "Good Match";
    if (score >= 50) return "Average Match";
    if (score >= 30) return "Below Average";
    return "Poor Match";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${getScoreColor()})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-5xl font-bold transition-colors duration-300"
            style={{ color: getScoreColor() }}
          >
            {displayScore}
          </span>
          <span className="text-muted-foreground text-sm">/ 100</span>
        </div>
      </div>
      <span
        className="font-medium text-sm px-3 py-1 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: `${getScoreColor()}20`,
          color: getScoreColor(),
        }}
      >
        {getScoreLabel()}
      </span>
    </div>
  );
}
