import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { compareSitioNames } from '../../../../../utils/sitioOrder';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Households per Sitio',
      font: { size: 16, weight: '600' },
      color: '#111827',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#6b7280',
        font: { size: 12 },
      },
    },
    y: {
      beginAtZero: true,
      max: 225,
      ticks: {
        stepSize: 75,
        color: '#6b7280',
        font: { size: 12 },
      },
      grid: {
        color: '#f3f4f6',
      },
    },
  },
};

const TOP_FILL = 'rgba(140, 11, 26, 0.88)';
const TOP_BORDER = '#8C0B1A';
const DEFAULT_FILL = 'rgba(134, 239, 172, 0.72)';
const DEFAULT_BORDER = '#22c55e';

function barStylesForCounts(counts) {
  if (!counts.length) {
    return { backgroundColor: DEFAULT_FILL, borderColor: DEFAULT_BORDER, borderWidth: 1 };
  }
  const maxVal = Math.max(...counts.map((n) => Number(n) || 0));
  const backgroundColor = counts.map((n) =>
    Number(n) === maxVal && maxVal > 0 ? TOP_FILL : DEFAULT_FILL
  );
  const borderColor = counts.map((n) =>
    Number(n) === maxVal && maxVal > 0 ? TOP_BORDER : DEFAULT_BORDER
  );
  const borderWidth = counts.map((n) => (Number(n) === maxVal && maxVal > 0 ? 2 : 1));
  return { backgroundColor, borderColor, borderWidth };
}

const getData = (filters, analyticsData) => {
  let labels = [];
  let data = [];

  if (analyticsData?.householdsPerPurok?.length) {
    const ordered = [...analyticsData.householdsPerPurok].sort((a, b) =>
      compareSitioNames(a.name, b.name)
    );
    labels = ordered.map((p) => p.name);
    data   = ordered.map((p) => p.count);
  }

  const barStyle = barStylesForCounts(data);

  return {
    labels,
    datasets: [
      {
        data,
        ...barStyle,
      },
    ],
  };
};

export default function HouseholdsPerPurok({ filters, analyticsData }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    const chartData = getData(filters, analyticsData);
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options,
    });
    return () => chartRef.current?.destroy();
  }, [filters, analyticsData]);

  return (
    <div className="h-[280px] w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
}

