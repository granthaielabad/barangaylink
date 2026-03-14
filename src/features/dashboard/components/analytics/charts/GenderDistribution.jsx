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
      text: 'Gender Distribution',
      font: { size: 16, weight: '600' },
      color: '#111827',
    },
  },
};

// Real data: analyticsData.gender = { male: number, female: number }
// Falls back to original mock formula when analyticsData is not yet loaded.
const getData = (filters, analyticsData) => {
  let male, female;

  if (analyticsData?.gender) {
    male   = analyticsData.gender.male;
    female = analyticsData.gender.female;
  } else {
    const year       = parseInt(filters?.year || new Date().getFullYear(), 10);
    const yearOffset = year - new Date().getFullYear();
    const baseMale   = 49.6;
    male   = Math.max(45, Math.min(55, baseMale + yearOffset * 0.1));
    female = 100 - male;
  }

  return {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [male, female],
        backgroundColor: ['#22c55e', '#86efac'],
        borderColor: ['#22c55e', '#86efac'],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };
};

export default function GenderDistribution({ filters, analyticsData }) {
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