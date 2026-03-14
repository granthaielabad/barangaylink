// Real data: analyticsData.residentsByMonth = { labels: string[], data: number[] }
import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const buildData = (analyticsData) => {
  const monthMap = {};
  (analyticsData?.residentsByMonth ?? []).forEach(({ month, count }) => {
    monthMap[month] = count;
  });
  return MONTH_LABELS.map((_, i) => monthMap[i + 1] ?? 0);
};

export default function NewResidentsPerYear({ filters, analyticsData }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();

    const values = buildData(analyticsData);

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MONTH_LABELS,
        datasets: [{
          label: 'New Residents',
          data: values,
          backgroundColor: 'rgba(0, 95, 2, 0.75)',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `New Residents — ${filters?.year ?? new Date().getFullYear()}`,
            font: { size: 14, weight: '600' },
            color: '#111827',
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
          y: { beginAtZero: true, ticks: { color: '#6b7280', font: { size: 11 } }, grid: { color: '#f3f4f6' } },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [filters, analyticsData]);

  return (
    <div className="h-[260px] w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
}