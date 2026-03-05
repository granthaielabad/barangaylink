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
      text: 'Population by Age Group',
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
      max: 1200,
      ticks: {
        stepSize: 400,
        color: '#6b7280',
        font: { size: 12 },
      },
      grid: {
        color: '#f3f4f6',
      },
    },
  },
};

// Real data: analyticsData.ageGroups = { children, youth, adults, seniorCitizens }
// Falls back to original mock formula when analyticsData is not yet loaded.
const getData = (filters, analyticsData) => {
  let data;

  if (analyticsData?.ageGroups) {
    const { children, youth, adults, seniorCitizens } = analyticsData.ageGroups;
    data = [children, youth, adults, seniorCitizens];
  } else {
    const year       = parseInt(filters?.year || new Date().getFullYear(), 10);
    const yearOffset = year - new Date().getFullYear();
    const baseData   = [780, 920, 1189, 355];
    data = baseData.map((val) => Math.max(0, Math.round(val + yearOffset * 20)));
  }

  return {
    labels: ['Children', 'Youth', 'Adults', 'Senior Citizens'],
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

export default function PopulationByAgeGroup({ filters, analyticsData }) {
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