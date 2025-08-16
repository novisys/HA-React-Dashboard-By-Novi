// Chart.tsx corrigé avec types TypeScript

interface ChartProps {
  type?: 'line' | 'bar' | 'area';
  data?: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

function Chart({ type = 'line', data = [], width = 200, height = 100, color = 'white', strokeWidth = 2, className = '' }: ChartProps) {
  const generatePath = (points: number[]): string => {
    if (points.length === 0) return '';

    const maxY = Math.max(...points);
    const minY = Math.min(...points);
    const range = maxY - minY || 1;

    const path = points
      .map((point: number, index: number) => {
        const x = (index / (points.length - 1)) * width;
        const y = height - ((point - minY) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return path;
  };

  return (
    <div className={`chart chart--${type} ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className='chart-svg'>
        {type === 'line' && <path d={generatePath(data)} stroke={color} strokeWidth={strokeWidth} fill='none' opacity={0.9} />}
      </svg>
    </div>
  );
}

export default Chart;
