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
      text: 'ID Renewal Statistics (Last 6 Months)',
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
      max: 60,
      ticks: {
        stepSize: 10,
        color: '#6b7280',
        font: { size: 12 },
      },
      grid: {
        color: '#f3f4f6',
      },
    },
  },
};

// Real data: analyticsData.eidRenewal = { labels: string[], data: number[] }
// For daily/weekly dateRange, the DB doesn't have the granularity — keep original mocks.
const getData = (filters, analyticsData) => {
  const dateRange = filters?.dateRange || 'last30';

  // Use real monthly data for last30 (default) and any non-daily/weekly range
  if (analyticsData?.eidRenewal && dateRange !== 'daily' && dateRange !== 'weekly') {
    return {
      labels: analyticsData.eidRenewal.labels,
      datasets: [
        {
          data: analyticsData.eidRenewal.data,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: true,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    };
  }

  // Mock fallback for daily / weekly (no DB columns for this granularity)
  let labels, data;
  if (dateRange === 'daily') {
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    data   = [12, 15, 18, 14, 16, 13, 10];
  } else if (dateRange === 'weekly') {
    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    data   = [45, 52, 48, 55];
  } else {
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    data   = [45, 38, 52, 58, 48, 58];
  }

  return {
    labels,
    datasets: [
      {
        data,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };
};

export default function IdRenewalStatistics({ filters, analyticsData }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    const chartData = getData(filters, analyticsData);
    chartRef.current = new Chart(ctx, {
      type: 'line',
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