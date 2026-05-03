import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#374151',
        font: { size: 12 },
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    title: {
      display: true,
      text: 'Active vs Inactive',
      font: { size: 16, weight: '600' },
      color: '#111827',
    },
  },
};

const getData = (filters, analyticsData) => {
  let active = 0, inactive = 0;

  if (analyticsData?.eidStatus) {
    active   = analyticsData.eidStatus.active;
    inactive = analyticsData.eidStatus.inactive;
  }

  return {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [active, inactive],
        backgroundColor: ['#22c55e', '#86efac'],
        borderColor: ['#22c55e', '#86efac'],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };
};

export default function ActiveVsInactive({ filters, analyticsData }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    const chartData = getData(filters, analyticsData);
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
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

