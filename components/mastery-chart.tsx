import { masteryTrend } from "@/lib/demo-data";

export function MasteryChart() {
  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 30, left: 34 };
  const min = 40;
  const max = 70;

  const points = masteryTrend.map((value, index) => {
    const x =
      padding.left +
      (index * (width - padding.left - padding.right)) /
        (masteryTrend.length - 1);
    const y =
      height -
      padding.bottom -
      ((value - min) / (max - min)) * (height - padding.top - padding.bottom);

    return { x, y, value };
  });

  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding.left},${height - padding.bottom} ${line} ${
    width - padding.right
  },${height - padding.bottom}`;

  const gridValues = [40, 50, 60, 70];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Average mastery trend over eight weeks: ${masteryTrend.join(
        "%,",
      )}%.`}
    >
      <defs>
        <linearGradient id="mastery-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A55F2" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7A55F2" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridValues.map((value) => {
        const y =
          height -
          padding.bottom -
          ((value - min) / (max - min)) *
            (height - padding.top - padding.bottom);

        return (
          <g key={value}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth="1"
              strokeDasharray={value === min ? "0" : "4 6"}
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#667085"
            >
              {value}%
            </text>
          </g>
        );
      })}

      <polygon points={area} fill="url(#mastery-fill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#7A55F2"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point, index) => (
        <g key={index}>
          <circle
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 5 : 3.5}
            fill={index === points.length - 1 ? "#552DB7" : "#FFFFFF"}
            stroke="#7A55F2"
            strokeWidth="2"
          />
          <text
            x={point.x}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#667085"
          >
            W{index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
