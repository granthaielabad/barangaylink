import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const LIFE_STAGES = [
  'Toddlers', 'Children', 'Teenagers',
  'Young Adults', 'Middle-aged Adults', 'Senior Citizens',
];

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Population by Age Group',
      font: { size: 16, weight: '600' },
      color: '#111827',
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.parsed.y} resident${ctx.parsed.y !== 1 ? 's' : ''}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#6b7280', font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, color: '#6b7280', font: { size: 12 } },
      grid: { color: '#f3f4f6' },
    },
  },
};

function buildChartData(analyticsData) {
  const rows     = analyticsData?.ageGroups ?? [];
  const countMap = Object.fromEntries(rows.map((r) => [r.bracket, r.count]));
  return {
    labels: LIFE_STAGES,
    datasets: [{
      data:            LIFE_STAGES.map((s) => countMap[s] ?? 0),
      backgroundColor: '#86efac',
      borderColor:     '#22c55e',
      borderWidth:     1,
    }],
  };
}

export default function PopulationByAgeGroup({ filters, analyticsData }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: buildChartData(analyticsData),
      options: CHART_OPTIONS,
    });
    return () => chartRef.current?.destroy();
  }, [analyticsData]);

  return (
    <div className="h-[280px] w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
}