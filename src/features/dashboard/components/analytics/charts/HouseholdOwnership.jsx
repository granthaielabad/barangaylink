import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 12 },
      },
    },
    title: {
      display: true,
      text: 'Ownership Type Distribution',
      font: { size: 16, weight: '600' },
      color: '#111827',
    },
  },
};

const getData = (analyticsData) => {
  const labels = analyticsData?.householdOwnership?.labels || ['Owned', 'Rented', 'Shared', 'Informal Settler'];
  const data   = analyticsData?.householdOwnership?.data   || [0, 0, 0, 0];

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          '#60a5fa', // blue-400
          '#fbbf24', // amber-400
          '#f87171', // red-400
          '#a78bfa', // purple-400
        ],
        hoverOffset: 4,
      },
    ],
  };
};

export default function HouseholdOwnership({ analyticsData }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();

    const chartData = getData(analyticsData);
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options,
    });

    return () => chartRef.current?.destroy();
  }, [analyticsData]);

  return (
    <div className="h-[280px] w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
}
