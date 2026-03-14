// Real data: analyticsData.populationGrowth = [{ year, count }]
import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

export default function PopulationGrowth({ filters, analyticsData }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();

    const rows   = analyticsData?.populationGrowth ?? [];
    const labels = rows.map((r) => String(r.year));
    const values = rows.map((r) => Number(r.count));

    // Compute cumulative for a true "growth" line
    const cumulative = values.reduce((acc, v, i) => {
      acc.push((acc[i - 1] ?? 0) + v);
      return acc;
    }, []);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['No data'],
        datasets: [{
          label: 'Residents',
          data: cumulative.length ? cumulative : [0],
          borderColor: '#005F02',
          backgroundColor: 'rgba(0,95,2,0.08)',
          borderWidth: 2,
          fill: true,
          pointBackgroundColor: '#005F02',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Population Growth (Cumulative)',
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
  }, [analyticsData]);

  return (
    <div className="h-[260px] w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
}