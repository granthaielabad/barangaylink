import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Households per Purok/Zone',
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

// Real data: analyticsData.householdsPerPurok = [{ name, count }, ...]
// Falls back to original mock data when analyticsData is not yet loaded.
const getData = (filters, analyticsData) => {
  let labels, data;

  if (analyticsData?.householdsPerPurok?.length) {
    labels = analyticsData.householdsPerPurok.map((p) => p.name);
    data   = analyticsData.householdsPerPurok.map((p) => p.count);
  } else {
    const year       = parseInt(filters?.year || new Date().getFullYear(), 10);
    const yearOffset = year - new Date().getFullYear();
    const baseData   = [130, 155, 120, 140, 110, 157];
    labels = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'];
    data   = baseData.map((val) => Math.max(0, Math.round(val + yearOffset * 5)));
  }

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: '#86efac',
        borderColor: '#22c55e',
        borderWidth: 1,
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